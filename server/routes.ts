import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertTransactionSchema, 
  insertSavingsGoalSchema, 
  insertBillSchema,
  type InsertTransactionSchema,
  type InsertSavingsGoalSchema,
  type InsertBillSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dashboardData = await storage.getDashboardData(userId);
      const upcomingBills = await storage.getUpcomingBills(userId);
      const savingsGoals = await storage.getSavingsGoals(userId);
      
      res.json({
        ...dashboardData,
        upcomingBills: upcomingBills.slice(0, 3), // Show top 3
        savingsGoals: savingsGoals.slice(0, 2), // Show top 2
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      const transactions = await storage.getTransactions(userId, startDate as string, endDate as string);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData: InsertTransactionSchema = insertTransactionSchema.parse({
        ...req.body,
        userId,
      });
      
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  app.put('/api/transactions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(400).json({ message: "Failed to update transaction" });
    }
  });

  app.delete('/api/transactions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTransaction(id);
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Savings goal routes
  app.get('/api/savings-goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getSavingsGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching savings goals:", error);
      res.status(500).json({ message: "Failed to fetch savings goals" });
    }
  });

  app.post('/api/savings-goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData: InsertSavingsGoalSchema = insertSavingsGoalSchema.parse({
        ...req.body,
        userId,
      });
      
      const goal = await storage.createSavingsGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating savings goal:", error);
      res.status(400).json({ message: "Failed to create savings goal" });
    }
  });

  app.put('/api/savings-goals/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const goalData = insertSavingsGoalSchema.partial().parse(req.body);
      const goal = await storage.updateSavingsGoal(id, goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error updating savings goal:", error);
      res.status(400).json({ message: "Failed to update savings goal" });
    }
  });

  app.post('/api/savings-goals/:id/add', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      
      if (!amount || isNaN(parseFloat(amount))) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const goal = await storage.addToSavingsGoal(id, amount);
      res.json(goal);
    } catch (error) {
      console.error("Error adding to savings goal:", error);
      res.status(400).json({ message: "Failed to add to savings goal" });
    }
  });

  app.delete('/api/savings-goals/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSavingsGoal(id);
      res.json({ message: "Savings goal deleted successfully" });
    } catch (error) {
      console.error("Error deleting savings goal:", error);
      res.status(500).json({ message: "Failed to delete savings goal" });
    }
  });

  // Bill routes
  app.get('/api/bills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bills = await storage.getBills(userId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.get('/api/bills/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bills = await storage.getUpcomingBills(userId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching upcoming bills:", error);
      res.status(500).json({ message: "Failed to fetch upcoming bills" });
    }
  });

  app.post('/api/bills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const billData: InsertBillSchema = insertBillSchema.parse({
        ...req.body,
        userId,
      });
      
      const bill = await storage.createBill(billData);
      res.json(bill);
    } catch (error) {
      console.error("Error creating bill:", error);
      res.status(400).json({ message: "Failed to create bill" });
    }
  });

  app.put('/api/bills/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const billData = insertBillSchema.partial().parse(req.body);
      const bill = await storage.updateBill(id, billData);
      res.json(bill);
    } catch (error) {
      console.error("Error updating bill:", error);
      res.status(400).json({ message: "Failed to update bill" });
    }
  });

  app.post('/api/bills/:id/pay', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const bill = await storage.markBillAsPaid(id);
      res.json(bill);
    } catch (error) {
      console.error("Error marking bill as paid:", error);
      res.status(500).json({ message: "Failed to mark bill as paid" });
    }
  });

  app.delete('/api/bills/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBill(id);
      res.json({ message: "Bill deleted successfully" });
    } catch (error) {
      console.error("Error deleting bill:", error);
      res.status(500).json({ message: "Failed to delete bill" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
