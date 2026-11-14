
import { Router } from "express";

import protect from "../middleware/auth.middleware";

import {
  setDailyLimit,
  getDailyLimit,
} from "../controllers/dailyLimit.controller";

const router = Router();

// All routes require authentication
router.use(protect);

// Get today's spending and daily limit
router.get("/", getDailyLimit);

// Create or update daily spending limit
router.put("/", setDailyLimit);

export default router;
