import { 
  User, InsertUser, 
  Transaction, InsertTransaction, 
  Budget, InsertBudget 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction methods (expenses & income)
  getTransactions(userId?: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Budget methods
  getBudgets(userId?: number): Promise<Budget[]>;
  getBudgetById(id: number): Promise<Budget | undefined>;
  getBudgetByCategory(category: string, userId?: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  
  private userId: number;
  private transactionId: number;
  private budgetId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    
    this.userId = 1;
    this.transactionId = 1;
    this.budgetId = 1;
    
    // Initialize with a default user
    this.createUser({ username: "demo", password: "password" });
    
    // Add some sample data for default user
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    // Sample transactions for the past month
    this.createTransaction({
      amount: 3240.00,
      description: "Monthly Salary",
      category: "Salary",
      date: oneMonthAgo,
      isExpense: false,
      userId: 1
    });
    
    this.createTransaction({
      amount: 84.20,
      description: "Grocery Shopping",
      category: "Food & Dining",
      date: now,
      isExpense: true,
      userId: 1
    });
    
    this.createTransaction({
      amount: 56.80,
      description: "Restaurant Dinner",
      category: "Food & Dining",
      date: new Date(now.getTime() - 3 * 86400000), // 3 days ago
      isExpense: true,
      userId: 1
    });
    
    this.createTransaction({
      amount: 124.99,
      description: "Online Shopping",
      category: "Shopping",
      date: new Date(now.getTime() - 5 * 86400000), // 5 days ago
      isExpense: true,
      userId: 1
    });
    
    this.createTransaction({
      amount: 84.20,
      description: "Utility Bill",
      category: "Bills & Utilities",
      date: new Date(now.getTime() - 6 * 86400000), // 6 days ago
      isExpense: true,
      userId: 1
    });
    
    // Sample budgets
    this.createBudget({
      category: "Food & Dining",
      amount: 500,
      userId: 1,
      period: "monthly"
    });
    
    this.createBudget({
      category: "Transportation",
      amount: 300,
      userId: 1,
      period: "monthly"
    });
    
    this.createBudget({
      category: "Entertainment",
      amount: 150,
      userId: 1,
      period: "monthly"
    });
    
    this.createBudget({
      category: "Shopping",
      amount: 400,
      userId: 1,
      period: "monthly"
    });
    
    this.createBudget({
      category: "Bills & Utilities",
      amount: 350,
      userId: 1,
      period: "monthly"
    });
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
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Transaction methods
  async getTransactions(userId?: number): Promise<Transaction[]> {
    const transactions = Array.from(this.transactions.values());
    if (userId) {
      return transactions.filter(transaction => transaction.userId === userId);
    }
    return transactions;
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      createdAt: new Date() 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) {
      return undefined;
    }
    
    const updatedTransaction = { ...existingTransaction, ...transaction };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }
  
  // Budget methods
  async getBudgets(userId?: number): Promise<Budget[]> {
    const budgets = Array.from(this.budgets.values());
    if (userId) {
      return budgets.filter(budget => budget.userId === userId);
    }
    return budgets;
  }
  
  async getBudgetById(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }
  
  async getBudgetByCategory(category: string, userId?: number): Promise<Budget | undefined> {
    const budgets = Array.from(this.budgets.values());
    return budgets.find(budget => 
      budget.category === category && 
      (userId ? budget.userId === userId : true)
    );
  }
  
  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.budgetId++;
    const budget: Budget = { 
      ...insertBudget, 
      id,
      createdAt: new Date() 
    };
    this.budgets.set(id, budget);
    return budget;
  }
  
  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existingBudget = this.budgets.get(id);
    if (!existingBudget) {
      return undefined;
    }
    
    const updatedBudget = { ...existingBudget, ...budget };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
  
  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }
}

export const storage = new MemStorage();
