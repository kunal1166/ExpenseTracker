
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../api/axios";
import { useAuth } from "./AuthContext";
import {
  formatCurrency as formatCurrencyUtil,
  formatDate as formatDateUtil,
  type Currency,
  type DateFormat,
} from "../utils/formatters";

interface PreferencesContextType {
  currency: Currency;
  dateFormat: DateFormat;
  loadingPreferences: boolean;
  updatePreferences: (
    currency: Currency,
    dateFormat: DateFormat
  ) => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatDate: (value: string | Date) => string;
}

const PreferencesContext = createContext<
  PreferencesContextType | undefined
>(undefined);

export function PreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, token, loading: authLoading } = useAuth();

  const [currency, setCurrency] = useState<Currency>("INR");
  const [dateFormat, setDateFormat] =
    useState<DateFormat>("DD/MM/YYYY");

  const [loadingPreferences, setLoadingPreferences] =
    useState(true);

  // Load preferences after authentication is restored
  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      if (authLoading) {
        return;
      }

      if (!token || !user) {
        setCurrency("INR");
        setDateFormat("DD/MM/YYYY");
        setLoadingPreferences(false);
        return;
      }

      try {
        setLoadingPreferences(true);

        const response = await api.get("/auth/preferences");

        if (!cancelled) {
          setCurrency(
            response.data.preferences.currency || "INR"
          );

          setDateFormat(
            response.data.preferences.dateFormat ||
              "DD/MM/YYYY"
          );
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);

        if (!cancelled) {
          setCurrency("INR");
          setDateFormat("DD/MM/YYYY");
        }
      } finally {
        if (!cancelled) {
          setLoadingPreferences(false);
        }
      }
    }

    loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [token, user?.id, authLoading]);

  // Update preferences in backend and global state
  const updatePreferences = async (
    newCurrency: Currency,
    newDateFormat: DateFormat
  ) => {
    const response = await api.put("/auth/preferences", {
      currency: newCurrency,
      dateFormat: newDateFormat,
    });

    setCurrency(response.data.preferences.currency);
    setDateFormat(response.data.preferences.dateFormat);
  };

  // Global currency formatter
  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  // Global date formatter
  const formatDate = (value: string | Date) => {
    return formatDateUtil(value, dateFormat);
  };

  return (
    <PreferencesContext.Provider
      value={{
        currency,
        dateFormat,
        loadingPreferences,
        updatePreferences,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "usePreferences must be used inside PreferencesProvider"
    );
  }

  return context;
}
