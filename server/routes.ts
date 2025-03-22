import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertMatchSchema, 
  insertMessageSchema, 
  insertVideoCallSchema
} from "@shared/schema";
import { 
  generateUserProfile, 
  generateConversationStarters, 
  generateVideoDateTips, 
  suggestOptimalTimes, 
  calculateMatchCompatibility 
} from "./gemini";
import session from "express-session";
import MemoryStoreFactory from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";

// Connection mapping for WebSockets
interface Connection {
  userId: number;
  socket: WebSocket;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const MemoryStore = MemoryStoreFactory(session);
  
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "matchai-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, (user as any).id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id as number);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const connections: Connection[] = [];

  wss.on('connection', (ws) => {
    let userId: number | null = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'auth' && data.userId) {
          userId = data.userId;
          // Add to connections
          connections.push({ userId, socket: ws });
          console.log(`User ${userId} connected via WebSocket`);
        }
        
        // Handle chat messages
        if (data.type === 'message' && userId && data.matchId && data.content) {
          const newMessage = await storage.createMessage({
            matchId: data.matchId,
            senderId: userId,
            content: data.content
          });
          
          // Get match to find recipient
          const match = await storage.getMatch(data.matchId);
          if (match) {
            const recipientId = match.userId1 === userId ? match.userId2 : match.userId1;
            
            // Find recipient's connection and send message
            const recipientConn = connections.find(conn => conn.userId === recipientId);
            if (recipientConn && recipientConn.socket.readyState === WebSocket.OPEN) {
              recipientConn.socket.send(JSON.stringify({
                type: 'new_message',
                message: newMessage
              }));
            }
            
            // Send confirmation to sender
            ws.send(JSON.stringify({
              type: 'message_sent',
              message: newMessage
            }));
          }
        }
        
        // Handle video call signaling
        if (data.type === 'video_signal' && userId && data.targetUserId && data.signal) {
          const targetConn = connections.find(conn => conn.userId === data.targetUserId);
          if (targetConn && targetConn.socket.readyState === WebSocket.OPEN) {
            targetConn.socket.send(JSON.stringify({
              type: 'video_signal',
              fromUserId: userId,
              signal: data.signal
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        // Remove from connections
        const index = connections.findIndex(conn => conn.userId === userId);
        if (index !== -1) {
          connections.splice(index, 1);
          console.log(`User ${userId} disconnected from WebSocket`);
        }
      }
    });
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log('Registration request body:', req.body);
      const userData = insertUserSchema.parse(req.body);
      console.log('Parsed user data:', userData);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      req.login(user, (err) => {
        if (err) {
          console.error('Error during login after registration:', err);
          return res.status(500).json({ message: "Error during login after registration" });
        }
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Error registering user", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // AI Profile Generation
  app.post('/api/ai/generate-profile', async (req, res) => {
    try {
      const userInputs = req.body;
      const profileSuggestion = await generateUserProfile(userInputs);
      res.json(profileSuggestion);
    } catch (error) {
      res.status(500).json({ message: "Error generating profile" });
    }
  });

  // User routes
  app.get('/api/users/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user" });
    }
  });

  app.patch('/api/users/:id', async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).id !== parseInt(req.params.id)) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    try {
      const updateData = req.body;
      const updatedUser = await storage.updateUser(parseInt(req.params.id), updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Match routes
  app.get('/api/matches/potential', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = (req.user as any).id;
      const potentialMatches = await storage.getPotentialMatches(userId);
      
      // Remove passwords from response
      const matchesWithoutPassword = potentialMatches.map(match => {
        const { password, ...matchWithoutPassword } = match;
        return matchWithoutPassword;
      });
      
      res.json(matchesWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving potential matches" });
    }
  });

  app.get('/api/matches', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = (req.user as any).id;
      const matches = await storage.getMatchesByUser(userId);
      
      // Enhance matches with user info
      const enhancedMatches = await Promise.all(matches.map(async match => {
        const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
        const otherUser = await storage.getUser(otherUserId);
        
        if (!otherUser) {
          return { ...match, otherUser: null };
        }
        
        // Remove password from other user
        const { password, ...otherUserWithoutPassword } = otherUser;
        
        return { ...match, otherUser: otherUserWithoutPassword };
      }));
      
      res.json(enhancedMatches);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving matches" });
    }
  });

  app.post('/api/matches', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const matchData = insertMatchSchema.parse(req.body);
      
      // Verify that the current user is either userId1 or userId2
      const userId = (req.user as any).id;
      if (matchData.userId1 !== userId && matchData.userId2 !== userId) {
        return res.status(401).json({ message: "Not authorized to create this match" });
      }
      
      // Get both users to calculate compatibility
      const user1 = await storage.getUser(matchData.userId1);
      const user2 = await storage.getUser(matchData.userId2);
      
      if (!user1 || !user2) {
        return res.status(404).json({ message: "One or both users not found" });
      }
      
      // Calculate compatibility score
      const compatibility = await calculateMatchCompatibility(user1, user2);
      matchData.compatibilityScore = compatibility.score;
      
      const match = await storage.createMatch(matchData);
      res.status(201).json({ ...match, compatibilityReasons: compatibility.reasons });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid match data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating match" });
    }
  });

  app.patch('/api/matches/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const matchId = parseInt(req.params.id);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify that the current user is either userId1 or userId2
      const userId = (req.user as any).id;
      if (match.userId1 !== userId && match.userId2 !== userId) {
        return res.status(401).json({ message: "Not authorized to update this match" });
      }
      
      const { status } = req.body;
      if (!status || !['pending', 'matched', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedMatch = await storage.updateMatchStatus(matchId, status);
      res.json(updatedMatch);
    } catch (error) {
      res.status(500).json({ message: "Error updating match" });
    }
  });

  // Message routes
  app.get('/api/matches/:matchId/messages', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const matchId = parseInt(req.params.matchId);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify that the current user is either userId1 or userId2
      const userId = (req.user as any).id;
      if (match.userId1 !== userId && match.userId2 !== userId) {
        return res.status(401).json({ message: "Not authorized to view these messages" });
      }
      
      const messages = await storage.getMessagesByMatch(matchId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving messages" });
    }
  });

  app.post('/api/matches/:matchId/messages', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const matchId = parseInt(req.params.matchId);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify that the current user is either userId1 or userId2
      const userId = (req.user as any).id;
      if (match.userId1 !== userId && match.userId2 !== userId) {
        return res.status(401).json({ message: "Not authorized to send messages in this match" });
      }
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        matchId,
        senderId: userId
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Error sending message" });
    }
  });

  // Conversation starters
  app.get('/api/matches/:matchId/conversation-starters', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const matchId = parseInt(req.params.matchId);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify that the current user is either userId1 or userId2
      const userId = (req.user as any).id;
      if (match.userId1 !== userId && match.userId2 !== userId) {
        return res.status(401).json({ message: "Not authorized to access this match" });
      }
      
      // Get other user ID
      const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
      
      // Get both users
      const currentUser = await storage.getUser(userId);
      const otherUser = await storage.getUser(otherUserId);
      
      if (!currentUser || !otherUser) {
        return res.status(404).json({ message: "One or both users not found" });
      }
      
      // Generate conversation starters
      const starters = await generateConversationStarters(
        currentUser.interests, 
        otherUser.interests,
        otherUser.profileName
      );
      
      res.json(starters);
    } catch (error) {
      res.status(500).json({ message: "Error generating conversation starters" });
    }
  });

  // Video call routes
  app.get('/api/matches/:matchId/video-calls', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const matchId = parseInt(req.params.matchId);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify that the current user is either userId1 or userId2
      const userId = (req.user as any).id;
      if (match.userId1 !== userId && match.userId2 !== userId) {
        return res.status(401).json({ message: "Not authorized to view video calls for this match" });
      }
      
      const videoCalls = await storage.getVideoCallsByMatch(matchId);
      res.json(videoCalls);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving video calls" });
    }
  });

  app.post('/api/matches/:matchId/video-calls', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const matchId = parseInt(req.params.matchId);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify that the current user is either userId1 or userId2
      const userId = (req.user as any).id;
      if (match.userId1 !== userId && match.userId2 !== userId) {
        return res.status(401).json({ message: "Not authorized to schedule video calls for this match" });
      }
      
      const videoCallData = insertVideoCallSchema.parse({
        ...req.body,
        matchId,
        status: "scheduled"
      });
      
      const videoCall = await storage.createVideoCall(videoCallData);
      res.status(201).json(videoCall);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video call data", errors: error.errors });
      }
      res.status(500).json({ message: "Error scheduling video call" });
    }
  });

  app.patch('/api/video-calls/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const videoCallId = parseInt(req.params.id);
      const videoCall = await storage.getVideoCall(videoCallId);
      
      if (!videoCall) {
        return res.status(404).json({ message: "Video call not found" });
      }
      
      // Get match to verify authorization
      const match = await storage.getMatch(videoCall.matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify that the current user is either userId1 or userId2
      const userId = (req.user as any).id;
      if (match.userId1 !== userId && match.userId2 !== userId) {
        return res.status(401).json({ message: "Not authorized to update this video call" });
      }
      
      const { status, duration } = req.body;
      if (!status || !['scheduled', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedVideoCall = await storage.updateVideoCallStatus(videoCallId, status, duration);
      res.json(updatedVideoCall);
    } catch (error) {
      res.status(500).json({ message: "Error updating video call" });
    }
  });

  // Video date tips
  app.get('/api/matches/:matchId/video-date-tips', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const matchId = parseInt(req.params.matchId);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Verify that the current user is either userId1 or userId2
      const userId = (req.user as any).id;
      if (match.userId1 !== userId && match.userId2 !== userId) {
        return res.status(401).json({ message: "Not authorized to access this match" });
      }
      
      // Get other user ID
      const otherUserId = match.userId1 === userId ? match.userId2 : match.userId1;
      
      // Get both users
      const currentUser = await storage.getUser(userId);
      const otherUser = await storage.getUser(otherUserId);
      
      if (!currentUser || !otherUser) {
        return res.status(404).json({ message: "One or both users not found" });
      }
      
      // Generate video date tips
      const tips = await generateVideoDateTips(currentUser, otherUser);
      
      res.json(tips);
    } catch (error) {
      res.status(500).json({ message: "Error generating video date tips" });
    }
  });

  // Optimal time suggestions
  app.get('/api/optimal-times', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const times = await suggestOptimalTimes();
      res.json(times);
    } catch (error) {
      res.status(500).json({ message: "Error suggesting optimal times" });
    }
  });

  return httpServer;
}
