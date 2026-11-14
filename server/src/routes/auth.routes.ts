import { Router } from "express";

import {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  changePassword,
  getMyPreferences,
  updateMyPreferences,
} from "../controllers/auth.controller";

import protect from "../middleware/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.put("/change-password", protect, changePassword);

// User Preferences
router.get("/preferences", protect, getMyPreferences);
router.put("/preferences", protect, updateMyPreferences);

export default router;