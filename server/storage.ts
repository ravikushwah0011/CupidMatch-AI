import { 
  users, type User, type InsertUser,
  matches, type Match, type InsertMatch,
  messages, type Message, type InsertMessage,
  videoCalls, type VideoCall, type InsertVideoCall,
  aiSuggestions, type AiSuggestion, type InsertAiSuggestion
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, not, desc, isNull } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Match methods
  getMatch(id: number): Promise<Match | undefined>;
  getMatchesByUser(userId: number): Promise<Match[]>;
  getPotentialMatches(userId: number): Promise<User[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatchStatus(id: number, status: string): Promise<Match | undefined>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByMatch(matchId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // VideoCall methods
  getVideoCall(id: number): Promise<VideoCall | undefined>;
  getVideoCallsByMatch(matchId: number): Promise<VideoCall[]>;
  createVideoCall(videoCall: InsertVideoCall): Promise<VideoCall>;
  updateVideoCallStatus(id: number, status: string, duration?: number): Promise<VideoCall | undefined>;
  
  // AiSuggestion methods
  getAiSuggestion(id: number): Promise<AiSuggestion | undefined>;
  getAiSuggestionsByUser(userId: number, suggestionType?: string): Promise<AiSuggestion[]>;
  createAiSuggestion(aiSuggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  markAiSuggestionAsUsed(id: number): Promise<AiSuggestion | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      bio: insertUser.bio || null,
      occupation: insertUser.occupation || null,
      education: insertUser.education || null,
      profileVideoUrl: insertUser.profileVideoUrl || null
    }).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Match methods
  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async getMatchesByUser(userId: number): Promise<Match[]> {
    return await db.select()
      .from(matches)
      .where(or(
        eq(matches.userId1, userId),
        eq(matches.userId2, userId)
      ));
  }

  async getPotentialMatches(userId: number): Promise<User[]> {
    // Get all matches where this user is involved
    const userMatches = await this.getMatchesByUser(userId);
    
    // Extract IDs of users that are already matched
    const matchedUserIds = userMatches.map(match => 
      match.userId1 === userId ? match.userId2 : match.userId1
    );
    
    // Add current user ID to exclude list
    matchedUserIds.push(userId);
    
    // If there are no matchedUserIds (only the current user), we need a simpler query
    if (matchedUserIds.length === 1) {
      return await db.select()
        .from(users)
        .where(not(eq(users.id, userId)));
    }
    
    // Get all users not in the exclude list
    return await db.select()
      .from(users)
      .where(not(eq(users.id, userId)))
      .where(builder => {
        for (const id of matchedUserIds.filter(id => id !== userId)) {
          builder.and(not(eq(users.id, id)));
        }
        return builder;
      });
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values({
      userId1: insertMatch.userId1,
      userId2: insertMatch.userId2,
      status: insertMatch.status,
      compatibilityScore: insertMatch.compatibilityScore || null
    }).returning();
    return match;
  }

  async updateMatchStatus(id: number, status: string): Promise<Match | undefined> {
    const [updatedMatch] = await db.update(matches)
      .set({ status })
      .where(eq(matches.id, id))
      .returning();
    return updatedMatch;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByMatch(matchId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // VideoCall methods
  async getVideoCall(id: number): Promise<VideoCall | undefined> {
    const [videoCall] = await db.select().from(videoCalls).where(eq(videoCalls.id, id));
    return videoCall;
  }

  async getVideoCallsByMatch(matchId: number): Promise<VideoCall[]> {
    return await db.select()
      .from(videoCalls)
      .where(eq(videoCalls.matchId, matchId))
      .orderBy(videoCalls.scheduledTime);
  }

  async createVideoCall(insertVideoCall: InsertVideoCall): Promise<VideoCall> {
    const [videoCall] = await db.insert(videoCalls).values({
      matchId: insertVideoCall.matchId,
      status: insertVideoCall.status,
      scheduledTime: insertVideoCall.scheduledTime || null,
      duration: null
    }).returning();
    return videoCall;
  }

  async updateVideoCallStatus(id: number, status: string, duration?: number): Promise<VideoCall | undefined> {
    const updateData: Partial<VideoCall> = { status };
    if (duration !== undefined) {
      updateData.duration = duration;
    }
    
    const [updatedVideoCall] = await db.update(videoCalls)
      .set(updateData)
      .where(eq(videoCalls.id, id))
      .returning();
    return updatedVideoCall;
  }

  // AiSuggestion methods
  async getAiSuggestion(id: number): Promise<AiSuggestion | undefined> {
    const [aiSuggestion] = await db.select().from(aiSuggestions).where(eq(aiSuggestions.id, id));
    return aiSuggestion;
  }

  async getAiSuggestionsByUser(userId: number, suggestionType?: string): Promise<AiSuggestion[]> {
    if (suggestionType) {
      return await db.select()
        .from(aiSuggestions)
        .where(and(
          eq(aiSuggestions.userId, userId),
          eq(aiSuggestions.suggestionType, suggestionType)
        ));
    }
    
    return await db.select()
      .from(aiSuggestions)
      .where(eq(aiSuggestions.userId, userId));
  }

  async createAiSuggestion(insertAiSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const [aiSuggestion] = await db.insert(aiSuggestions)
      .values({
        ...insertAiSuggestion,
        isUsed: false
      })
      .returning();
    return aiSuggestion;
  }

  async markAiSuggestionAsUsed(id: number): Promise<AiSuggestion | undefined> {
    const [updatedAiSuggestion] = await db.update(aiSuggestions)
      .set({ isUsed: true })
      .where(eq(aiSuggestions.id, id))
      .returning();
    return updatedAiSuggestion;
  }
}

// Use the DatabaseStorage implementation
export const storage = new DatabaseStorage();
