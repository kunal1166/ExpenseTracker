
import api from "./axios";

export interface DailySpending {
  totalSpent: number;
  transactionCount: number;
  remaining: number;
  percentageUsed: number;
  exceeded: boolean;
  warning: boolean;
  status: "not_set" | "safe" | "warning" | "exceeded";
}

export interface DailyLimitData {
  amount: number;
  isSet: boolean;
}

interface DailyLimitResponse {
  success: boolean;
  dailyLimit: DailyLimitData;
  spending: DailySpending;
}

interface SetDailyLimitResponse {
  success: boolean;
  message: string;
  dailyLimit: DailyLimitData;
}

export async function fetchDailyLimit(): Promise<DailyLimitResponse> {
  const response = await api.get<DailyLimitResponse>("/daily-limit");

  return response.data;
}

export async function updateDailyLimit(
  amount: number
): Promise<DailyLimitData> {
  const response = await api.put<SetDailyLimitResponse>(
    "/daily-limit",
    { amount }
  );

  return response.data.dailyLimit;
}
