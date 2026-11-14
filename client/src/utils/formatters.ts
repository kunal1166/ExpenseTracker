
export type Currency = "INR" | "USD" | "EUR" | "GBP";

export type DateFormat =
  | "DD/MM/YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD";

const currencyLocales: Record<Currency, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

// Format currency
export function formatCurrency(
  amount: number,
  currency: Currency = "INR"
): string {
  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat(currencyLocales[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Safely parse date values
function parseDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  // Prevent timezone shifts for YYYY-MM-DD values
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (
      date.getFullYear() !== Number(year) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      return null;
    }

    return date;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

// Format date
export function formatDate(
  value: string | Date,
  dateFormat: DateFormat = "DD/MM/YYYY"
): string {
  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  switch (dateFormat) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;

    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;

    case "DD/MM/YYYY":
    default:
      return `${day}/${month}/${year}`;
  }
}
