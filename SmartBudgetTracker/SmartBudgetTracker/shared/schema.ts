import { pgTable, text, serial, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Transaction schema (includes both expenses and income)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  isExpense: boolean("is_expense").notNull(),
  userId: integer("user_id").notNull(), // Can be linked to users table in future
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Budget schema
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  amount: numeric("amount").notNull(),
  userId: integer("user_id").notNull(),
  period: text("period").notNull(), // monthly, quarterly, yearly
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

// Extended schemas with validation
export const extendedTransactionSchema = insertTransactionSchema.extend({
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(),
});

export const extendedBudgetSchema = insertBudgetSchema.extend({
  amount: z.coerce.number().positive("Budget amount must be positive"),
  category: z.string().min(1, "Category is required"),
  period: z.enum(["monthly", "quarterly", "yearly"], {
    errorMap: () => ({ message: "Period must be monthly, quarterly, or yearly" }),
  }),
});

// Category constants
export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills & Utilities",
  "Health & Fitness",
  "Travel",
  "Education",
  "Personal Care",
  "Other"
];

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Refund",
  "Other"
];
