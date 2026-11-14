import { Router } from "express";

import protect from "../middleware/auth.middleware";

import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary,
  getExpenseAnalytics,
  getMonthlyAnalytics,
} from "../controllers/transaction.controller";

const router = Router();

// All transaction routes require authentication
router.use(protect);

router.get("/analytics/monthly", getMonthlyAnalytics);

router.get("/analytics/expenses", getExpenseAnalytics);

// Dashboard summary
router.get("/summary", getDashboardSummary);

// Create transaction
router.post("/", createTransaction);

// Get all transactions
router.get("/", getTransactions);

// Update transaction
router.put("/:id", updateTransaction);

// Delete transaction
router.delete("/:id", deleteTransaction);

export default router;