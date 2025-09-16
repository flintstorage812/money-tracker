import {
  users,
  transactions,
  savingsGoals,
  bills,
  type User,
  type UpsertUser,
  type Transaction,
  type InsertTransaction,
  type SavingsGoal,
  type InsertSavingsGoal,
  type Bill,
  type InsertBill,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, lte, and, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, balance: string): Promise<void>;

  // Transaction operations
  getTransactions(userId: string, startDate?: string, endDate?: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;

  // Savings goal operations
  getSavingsGoals(userId: string): Promise<SavingsGoal[]>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: string, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal>;
  deleteSavingsGoal(id: string): Promise<void>;
  addToSavingsGoal(goalId: string, amount: string): Promise<SavingsGoal>;

  // Bill operations
  getBills(userId: string): Promise<Bill[]>;
  getUpcomingBills(userId: string): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: string, bill: Partial<InsertBill>): Promise<Bill>;
  deleteBill(id: string): Promise<void>;
  markBillAsPaid(billId: string): Promise<Bill>;

  // Dashboard data
  getDashboardData(userId: string): Promise<{
    currentBalance: string;
    monthlyIncome: string;
    monthlyExpenses: string;
    totalSavings: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserBalance(userId: string, balance: string): Promise<void> {
    await db
      .update(users)
      .set({ currentBalance: balance, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Transaction operations
  async getTransactions(userId: string, startDate?: string, endDate?: string): Promise<Transaction[]> {
    let query = db.select().from(transactions).where(eq(transactions.userId, userId));
    
    if (startDate && endDate) {
      query = db.select().from(transactions).where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      );
    }
    
    return await query.orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    
    // Update user balance
    await this.recalculateUserBalance(transaction.userId);
    
    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updated] = await db
      .update(transactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    
    if (transaction.userId) {
      await this.recalculateUserBalance(transaction.userId);
    }
    
    return updated;
  }

  async deleteTransaction(id: string): Promise<void> {
    const [deleted] = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning();
    
    if (deleted) {
      await this.recalculateUserBalance(deleted.userId);
    }
  }

  // Savings goal operations
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    return await db
      .select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId))
      .orderBy(desc(savingsGoals.createdAt));
  }

  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const [newGoal] = await db
      .insert(savingsGoals)
      .values(goal)
      .returning();
    return newGoal;
  }

  async updateSavingsGoal(id: string, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal> {
    const [updated] = await db
      .update(savingsGoals)
      .set({ ...goal, updatedAt: new Date() })
      .where(eq(savingsGoals.id, id))
      .returning();
    return updated;
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    await db.delete(savingsGoals).where(eq(savingsGoals.id, id));
  }

  async addToSavingsGoal(goalId: string, amount: string): Promise<SavingsGoal> {
    const [goal] = await db.select().from(savingsGoals).where(eq(savingsGoals.id, goalId));
    const newAmount = (parseFloat(goal.currentAmount || '0') + parseFloat(amount)).toString();
    
    const [updated] = await db
      .update(savingsGoals)
      .set({ currentAmount: newAmount, updatedAt: new Date() })
      .where(eq(savingsGoals.id, goalId))
      .returning();
    return updated;
  }

  // Bill operations
  async getBills(userId: string): Promise<Bill[]> {
    return await db
      .select()
      .from(bills)
      .where(eq(bills.userId, userId))
      .orderBy(desc(bills.createdAt));
  }

  async getUpcomingBills(userId: string): Promise<Bill[]> {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return await db
      .select()
      .from(bills)
      .where(
        and(
          eq(bills.userId, userId),
          eq(bills.isActive, true),
          eq(bills.isPaid, false),
          gte(bills.nextDueDate || bills.dueDate, today),
          lte(bills.nextDueDate || bills.dueDate, nextWeek)
        )
      )
      .orderBy(bills.nextDueDate || bills.dueDate);
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db
      .insert(bills)
      .values(bill)
      .returning();
    return newBill;
  }

  async updateBill(id: string, bill: Partial<InsertBill>): Promise<Bill> {
    const [updated] = await db
      .update(bills)
      .set({ ...bill, updatedAt: new Date() })
      .where(eq(bills.id, id))
      .returning();
    return updated;
  }

  async deleteBill(id: string): Promise<void> {
    await db.delete(bills).where(eq(bills.id, id));
  }

  async markBillAsPaid(billId: string): Promise<Bill> {
    const [updated] = await db
      .update(bills)
      .set({ isPaid: true, paidDate: new Date().toISOString().split('T')[0], updatedAt: new Date() })
      .where(eq(bills.id, billId))
      .returning();
    return updated;
  }

  // Dashboard data
  async getDashboardData(userId: string): Promise<{
    currentBalance: string;
    monthlyIncome: string;
    monthlyExpenses: string;
    totalSavings: string;
  }> {
    const user = await this.getUser(userId);
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthStart = currentMonth + '-01';
    const monthEnd = currentMonth + '-' + lastDayOfMonth.toString().padStart(2, '0');
    
    // Get monthly income and expenses
    const monthlyTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, monthStart),
          lte(transactions.date, monthEnd)
        )
      );
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    // Get total savings
    const goals = await this.getSavingsGoals(userId);
    const totalSavings = goals.reduce((sum, goal) => sum + parseFloat(goal.currentAmount || '0'), 0);
    
    return {
      currentBalance: user?.currentBalance || '0',
      monthlyIncome: monthlyIncome.toString(),
      monthlyExpenses: monthlyExpenses.toString(),
      totalSavings: totalSavings.toString(),
    };
  }

  private async recalculateUserBalance(userId: string): Promise<void> {
    const allTransactions = await this.getTransactions(userId);
    const balance = allTransactions.reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount);
      return transaction.type === 'income' ? sum + amount : sum - amount;
    }, 0);
    
    await this.updateUserBalance(userId, balance.toString());
  }
}

export const storage = new DatabaseStorage();
