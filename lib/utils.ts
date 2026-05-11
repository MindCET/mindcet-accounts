import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "he-IL",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    const dateOnly = date.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (dateOnly) {
      const [, year, month, day] = dateOnly;
      return `${day}/${month}/${year}`;
    }
  }

  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

export function daysUntil(date: Date | string): number {
  const target = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
