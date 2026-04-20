import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Issue, ActivityLog, Comment, CreateIssueInput, ActivityAction } from '@/types';
import { SEED_ISSUES, SEED_ACTIVITY, SEED_COMMENTS } from '@/data/seed';
import { PROJECT_KEY } from '@/lib/constants';
import { generateId } from '@/lib/utils';

function toRecord<T extends { id: string }>(arr: T[]): Record<string, T> {
  return Object.fromEntries(arr.map((item) => [item.id, item]));
}

interface IssueStore {
  issues: Record<string, Issue>;
  activity: ActivityLog[];
  comments: Record<string, Comment[]>;
  issueCounter: number;

  createIssue: (input: CreateIssueInput) => Issue;
  updateIssue: (id: string, changes: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  moveIssueToStatus: (id: string, status: Issue['status']) => void;
  addToSprint: (issueId: string, sprintId: string) => void;
  removeFromSprint: (issueId: string) => void;
  reorderIssue: (activeId: string, overId: string) => void;

  addComment: (issueId: string, authorId: string, content: string) => void;
  logActivity: (entry: Omit<ActivityLog, 'id' | 'createdAt'>) => void;

  getIssuesByStatus: (status: Issue['status'], sprintId?: string) => Issue[];
  getIssuesBySprint: (sprintId: string) => Issue[];
  getBacklogIssues: () => Issue[];
  getSubtasks: (parentId: string) => Issue[];
  getIssueComments: (issueId: string) => Comment[];
}

export const useIssueStore = create<IssueStore>()(
  persist(
    (set, get) => ({
      issues: toRecord(SEED_ISSUES),
      activity: SEED_ACTIVITY,
      comments: SEED_COMMENTS.reduce<Record<string, Comment[]>>((acc, c) => {
        if (!acc[c.issueId]) acc[c.issueId] = [];
        acc[c.issueId].push(c);
        return acc;
      }, {}),
      issueCounter: SEED_ISSUES.length + 1,

      createIssue: (input) => {
        const { issueCounter } = get();
        const now = new Date().toISOString();
        const newIssue: Issue = {
          id: generateId(),
          key: `${PROJECT_KEY}-${issueCounter + 1}`,
          title: input.title,
          description: input.description,
          type: input.type,
          status: input.status,
          priority: input.priority,
          assigneeId: input.assigneeId,
          reporterId: 'user-1',
          sprintId: input.sprintId,
          epicId: input.epicId,
          parentId: input.parentId,
          storyPoints: input.storyPoints,
          labelIds: input.labelIds ?? [],
          acceptanceCriteria: input.acceptanceCriteria,
          order: Object.keys(get().issues).length + 1,
          projectId: 'proj-1',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          issues: { ...state.issues, [newIssue.id]: newIssue },
          issueCounter: state.issueCounter + 1,
        }));
        get().logActivity({ issueId: newIssue.id, userId: 'user-1', action: 'issue_created' });
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
        get().logActivity({ issueId: id, userId: 'user-1', action: 'issue_updated' });
      },

      deleteIssue: (id) => {
        set((state) => {
          const { [id]: _removed, ...rest } = state.issues;
          return { issues: rest };
        });
        get().logActivity({ issueId: id, userId: 'user-1', action: 'issue_deleted' });
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
        get().logActivity({
          issueId: id,
          userId: 'user-1',
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
          return {
            issues: {
              ...state.issues,
              [issueId]: {
                ...issue,
                sprintId,
                status: issue.status === 'backlog' ? 'todo' : issue.status,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      removeFromSprint: (issueId) => {
        set((state) => {
          const issue = state.issues[issueId];
          if (!issue) return state;
          return {
            issues: {
              ...state.issues,
              [issueId]: {
                ...issue,
                sprintId: undefined,
                status: 'backlog',
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      reorderIssue: (activeId, overId) => {
        set((state) => {
          const activeIssue = state.issues[activeId];
          const overIssue = state.issues[overId];
          if (!activeIssue || !overIssue) return state;
          const [aOrder, oOrder] = [activeIssue.order, overIssue.order];
          return {
            issues: {
              ...state.issues,
              [activeId]: { ...activeIssue, order: oOrder },
              [overId]: { ...overIssue, order: aOrder },
            },
          };
        });
      },

      addComment: (issueId, authorId, content) => {
        const now = new Date().toISOString();
        const comment: Comment = {
          id: generateId(),
          issueId,
          authorId,
          content,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          comments: {
            ...state.comments,
            [issueId]: [...(state.comments[issueId] ?? []), comment],
          },
        }));
        get().logActivity({ issueId, userId: authorId, action: 'comment_added' });
      },

      logActivity: (entry) => {
        const log: ActivityLog = {
          id: generateId(),
          ...entry,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ activity: [log, ...state.activity].slice(0, 200) }));
      },

      getIssuesByStatus: (status, sprintId) => {
        const all = Object.values(get().issues);
        return all
          .filter(
            (i) =>
              i.status === status && !i.parentId && (sprintId ? i.sprintId === sprintId : true),
          )
          .sort((a, b) => a.order - b.order);
      },

      getIssuesBySprint: (sprintId) => {
        return Object.values(get().issues)
          .filter((i) => i.sprintId === sprintId && !i.parentId)
          .sort((a, b) => a.order - b.order);
      },

      getBacklogIssues: () => {
        return Object.values(get().issues)
          .filter((i) => !i.sprintId && i.type !== 'subtask')
          .sort((a, b) => a.order - b.order);
      },

      getSubtasks: (parentId) => {
        return Object.values(get().issues)
          .filter((i) => i.parentId === parentId)
          .sort((a, b) => a.order - b.order);
      },

      getIssueComments: (issueId) => {
        return get().comments[issueId] ?? [];
      },
    }),
    { name: 'scrumboard-issues' },
  ),
);
