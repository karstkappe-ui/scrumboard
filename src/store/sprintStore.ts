import { create } from 'zustand';
import type { Sprint, CreateSprintInput } from '@/types';
import { generateId } from '@/lib/utils';

function toRecord<T extends { id: string }>(arr: T[]): Record<string, T> {
  return Object.fromEntries(arr.map((item) => [item.id, item]));
}

function api(path: string, method: string, body?: unknown) {
  fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).catch((err) => console.warn('[api]', method, path, err));
}

interface SprintStore {
  sprints: Record<string, Sprint>;

  _hydrate: (sprints: Sprint[]) => void;

  createSprint: (input: CreateSprintInput & { projectId: string }) => Sprint;
  updateSprint: (id: string, changes: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  startSprint: (id: string) => void;
  completeSprint: (id: string) => void;

  getActiveSprint: (projectId: string) => Sprint | undefined;
  getSprintById: (id: string) => Sprint | undefined;
  getSprintsByProject: (projectId: string) => Sprint[];
}

export const useSprintStore = create<SprintStore>()((set, get) => ({
  sprints: {},

  _hydrate: (sprints) => set({ sprints: toRecord(sprints) }),

  createSprint: (input) => {
    const now = new Date().toISOString();
    const sprint: Sprint = {
      id: generateId(),
      name: input.name,
      goal: input.goal,
      startDate: input.startDate,
      endDate: input.endDate,
      status: 'planning',
      projectId: input.projectId,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ sprints: { ...state.sprints, [sprint.id]: sprint } }));
    api('/api/sprints', 'POST', sprint);
    return sprint;
  },

  updateSprint: (id, changes) => {
    set((state) => {
      const existing = state.sprints[id];
      if (!existing) return state;
      return {
        sprints: { ...state.sprints, [id]: { ...existing, ...changes, updatedAt: new Date().toISOString() } },
      };
    });
    api(`/api/sprints/${id}`, 'PATCH', changes);
  },

  deleteSprint: (id) => {
    set((state) => {
      const { [id]: _removed, ...rest } = state.sprints;
      return { sprints: rest };
    });
    api(`/api/sprints/${id}`, 'DELETE');
  },

  startSprint: (id) => {
    set((state) => {
      const sprint = state.sprints[id];
      if (!sprint) return state;
      return {
        sprints: { ...state.sprints, [id]: { ...sprint, status: 'active', updatedAt: new Date().toISOString() } },
      };
    });
    api(`/api/sprints/${id}`, 'PATCH', { status: 'active' });
  },

  completeSprint: (id) => {
    set((state) => {
      const sprint = state.sprints[id];
      if (!sprint) return state;
      return {
        sprints: { ...state.sprints, [id]: { ...sprint, status: 'completed', updatedAt: new Date().toISOString() } },
      };
    });
    api(`/api/sprints/${id}`, 'PATCH', { status: 'completed' });
  },

  getActiveSprint: (projectId) => {
    return Object.values(get().sprints).find(
      (s) => s.status === 'active' && s.projectId === projectId,
    );
  },

  getSprintById: (id) => get().sprints[id],

  getSprintsByProject: (projectId) => {
    return Object.values(get().sprints)
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  },
}));
