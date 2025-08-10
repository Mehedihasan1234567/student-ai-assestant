import { pgTable, serial, text, timestamp, varchar, json, integer } from "drizzle-orm/pg-core";

// Main notes table for uploaded PDFs
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI-generated summaries
export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").references(() => notes.id),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  keyPoints: json("key_points"), // Array of key points
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI-generated quizzes
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").references(() => notes.id),
  title: text("title").notNull(),
  questions: json("questions").notNull(), // Array of question objects
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quiz attempts/results
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answers: json("answers"), // User's answers
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Study history tracking
export const studyHistory = pgTable("study_history", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").references(() => notes.id),
  action: varchar("action", { length: 50 }).notNull(), // 'upload', 'summary', 'quiz', 'review'
  details: json("details"), // Additional metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
