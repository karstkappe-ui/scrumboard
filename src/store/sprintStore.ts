import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sprint, CreateSprintInput } from '@/types';
import { SEED_SPRINTS } from '@/data/seed';
import { generateId } from '@/lib/utils';

function toRecord<T extends { id: string }>(arr: T[]): Record<string, T> {
  return Object.fromEntries(arr.map((item) => [item.id, item]));
}

interface SprintStore {
  sprints: Record<string, Sprint>;

  createSprint: (input: CreateSprintInput) => Sprint;
  updateSprint: (id: string, changes: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  startSprint: (id: string) => void;
  completeSprint: (id: string) => void;

  getActiveSprint: () => Sprint | undefined;
  getSprintById: (id: string) => Sprint | undefined;
  getSprintsByStatus: (status: Sprint['status']) => Sprint[];
  getAllSprints: () => Sprint[];
}

export const useSprintStore = create<SprintStore>()(
  persist(
    (set, get) => ({
      sprints: toRecord(SEED_SPRINTS),

      createSprint: (input) => {
        const now = new Date().toISOString();
        const sprint: Sprint = {
          id: generateId(),
          ...input,
          status: 'planning',
          projectId: 'proj-1',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ sprints: { ...state.sprints, [sprint.id]: sprint } }));
        return sprint;
      },

      updateSprint: (id, changes) => {
        set((state) => {
          const existing = state.sprints[id];
          if (!existing) return state;
          return {
            sprints: {
              ...state.sprints,
              [id]: { ...existing, ...changes, updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      deleteSprint: (id) => {
        set((state) => {
          const { [id]: _removed, ...rest } = state.sprints;
          return { sprints: rest };
        });
      },

      startSprint: (id) => {
        set((state) => {
          const sprint = state.sprints[id];
          if (!sprint) return state;
          return {
            sprints: {
              ...state.sprints,
              [id]: { ...sprint, status: 'active', updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      completeSprint: (id) => {
        set((state) => {
          const sprint = state.sprints[id];
          if (!sprint) return state;
          return {
            sprints: {
              ...state.sprints,
              [id]: { ...sprint, status: 'completed', updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      getActiveSprint: () => {
        return Object.values(get().sprints).find((s) => s.status === 'active');
      },

      getSprintById: (id) => get().sprints[id],

      getSprintsByStatus: (status) => {
        return Object.values(get().sprints)
          .filter((s) => s.status === status)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      },

      getAllSprints: () => {
        return Object.values(get().sprints).sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        );
      },
    }),
    { name: 'scrumboard-sprints' },
  ),
);
