import type { IssueStatus, IssueType, Priority } from '@/types';

export const PROJECT_KEY = 'PROJ';

export const ISSUE_STATUSES: { value: IssueStatus; label: string; color: string; bg: string }[] = [
  { value: 'backlog', label: 'Backlog', color: '#6B7280', bg: '#F9FAFB' },
  { value: 'todo', label: 'To Do', color: '#3B82F6', bg: '#EFF6FF' },
  { value: 'in_progress', label: 'In Progress', color: '#D97706', bg: '#FFFBEB' },
  { value: 'review', label: 'In Review', color: '#7C3AED', bg: '#F5F3FF' },
  { value: 'done', label: 'Done', color: '#059669', bg: '#ECFDF5' },
];

export const BOARD_COLUMNS: { status: IssueStatus; label: string; color: string; bg: string }[] = [
  { status: 'todo', label: 'To Do', color: '#3B82F6', bg: '#EFF6FF' },
  { status: 'in_progress', label: 'In Progress', color: '#D97706', bg: '#FFFBEB' },
  { status: 'review', label: 'In Review', color: '#7C3AED', bg: '#F5F3FF' },
  { status: 'done', label: 'Done', color: '#059669', bg: '#ECFDF5' },
];

export const ISSUE_TYPES: { value: IssueType; label: string; color: string }[] = [
  { value: 'epic', label: 'Epic', color: '#7C3AED' },
  { value: 'story', label: 'Story', color: '#2563EB' },
  { value: 'task', label: 'Task', color: '#475569' },
  { value: 'bug', label: 'Bug', color: '#DC2626' },
  { value: 'subtask', label: 'Subtask', color: '#64748B' },
];

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: '#DC2626' },
  { value: 'high', label: 'High', color: '#EA580C' },
  { value: 'medium', label: 'Medium', color: '#D97706' },
  { value: 'low', label: 'Low', color: '#16A34A' },
];

export const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21];
