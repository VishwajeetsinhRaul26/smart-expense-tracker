import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from 'zod-validation-error';
import { 
  insertTransactionSchema, 
  extendedTransactionSchema,
  insertBudgetSchema,
  extendedBudgetSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Default userId for in-memory storage (in a real app, this would come from auth)
  const DEFAULT_USER_ID = 1;
  
  // Error handling middleware
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  };
  
  // Transaction routes
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getTransactions(DEFAULT_USER_ID);
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  
  app.get("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });
  
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const validatedData = extendedTransactionSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.put("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const validatedData = extendedTransactionSchema.partial().parse(req.body);
      const updatedTransaction = await storage.updateTransaction(id, validatedData);
      
      res.json(updatedTransaction);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.delete("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTransaction(id);
      
      if (!success) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });
  
  // Budget routes
  app.get("/api/budgets", async (req: Request, res: Response) => {
    try {
      const budgets = await storage.getBudgets(DEFAULT_USER_ID);
      res.json(budgets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });
  
  app.get("/api/budgets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const budget = await storage.getBudgetById(id);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      res.json(budget);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });
  
  app.post("/api/budgets", async (req: Request, res: Response) => {
    try {
      const validatedData = extendedBudgetSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID
      });
      
      const budget = await storage.createBudget(validatedData);
      res.status(201).json(budget);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.put("/api/budgets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const budget = await storage.getBudgetById(id);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      const validatedData = extendedBudgetSchema.partial().parse(req.body);
      const updatedBudget = await storage.updateBudget(id, validatedData);
      
      res.json(updatedBudget);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.delete("/api/budgets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBudget(id);
      
      if (!success) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });
  
  // Dashboard summary route
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getTransactions(DEFAULT_USER_ID);
      const budgets = await storage.getBudgets(DEFAULT_USER_ID);
      
      // Calculate current balance, income, and expenses
      let totalIncome = 0;
      let totalExpenses = 0;
      
      transactions.forEach(transaction => {
        if (transaction.isExpense) {
          totalExpenses += Number(transaction.amount);
        } else {
          totalIncome += Number(transaction.amount);
        }
      });
      
      const currentBalance = totalIncome - totalExpenses;
      
      // Get current month's data
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const currentMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      
      let monthlyIncome = 0;
      let monthlyExpenses = 0;
      
      currentMonthTransactions.forEach(transaction => {
        if (transaction.isExpense) {
          monthlyExpenses += Number(transaction.amount);
        } else {
          monthlyIncome += Number(transaction.amount);
        }
      });
      
      // Calculate budget status
      const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
      const budgetUsed = Math.min(100, Math.round((monthlyExpenses / totalBudget) * 100));
      
      // Calculate category breakdown
      const categoryExpenses: Record<string, number> = {};
      
      transactions
        .filter(t => t.isExpense)
        .forEach(t => {
          if (!categoryExpenses[t.category]) {
            categoryExpenses[t.category] = 0;
          }
          categoryExpenses[t.category] += Number(t.amount);
        });
      
      // Calculate budget status by category
      const budgetStatus = budgets.map(budget => {
        const spent = categoryExpenses[budget.category] || 0;
        const percentage = Math.round((spent / Number(budget.amount)) * 100);
        const isOverBudget = spent > Number(budget.amount);
        
        return {
          category: budget.category,
          budgeted: Number(budget.amount),
          spent,
          percentage,
          isOverBudget
        };
      });
      
      // Get recent transactions
      const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      res.json({
        currentBalance,
        totalIncome,
        totalExpenses,
        monthlyIncome,
        monthlyExpenses,
        budgetUsed,
        budgetTotal: totalBudget,
        categoryExpenses,
        budgetStatus,
        recentTransactions
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
