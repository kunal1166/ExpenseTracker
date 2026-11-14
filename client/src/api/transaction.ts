
import api from "./axios";
import type { Transaction } from "../types/transaction";

interface BackendTransaction {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
}

interface TransactionListResponse {
  success: boolean;
  count: number;
  pagination: {
    currentPage: number;
    limit: number;
    totalTransactions: number;
    totalPages: number;
  };
  transactions: BackendTransaction[];
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalTransactions: number;
}

export interface NewTransactionPayload {
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
}

// Convert MongoDB transaction into frontend format
function mapTransaction(item: BackendTransaction): Transaction {
  return {
    id: item._id,
    title: item.title,
    amount: item.amount,
    type: item.type,
    category: item.category,
    date: item.date.slice(0, 10),
  };
}

// Fetch transactions
export async function fetchTransactions(): Promise<Transaction[]> {
  const response = await api.get<TransactionListResponse>(
    "/transactions"
  );

  return response.data.transactions.map(mapTransaction);
}

// Create transaction
export async function createTransaction(
  data: NewTransactionPayload
): Promise<Transaction> {
  const response = await api.post("/transactions", data);

  return mapTransaction(response.data.transaction);
}

// Fetch dashboard summary
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<{
    success: boolean;
    summary: DashboardSummary;
  }>("/transactions/summary");

  return response.data.summary;
}

export type UpdateTransactionPayload = Partial<NewTransactionPayload>;

// Update transaction
export async function updateTransaction(
  id: string,
  data: UpdateTransactionPayload
): Promise<Transaction> {
  const response = await api.put(
    `/transactions/${id}`,
    data
  );

  return mapTransaction(response.data.transaction);
}

// Delete transaction
export async function deleteTransaction(
  id: string
): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

export interface TransactionQueryParams {
  search?: string;
  type?: "income" | "expense" | "";
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TransactionPagination {
  currentPage: number;
  limit: number;
  totalTransactions: number;
  totalPages: number;
}

export interface TransactionPageResult {
  transactions: Transaction[];
  pagination: TransactionPagination;
}

export async function fetchTransactionsPage(
  params: TransactionQueryParams
): Promise<TransactionPageResult> {
  const response = await api.get<TransactionListResponse>(
    "/transactions",
    { params }
  );

  return {
    transactions: response.data.transactions.map(mapTransaction),
    pagination: response.data.pagination,
  };
}

export interface ExpenseCategoryAnalytics {
  category: string;
  totalAmount: number;
  transactionCount: number;
}

export interface MonthlyAnalytics {
  year: number;
  month: number;
  income: number;
  expense: number;
}

export async function fetchExpenseAnalytics(): Promise<
  ExpenseCategoryAnalytics[]
> {
  const response = await api.get<{
    success: boolean;
    analytics: ExpenseCategoryAnalytics[];
  }>("/transactions/analytics/expenses");

  return response.data.analytics;
}

export async function fetchMonthlyAnalytics(): Promise<
  MonthlyAnalytics[]
> {
  const response = await api.get<{
    success: boolean;
    analytics: MonthlyAnalytics[];
  }>("/transactions/analytics/monthly");

  return response.data.analytics;
}

