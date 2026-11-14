import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import transactionRoutes from "./routes/transaction.routes";
import budgetRoutes from "./routes/budget.routes";
import dailyLimitRoutes from "./routes/dailyLimit.routes";
import categoryRoutes from "./routes/category.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/daily-limit", dailyLimitRoutes);
app.use("/api/categories", categoryRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ExpenseTracker API is running",
  });
});

export default app;