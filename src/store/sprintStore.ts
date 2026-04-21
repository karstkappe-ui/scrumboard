import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sprint, CreateSprintInput } from '@/types';
import { SEED_SPRINTS, SEED_SPRINTS_PURE, SEED_SPRINTS_NMATE } from '@/data/seed';
import { generateId } from '@/lib/utils';

function toRecord<T extends { id: string }>(arr: T[]): Record<string, T> {
  return Object.fromEntries(arr.map((item) => [item.id, item]));
}

const ALL_SEED_SPRINTS = [...SEED_SPRINTS, ...SEED_SPRINTS_PURE, ...SEED_SPRINTS_NMATE];

interface SprintStore {
  sprints: Record<string, Sprint>;

  createSprint: (input: CreateSprintInput & { projectId: string }) => Sprint;
  updateSprint: (id: string, changes: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  startSprint: (id: string) => void;
  completeSprint: (id: string) => void;

  getActiveSprint: (projectId: string) => Sprint | undefined;
  getSprintById: (id: string) => Sprint | undefined;
  getSprintsByProject: (projectId: string) => Sprint[];
}

export const useSprintStore = create<SprintStore>()(
  persist(
    (set, get) => ({
      sprints: toRecord(ALL_SEED_SPRINTS),

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
            sprints: { ...state.sprints, [id]: { ...sprint, status: 'active', updatedAt: new Date().toISOString() } },
          };
        });
      },

      completeSprint: (id) => {
        set((state) => {
          const sprint = state.sprints[id];
          if (!sprint) return state;
          return {
            sprints: { ...state.sprints, [id]: { ...sprint, status: 'completed', updatedAt: new Date().toISOString() } },
          };
        });
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
    }),
    { name: 'scrumboard-sprints' },
  ),
);
