import { Response } from "express";
import mongoose from "mongoose";

import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/auth.middleware";

// CREATE TRANSACTION
export const createTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, amount, type, category, date, notes } = req.body;

    if (!title || amount === undefined || !type || !category) {
      res.status(400).json({
        success: false,
        message: "Title, amount, type and category are required",
      });
      return;
    }

    if (
      typeof title !== "string" ||
      typeof category !== "string" ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !["income", "expense"].includes(type)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid transaction data",
      });
      return;
    }

    const transaction = await Transaction.create({
      userId: req.userId,
      title: title.trim(),
      amount,
      type,
      category: category.trim(),
      date: date || new Date(),
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET USER TRANSACTIONS WITH SEARCH, FILTER AND PAGINATION
export const getTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      search,
      type,
      category,
      startDate,
      endDate,
      page = "1",
      limit = "10",
    } = req.query;

    // Validate pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      !Number.isInteger(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid page or limit",
      });
      return;
    }

    // Build query
    const filter: Record<string, unknown> = {
      userId: req.userId,
    };

    // Search by title
    if (typeof search === "string" && search.trim()) {
      filter.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // Filter by transaction type
    if (type !== undefined) {
      if (
        typeof type !== "string" ||
        !["income", "expense"].includes(type)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid transaction type",
        });
        return;
      }

      filter.type = type;
    }

    // Filter by category
    if (typeof category === "string" && category.trim()) {
      filter.category = {
        $regex: `^${category.trim()}$`,
        $options: "i",
      };
    }

    // Filter by date range
    if (startDate !== undefined || endDate !== undefined) {
      const dateFilter: Record<string, Date> = {};

      if (typeof startDate === "string") {
        const start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
          res.status(400).json({
            success: false,
            message: "Invalid start date",
          });
          return;
        }

        dateFilter.$gte = start;
      }

      if (typeof endDate === "string") {
        const end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
          res.status(400).json({
            success: false,
            message: "Invalid end date",
          });
          return;
        }

        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }

      if (
        dateFilter.$gte &&
        dateFilter.$lte &&
        dateFilter.$gte > dateFilter.$lte
      ) {
        res.status(400).json({
          success: false,
          message: "Start date cannot be after end date",
        });
        return;
      }

      filter.date = dateFilter;
    }

    // Calculate pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch transactions and total count
    const [transactions, totalTransactions] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(
      totalTransactions / limitNumber
    );

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalTransactions,
        totalPages,
      },
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE TRANSACTION
export const updateTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
      return;
    }

    const { title, amount, type, category, date, notes } = req.body;

    const updates: Record<string, unknown> = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid title",
        });
        return;
      }
      updates.title = title.trim();
    }

    if (amount !== undefined) {
      if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        res.status(400).json({
          success: false,
          message: "Amount must be greater than zero",
        });
        return;
      }
      updates.amount = amount;
    }

    if (type !== undefined) {
      if (!["income", "expense"].includes(type)) {
        res.status(400).json({
          success: false,
          message: "Invalid transaction type",
        });
        return;
      }
      updates.type = type;
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid category",
        });
        return;
      }
      updates.category = category.trim();
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        res.status(400).json({
          success: false,
          message: "Invalid date",
        });
        return;
      }
      updates.date = parsedDate;
    }

    if (notes !== undefined) {
      if (typeof notes !== "string") {
        res.status(400).json({
          success: false,
          message: "Invalid notes",
        });
        return;
      }
      updates.notes = notes;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
      return;
    }

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE TRANSACTION
export const deleteTransaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
      return;
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// GET DASHBOARD SUMMARY
export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    // Current month date range (UTC)
    const now = new Date();

    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    const startOfNextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $group: {
          _id: null,

          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                "$amount",
                0,
              ],
            },
          },

          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "expense"] },
                "$amount",
                0,
              ],
            },
          },

          monthlyIncome: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$type", "income"] },
                    { $gte: ["$date", startOfMonth] },
                    { $lt: ["$date", startOfNextMonth] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },

          monthlyExpense: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$type", "expense"] },
                    { $gte: ["$date", startOfMonth] },
                    { $lt: ["$date", startOfNextMonth] },
                  ],
                },
                "$amount",
                0,
              ],
            },
          },

          totalTransactions: {
            $sum: 1,
          },
        },
      },
    ]);

    const summary = result[0] || {
      totalIncome: 0,
      totalExpense: 0,
      monthlyIncome: 0,
      monthlyExpense: 0,
      totalTransactions: 0,
    };

    const currentBalance =
      summary.totalIncome - summary.totalExpense;

    res.status(200).json({
      success: true,
      summary: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        currentBalance,
        monthlyIncome: summary.monthlyIncome,
        monthlyExpense: summary.monthlyExpense,
        totalTransactions: summary.totalTransactions,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// GET CATEGORY-WISE EXPENSE ANALYTICS
export const getExpenseAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const analytics = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: {
            $sum: "$amount",
          },
          transactionCount: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          totalAmount: -1,
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: 1,
          transactionCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Expense analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// GET MONTHLY INCOME VS EXPENSE
export const getMonthlyAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const now = new Date();

    // Start of current month
    const endDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    // Start of six-month period
    const startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
    );

    const analytics = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },

          income: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                "$amount",
                0,
              ],
            },
          },

          expense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "expense"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          income: 1,
          expense: 1,
        },
      },
    ]);

    // Include months with zero transactions
    const monthlyData = [];

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth() - 5 + i,
          1
        )
      );

      const year = monthDate.getUTCFullYear();
      const month = monthDate.getUTCMonth() + 1;

      const existing = analytics.find(
        (item) => item.year === year && item.month === month
      );

      monthlyData.push({
        year,
        month,
        income: existing?.income || 0,
        expense: existing?.expense || 0,
      });
    }

    res.status(200).json({
      success: true,
      analytics: monthlyData,
    });
  } catch (error) {
    console.error("Monthly analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
