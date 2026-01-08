import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
}

export function formatShortName(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0];

  const first = parts[0].toLowerCase().replace(".", "");
  if ((first === "muhammad" || first === "muh" || first === "m") && parts.length > 1) {
    return parts[1];
  }
  return parts[0];
}