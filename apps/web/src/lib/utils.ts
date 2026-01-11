import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  // Handle small clock drift or "future" dates from server
  if (diffInSeconds < 0) {
    if (Math.abs(diffInSeconds) < 300) return 'just now'; // Within 5 minutes
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  }

  if (diffInSeconds < 60) return 'just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (diffInMinutes === 1) return '1 minute ago';
    return `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    if (weeks === 1) return '1 week ago';
    return `${weeks} weeks ago`;
  }

  return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}
