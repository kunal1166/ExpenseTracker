
import mongoose from "mongoose";
import { Response } from "express";

import DailyLimit from "../models/DailyLimit";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middleware/auth.middleware";

// Get today's date boundaries
function getTodayBoundaries() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// Create or update daily spending limit
export const setDailyLimit = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Daily limit must be greater than zero.",
      });
    }

    const dailyLimit = await DailyLimit.findOneAndUpdate(
      { userId: req.userId },
      { $set: { amount } },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Daily spending limit saved successfully.",
      dailyLimit,
    });
  } catch (error) {
    console.error("Set daily limit error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save daily spending limit.",
    });
  }
};

// Get daily limit and today's spending summary
export const getDailyLimit = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user authentication.",
      });
    }

    const dailyLimit = await DailyLimit.findOne({ userId });

    const { start, end } = getTodayBoundaries();

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          date: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    const totalSpent = result[0]?.totalSpent ?? 0;
    const transactionCount = result[0]?.transactionCount ?? 0;

    const limit = dailyLimit?.amount ?? 0;
    const remaining = limit - totalSpent;

    const percentageUsed =
      limit > 0 ? (totalSpent / limit) * 100 : 0;

    const exceeded = limit > 0 && totalSpent > limit;

    const warning =
      limit > 0 && percentageUsed >= 80 && !exceeded;

    let status = "not_set";

    if (limit > 0) {
      if (exceeded) {
        status = "exceeded";
      } else if (warning) {
        status = "warning";
      } else {
        status = "safe";
      }
    }

    return res.status(200).json({
      success: true,

      dailyLimit: {
        amount: limit,
        isSet: Boolean(dailyLimit),
      },

      spending: {
        totalSpent,
        transactionCount,
        remaining,
        percentageUsed: Number(percentageUsed.toFixed(2)),
        exceeded,
        warning,
        status,
      },
    });
  } catch (error) {
    console.error("Get daily limit error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch daily spending information.",
    });
  }
};

