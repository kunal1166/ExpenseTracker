import { Response } from "express";
import mongoose from "mongoose";

import Budget from "../models/Budget";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/auth.middleware";

// CREATE BUDGET
export const createBudget = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, amount, month, year } = req.body;

    if (
      typeof category !== "string" ||
      !category.trim() ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2020
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid budget data",
      });
      return;
    }

    const budget = await Budget.create({
      userId: req.userId,
      category: category.trim(),
      amount,
      month,
      year,
    });

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      budget,
    });
  } catch (error: unknown) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "Budget already exists for this category and month",
      });
      return;
    }

    console.error("Create budget error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ALL USER BUDGETS WITH SPENDING
export const getBudgets = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const budgets = await Budget.find({
      userId: req.userId,
    }).sort({ year: -1, month: -1 });

    const budgetIds = budgets.map((budget) => ({
      category: budget.category,
      month: budget.month,
      year: budget.year,
    }));

    const spending = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          type: "expense",
        },
      },
      {
        $group: {
          _id: {
            category: "$category",
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          spent: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const result = budgets.map((budget) => {
      const matchingSpending = spending.find(
        (item) =>
          item._id.category.toLowerCase() ===
            budget.category.toLowerCase() &&
          item._id.month === budget.month &&
          item._id.year === budget.year
      );

      const spent = matchingSpending?.spent || 0;
      const remaining = budget.amount - spent;
      const percentageUsed = Number(
        ((spent / budget.amount) * 100).toFixed(2)
      );

      return {
        ...budget.toObject(),
        spent,
        remaining,
        percentageUsed,
        exceeded: spent > budget.amount,
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      budgets: result,
    });
  } catch (error) {
    console.error("Get budgets error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE BUDGET
export const updateBudget = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
      return;
    }

    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "Budget amount must be greater than zero",
      });
      return;
    }

    const budget = await Budget.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      {
        $set: { amount },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!budget) {
      res.status(404).json({
        success: false,
        message: "Budget not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      budget,
    });
  } catch (error) {
    console.error("Update budget error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE BUDGET
export const deleteBudget = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid budget ID",
      });
      return;
    }

    const budget = await Budget.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!budget) {
      res.status(404).json({
        success: false,
        message: "Budget not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};