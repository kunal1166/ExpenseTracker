
import mongoose from "mongoose";
import { Response } from "express";

import Category, {
  type CategoryType,
} from "../models/Category";

import { AuthRequest } from "../middleware/auth.middleware";
import Transaction from "../models/Transaction";

// Default categories
const defaultCategories: {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}[] = [
  // Expense categories
  { name: "Food", type: "expense", icon: "Utensils", color: "#f59e0b" },
  { name: "Travel", type: "expense", icon: "Car", color: "#3b82f6" },
  { name: "Shopping", type: "expense", icon: "ShoppingBag", color: "#ec4899" },
  { name: "Education", type: "expense", icon: "GraduationCap", color: "#8b5cf6" },
  { name: "Health", type: "expense", icon: "HeartPulse", color: "#ef4444" },
  { name: "Bills", type: "expense", icon: "Receipt", color: "#64748b" },
  { name: "Entertainment", type: "expense", icon: "Film", color: "#06b6d4" },
  { name: "Others", type: "expense", icon: "Wallet", color: "#64748b" },

  // Income categories
  { name: "Salary", type: "income", icon: "Briefcase", color: "#16a34a" },
  { name: "Freelance", type: "income", icon: "Laptop", color: "#3b82f6" },
  { name: "Business", type: "income", icon: "Building2", color: "#8b5cf6" },
  { name: "Investment", type: "income", icon: "TrendingUp", color: "#0d9488" },
  { name: "Gift", type: "income", icon: "Gift", color: "#ec4899" },
  { name: "Other Income", type: "income", icon: "Wallet", color: "#64748b" },
];

// GET all categories
export const getCategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({
        success: false,
        message: "Invalid user authentication.",
      });
      return;
    }

    // Create missing default categories for this user
    await Category.bulkWrite(
      defaultCategories.map((category) => ({
        updateOne: {
          filter: {
            userId: new mongoose.Types.ObjectId(userId),
            name: category.name,
            type: category.type,
          },
          update: {
            $setOnInsert: {
              ...category,
              userId: new mongoose.Types.ObjectId(userId),
              isDefault: true,
            },
          },
          upsert: true,
        },
      }))
    );

    const categories = await Category.find({ userId }).sort({
      type: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch categories.",
    });
  }
};

// CREATE custom category
export const createCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { name, type, icon, color } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
      return;
    }

    if (
      !name ||
      typeof name !== "string" ||
      !["income", "expense"].includes(type)
    ) {
      res.status(400).json({
        success: false,
        message: "Valid category name and type are required.",
      });
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length > 40) {
      res.status(400).json({
        success: false,
        message: "Category name must be between 1 and 40 characters.",
      });
      return;
    }

    const category = await Category.create({
      userId,
      name: trimmedName,
      type,
      icon: typeof icon === "string" ? icon : "Wallet",
      color: typeof color === "string" ? color : "#64748b",
      isDefault: false,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "This category already exists.",
      });
      return;
    }

    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create category.",
    });
  }
};

// UPDATE category

export const updateCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, icon, color } = req.body;

    if (
      !userId ||
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid user or category ID.",
      });
      return;
    }

    const updates: {
      name?: string;
      icon?: string;
      color?: string;
    } = {};

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 40
      ) {
        res.status(400).json({
          success: false,
          message: "Category name must be between 1 and 40 characters.",
        });
        return;
      }

      updates.name = name.trim();
    }

    if (icon !== undefined) {
      if (typeof icon !== "string") {
        res.status(400).json({
          success: false,
          message: "Invalid category icon.",
        });
        return;
      }

      updates.icon = icon;
    }

    if (color !== undefined) {
      if (typeof color !== "string") {
        res.status(400).json({
          success: false,
          message: "Invalid category color.",
        });
        return;
      }

      updates.color = color;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
      return;
    }

    // Find the existing category
    const existingCategory = await Category.findOne({
      _id: id,
      userId,
    });

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: "Category not found.",
      });
      return;
    }

    const previousName = existingCategory.name;

    // Update category
    const category = await Category.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found.",
      });
      return;
    }

    // Update existing transactions when category name changes
    if (
      updates.name &&
      updates.name !== previousName
    ) {
      await Transaction.updateMany(
        {
          userId,
          category: previousName,
          type: existingCategory.type,
        },
        {
          $set: {
            category: updates.name,
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "Category and related transactions updated successfully.",
      category,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "This category name already exists.",
      });
      return;
    }

    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update category.",
    });
  }
};


// DELETE custom category
export const deleteCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (
      !userId ||
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid user or category ID.",
      });
      return;
    }

    const category = await Category.findOne({
      _id: id,
      userId,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Category not found.",
      });
      return;
    }

    if (category.isDefault) {
      res.status(400).json({
        success: false,
        message: "Default categories cannot be deleted.",
      });
      return;
    }

    // Prevent deletion if transactions use this category
    const transactionExists = await Transaction.exists({
      userId,
      category: category.name,
      type: category.type,
    });

    if (transactionExists) {
      res.status(400).json({
        success: false,
        message:
          "This category is being used by transactions. Delete or reassign those transactions first.",
      });
      return;
    }

    await Category.deleteOne({
      _id: id,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
    });
  }
};

