import { Router } from "express";

import protect from "../middleware/auth.middleware";

import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} from "../controllers/budget.controller";

const router = Router();

// All budget routes require authentication
router.use(protect);

// Create budget
router.post("/", createBudget);

// Get all budgets
router.get("/", getBudgets);

// Update budget
router.put("/:id", updateBudget);

// Delete budget
router.delete("/:id", deleteBudget);

export default router;