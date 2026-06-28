import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatElapsed(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "0.0s";
  }

  return `${(ms / 1000).toFixed(1)}s`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
