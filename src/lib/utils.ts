import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// New utility function to open external links
export function openExternalLink(url: string) {
  if (typeof window !== 'undefined') {
    window.open(url, '_system'); // '_system' is a common target for opening external apps/browsers in hybrid environments
  }
}