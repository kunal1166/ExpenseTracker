
import api from "./axios";

export interface Budget {
  _id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  exceeded: boolean;
}

export interface CreateBudgetPayload {
  category: string;
  amount: number;
  month: number;
  year: number;
}

interface BudgetListResponse {
  success: boolean;
  count: number;
  budgets: Budget[];
}

interface SingleBudgetResponse {
  success: boolean;
  message: string;
  budget: Budget;
}

// Fetch all budgets
export async function fetchBudgets(): Promise<Budget[]> {
  const response = await api.get<BudgetListResponse>("/budgets");

  return response.data.budgets;
}

// Create budget
export async function createBudget(
  data: CreateBudgetPayload
): Promise<Budget> {
  const response = await api.post<SingleBudgetResponse>(
    "/budgets",
    data
  );

  return response.data.budget;
}

// Update budget amount
export async function updateBudget(
  id: string,
  amount: number
): Promise<Budget> {
  const response = await api.put<SingleBudgetResponse>(
    `/budgets/${id}`,
    { amount }
  );

  return response.data.budget;
}

// Delete budget
export async function deleteBudget(id: string): Promise<void> {
  await api.delete(`/budgets/${id}`);
}
