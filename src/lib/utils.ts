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

// New utility function to format duration from seconds to MM:SS
export function formatDuration(durationInSeconds: string | number | undefined): string {
  if (durationInSeconds === undefined || durationInSeconds === null) {
    return '00:00';
  }

  let totalSeconds: number;
  if (typeof durationInSeconds === 'string') {
    // Attempt to parse string like "3:33" or "213"
    if (durationInSeconds.includes(':')) {
      const parts = durationInSeconds.split(':');
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      totalSeconds = (isNaN(minutes) ? 0 : minutes * 60) + (isNaN(seconds) ? 0 : seconds);
    } else {
      totalSeconds = parseInt(durationInSeconds, 10);
    }
  } else {
    totalSeconds = durationInSeconds;
  }

  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}