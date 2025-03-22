import { 
  users, type User, type InsertUser,
  matches, type Match, type InsertMatch,
  messages, type Message, type InsertMessage,
  videoCalls, type VideoCall, type InsertVideoCall,
  aiSuggestions, type AiSuggestion, type InsertAiSuggestion
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matches: Map<number, Match>;
  private messages: Map<number, Message>;
  private videoCalls: Map<number, VideoCall>;
  private aiSuggestions: Map<number, AiSuggestion>;
  
  private userIdCounter: number;
  private matchIdCounter: number;
  private messageIdCounter: number;
  private videoCallIdCounter: number;
  private aiSuggestionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.matches = new Map();
    this.messages = new Map();
    this.videoCalls = new Map();
    this.aiSuggestions = new Map();
    
    this.userIdCounter = 1;
    this.matchIdCounter = 1;
    this.messageIdCounter = 1;
    this.videoCallIdCounter = 1;
    this.aiSuggestionIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Match methods
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchesByUser(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.userId1 === userId || match.userId2 === userId
    );
  }

  async getPotentialMatches(userId: number): Promise<User[]> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) return [];
    
    // Get IDs of users that are already matched or rejected
    const existingMatchIds = new Set<number>();
    const userMatches = await this.getMatchesByUser(userId);
    
    userMatches.forEach(match => {
      if (match.userId1 === userId) {
        existingMatchIds.add(match.userId2);
      } else {
        existingMatchIds.add(match.userId1);
      }
    });
    
    // Filter out the current user and already matched/rejected users
    return Array.from(this.users.values()).filter(
      (user) => user.id !== userId && !existingMatchIds.has(user.id)
    );
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.matchIdCounter++;
    const timestamp = new Date();
    const match: Match = { ...insertMatch, id, timestamp };
    this.matches.set(id, match);
    return match;
  }

  async updateMatchStatus(id: number, status: string): Promise<Match | undefined> {
    const match = await this.getMatch(id);
    if (!match) return undefined;
    
    const updatedMatch: Match = { ...match, status };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByMatch(matchId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.matchId === matchId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const timestamp = new Date();
    const message: Message = { ...insertMessage, id, timestamp };
    this.messages.set(id, message);
    return message;
  }

  // VideoCall methods
  async getVideoCall(id: number): Promise<VideoCall | undefined> {
    return this.videoCalls.get(id);
  }

  async getVideoCallsByMatch(matchId: number): Promise<VideoCall[]> {
    return Array.from(this.videoCalls.values())
      .filter(videoCall => videoCall.matchId === matchId)
      .sort((a, b) => {
        if (a.scheduledTime && b.scheduledTime) {
          return a.scheduledTime.getTime() - b.scheduledTime.getTime();
        }
        return 0;
      });
  }

  async createVideoCall(insertVideoCall: InsertVideoCall): Promise<VideoCall> {
    const id = this.videoCallIdCounter++;
    const videoCall: VideoCall = { ...insertVideoCall, id, duration: null };
    this.videoCalls.set(id, videoCall);
    return videoCall;
  }

  async updateVideoCallStatus(id: number, status: string, duration?: number): Promise<VideoCall | undefined> {
    const videoCall = await this.getVideoCall(id);
    if (!videoCall) return undefined;
    
    const updatedVideoCall: VideoCall = { 
      ...videoCall, 
      status,
      ...(duration !== undefined && { duration })
    };
    this.videoCalls.set(id, updatedVideoCall);
    return updatedVideoCall;
  }

  // AiSuggestion methods
  async getAiSuggestion(id: number): Promise<AiSuggestion | undefined> {
    return this.aiSuggestions.get(id);
  }

  async getAiSuggestionsByUser(userId: number, suggestionType?: string): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values())
      .filter(suggestion => {
        if (suggestion.userId !== userId) return false;
        if (suggestionType && suggestion.suggestionType !== suggestionType) return false;
        return true;
      });
  }

  async createAiSuggestion(insertAiSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = this.aiSuggestionIdCounter++;
    const aiSuggestion: AiSuggestion = { ...insertAiSuggestion, id, isUsed: false };
    this.aiSuggestions.set(id, aiSuggestion);
    return aiSuggestion;
  }

  async markAiSuggestionAsUsed(id: number): Promise<AiSuggestion | undefined> {
    const aiSuggestion = await this.getAiSuggestion(id);
    if (!aiSuggestion) return undefined;
    
    const updatedAiSuggestion: AiSuggestion = { ...aiSuggestion, isUsed: true };
    this.aiSuggestions.set(id, updatedAiSuggestion);
    return updatedAiSuggestion;
  }
}

export const storage = new MemStorage();
