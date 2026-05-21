import { create } from 'zustand';
import type { Issue, ActivityLog, Comment, CreateIssueInput } from '@/types';
import { generateId } from '@/lib/utils';

function toRecord<T extends { id: string }>(arr: T[]): Record<string, T> {
  return Object.fromEntries(arr.map((item) => [item.id, item]));
}

function groupComments(flat: Comment[]): Record<string, Comment[]> {
  return flat.reduce<Record<string, Comment[]>>((acc, c) => {
    if (!acc[c.issueId]) acc[c.issueId] = [];
    acc[c.issueId].push(c);
    return acc;
  }, {});
}

function api(path: string, method: string, body?: unknown) {
  fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).catch((err) => console.warn('[api]', method, path, err));
}

interface IssueStore {
  issues: Record<string, Issue>;
  activity: ActivityLog[];
  comments: Record<string, Comment[]>;
  issueCounters: Record<string, number>;

  _hydrate: (data: { issues: Issue[]; comments: Comment[]; activity: ActivityLog[] }) => void;

  createIssue: (input: CreateIssueInput & { projectId: string; projectKey: string }) => Issue;
  updateIssue: (id: string, changes: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  moveIssueToStatus: (id: string, status: Issue['status']) => void;
  addToSprint: (issueId: string, sprintId: string) => void;
  removeFromSprint: (issueId: string) => void;
  reorderIssue: (activeId: string, overId: string) => void;

  addComment: (issueId: string, authorId: string, content: string) => void;
  logActivity: (entry: Omit<ActivityLog, 'id' | 'createdAt'>) => void;

  getIssuesBySprint: (sprintId: string) => Issue[];
  getBacklogIssues: (projectId: string) => Issue[];
  getSubtasks: (parentId: string) => Issue[];
  getIssueComments: (issueId: string) => Comment[];
  getProjectIssues: (projectId: string) => Issue[];
}

export const useIssueStore = create<IssueStore>()((set, get) => ({
  issues: {},
  activity: [],
  comments: {},
  issueCounters: {},

  _hydrate: ({ issues, comments, activity }) => {
    const grouped = groupComments(comments);
    const counters: Record<string, number> = {};
    const hydratedIssues = issues.map((issue) => ({
      ...issue,
      assigneeIds: issue.assigneeIds?.length
        ? issue.assigneeIds
        : issue.assigneeId
          ? [issue.assigneeId]
          : [],
    }));
    for (const issue of hydratedIssues) {
      const match = issue.key.match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!counters[issue.projectId] || num > counters[issue.projectId]) {
          counters[issue.projectId] = num;
        }
      }
    }
    set({ issues: toRecord(hydratedIssues), comments: grouped, activity, issueCounters: counters });
  },

  createIssue: (input) => {
    const { issueCounters } = get();
    const counter = (issueCounters[input.projectId] ?? 0) + 1;
    const now = new Date().toISOString();
    const { useUIStore } = require('./uiStore');
    const currentUserId = useUIStore.getState().currentUserId || 'user-1';
    const resolvedAssigneeIds = input.assigneeIds?.length
      ? input.assigneeIds
      : input.assigneeId
        ? [input.assigneeId]
        : [];
    const newIssue: Issue = {
      id: generateId(),
      key: `${input.projectKey}-${counter}`,
      title: input.title,
      description: input.description,
      type: input.type,
      status: input.status,
      priority: input.priority,
      assigneeId: resolvedAssigneeIds[0],
      assigneeIds: resolvedAssigneeIds,
      reporterId: currentUserId,
      sprintId: input.sprintId,
      epicId: input.epicId,
      parentId: input.parentId,
      storyPoints: input.storyPoints,
      labelIds: input.labelIds ?? [],
      acceptanceCriteria: input.acceptanceCriteria,
      order: Object.values(get().issues).filter((i) => i.projectId === input.projectId).length + 1,
      projectId: input.projectId,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      issues: { ...state.issues, [newIssue.id]: newIssue },
      issueCounters: { ...state.issueCounters, [input.projectId]: counter },
    }));
    api('/api/issues', 'POST', newIssue);
    get().logActivity({ issueId: newIssue.id, userId: currentUserId, action: 'issue_created' });
    return newIssue;
  },

  updateIssue: (id, changes) => {
    set((state) => {
      const existing = state.issues[id];
      if (!existing) return state;
      return {
        issues: {
          ...state.issues,
          [id]: { ...existing, ...changes, updatedAt: new Date().toISOString() },
        },
      };
    });
    // undefined values are stripped by JSON.stringify — convert to null so the
    // server actually clears the field (e.g. sprintId → backlog)
    const apiChanges = Object.fromEntries(
      Object.entries(changes).map(([k, v]) => [k, v === undefined ? null : v]),
    );
    api(`/api/issues/${id}`, 'PATCH', apiChanges);
    const { useUIStore } = require('./uiStore');
    get().logActivity({ issueId: id, userId: useUIStore.getState().currentUserId || 'user-1', action: 'issue_updated' });
  },

  deleteIssue: (id) => {
    set((state) => {
      const { [id]: _removed, ...rest } = state.issues;
      return { issues: rest };
    });
    api(`/api/issues/${id}`, 'DELETE');
  },

  moveIssueToStatus: (id, status) => {
    const existing = get().issues[id];
    if (!existing || existing.status === status) return;
    set((state) => ({
      issues: {
        ...state.issues,
        [id]: { ...state.issues[id], status, updatedAt: new Date().toISOString() },
      },
    }));
    api(`/api/issues/${id}`, 'PATCH', { status });
    const { useUIStore } = require('./uiStore');
    get().logActivity({
      issueId: id,
      userId: useUIStore.getState().currentUserId || 'user-1',
      action: 'issue_moved',
      field: 'status',
      oldValue: existing.status,
      newValue: status,
    });
  },

  addToSprint: (issueId, sprintId) => {
    set((state) => {
      const issue = state.issues[issueId];
      if (!issue) return state;
      const updated = {
        ...issue,
        sprintId,
        status: issue.status === 'backlog' ? ('todo' as const) : issue.status,
        updatedAt: new Date().toISOString(),
      };
      api(`/api/issues/${issueId}`, 'PATCH', { sprintId: updated.sprintId, status: updated.status });
      return { issues: { ...state.issues, [issueId]: updated } };
    });
  },

  removeFromSprint: (issueId) => {
    set((state) => {
      const issue = state.issues[issueId];
      if (!issue) return state;
      const updated = { ...issue, sprintId: undefined, status: 'backlog' as const, updatedAt: new Date().toISOString() };
      api(`/api/issues/${issueId}`, 'PATCH', { sprintId: null, status: 'backlog' });
      return { issues: { ...state.issues, [issueId]: updated } };
    });
  },

  reorderIssue: (activeId, overId) => {
    set((state) => {
      const activeIssue = state.issues[activeId];
      const overIssue = state.issues[overId];
      if (!activeIssue || !overIssue) return state;
      api(`/api/issues/${activeId}`, 'PATCH', { order: overIssue.order });
      api(`/api/issues/${overId}`, 'PATCH', { order: activeIssue.order });
      return {
        issues: {
          ...state.issues,
          [activeId]: { ...activeIssue, order: overIssue.order },
          [overId]: { ...overIssue, order: activeIssue.order },
        },
      };
    });
  },

  addComment: (issueId, authorId, content) => {
    const now = new Date().toISOString();
    const comment: Comment = { id: generateId(), issueId, authorId, content, createdAt: now, updatedAt: now };
    set((state) => ({
      comments: { ...state.comments, [issueId]: [...(state.comments[issueId] ?? []), comment] },
    }));
    api('/api/comments', 'POST', comment);
    get().logActivity({ issueId, userId: authorId, action: 'comment_added' });
  },

  logActivity: (entry) => {
    const log: ActivityLog = { id: generateId(), ...entry, createdAt: new Date().toISOString() };
    set((state) => ({ activity: [log, ...state.activity].slice(0, 200) }));
  },

  getIssuesBySprint: (sprintId) => {
    return Object.values(get().issues)
      .filter((i) => i.sprintId === sprintId && !i.parentId)
      .sort((a, b) => a.order - b.order);
  },

  getBacklogIssues: (projectId) => {
    return Object.values(get().issues)
      .filter((i) => !i.sprintId && i.type !== 'subtask' && i.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  },

  getSubtasks: (parentId) => {
    return Object.values(get().issues)
      .filter((i) => i.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  },

  getIssueComments: (issueId) => get().comments[issueId] ?? [],

  getProjectIssues: (projectId) => {
    return Object.values(get().issues)
      .filter((i) => i.projectId === projectId && i.type !== 'subtask')
      .sort((a, b) => a.order - b.order);
  },
}));
