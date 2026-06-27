import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatQuantity(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return "0";
  const num = Number(value);
  if (isNaN(num)) return "0";
  // Round to max 2 decimal places to fix floating point arithmetic drift
  // Then convert back to number to drop trailing zeroes, then to string
  return Number(Math.round(num * 100) / 100).toLocaleString();
}
