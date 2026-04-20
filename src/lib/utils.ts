import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatShortDate(date: string): string {
  return format(new Date(date), 'MMM d');
}

export function formatRelativeDate(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

let _counter = 1000;
export function generateId(): string {
  return `id-${++_counter}-${Math.random().toString(36).substring(2, 7)}`;
}

export function getSprintDaysRemaining(endDate: string): number {
  return Math.max(0, differenceInDays(new Date(endDate), new Date()));
}

export function getSprintProgress(issues: { status: string }[]): number {
  if (issues.length === 0) return 0;
  const done = issues.filter((i) => i.status === 'done').length;
  return Math.round((done / issues.length) * 100);
}

export function getStoryPointProgress(issues: { status: string; storyPoints?: number }[]): {
  total: number;
  completed: number;
  percentage: number;
} {
  const total = issues.reduce((sum, i) => sum + (i.storyPoints ?? 0), 0);
  const completed = issues
    .filter((i) => i.status === 'done')
    .reduce((sum, i) => sum + (i.storyPoints ?? 0), 0);
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}
