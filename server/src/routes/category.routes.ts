
import { Router } from "express";

import protect from "../middleware/auth.middleware";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";

const router = Router();

// All category routes require authentication
router.use(protect);

// GET all categories
router.get("/", getCategories);

// CREATE custom category
router.post("/", createCategory);

// UPDATE category
router.put("/:id", updateCategory);

// DELETE custom category
router.delete("/:id", deleteCategory);

export default router;
