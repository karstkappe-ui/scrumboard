export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  color: string;
  emoji: string;
  createdAt: string;
  updatedAt: string;
}

export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'subtask';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type SprintStatus = 'planning' | 'active' | 'completed';
export type UserRole = 'admin' | 'developer' | 'designer' | 'tester' | 'viewer';
export type ActivityAction =
  | 'issue_created'
  | 'issue_updated'
  | 'issue_moved'
  | 'issue_deleted'
  | 'comment_added'
  | 'sprint_created'
  | 'sprint_started'
  | 'sprint_completed'
  | 'subtask_completed'
  | 'issue_assigned';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  color: string;
  role: UserRole;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  assigneeId?: string;
  assigneeIds: string[];
  reporterId: string;
  sprintId?: string;
  epicId?: string;
  parentId?: string;
  storyPoints?: number;
  labelIds: string[];
  acceptanceCriteria?: string;
  order: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  issueId?: string;
  sprintId?: string;
  userId: string;
  action: ActivityAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  type: IssueType;
  priority: Priority;
  status: IssueStatus;
  assigneeId?: string;
  assigneeIds?: string[];
  sprintId?: string;
  epicId?: string;
  parentId?: string;
  storyPoints?: number;
  labelIds?: string[];
  acceptanceCriteria?: string;
}

export interface CreateSprintInput {
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
}

export interface FilterState {
  assigneeIds: string[];
  priorities: Priority[];
  types: IssueType[];
  labelIds: string[];
  statuses: IssueStatus[];
}
