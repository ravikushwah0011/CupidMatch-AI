import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  profileName: text("profile_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  location: text("location").notNull(),
  bio: text("bio"),
  occupation: text("occupation"),
  education: text("education"),
  lookingFor: text("looking_for").notNull(),
  interests: text("interests").array().notNull(),
  profileVideoUrl: text("profile_video_url"),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  userId1: integer("user_id_1").notNull(),
  userId2: integer("user_id_2").notNull(),
  status: text("status").notNull(), // "pending", "matched", "rejected"
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  compatibilityScore: integer("compatibility_score"), // AI-generated score
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const videoCalls = pgTable("video_calls", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  scheduledTime: timestamp("scheduled_time"),
  status: text("status").notNull(), // "scheduled", "completed", "cancelled"
  duration: integer("duration"), // in seconds
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  suggestionType: text("suggestion_type").notNull(), // "conversation_starter", "date_idea", "profile_tip", etc.
  content: text("content").notNull(),
  isUsed: boolean("is_used").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  profileName: true,
  age: true,
  gender: true,
  location: true,
  bio: true,
  occupation: true,
  education: true,
  lookingFor: true,
  interests: true,
  profileVideoUrl: true,
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  userId1: true,
  userId2: true,
  status: true,
  compatibilityScore: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  matchId: true,
  senderId: true,
  content: true,
});

export const insertVideoCallSchema = createInsertSchema(videoCalls).pick({
  matchId: true,
  scheduledTime: true,
  status: true,
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).pick({
  userId: true,
  suggestionType: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertVideoCall = z.infer<typeof insertVideoCallSchema>;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;

export type User = typeof users.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type VideoCall = typeof videoCalls.$inferSelect;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
