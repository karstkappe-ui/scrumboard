import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '@/types';

function toRecord<T extends { id: string }>(arr: T[]): Record<string, T> {
  return Object.fromEntries(arr.map((item) => [item.id, item]));
}

interface ProjectStore {
  projects: Record<string, Project>;
  activeProjectId: string;

  _hydrate: (projects: Project[]) => void;
  setActiveProject: (id: string) => void;
  getActiveProject: () => Project | undefined;
  getAllProjects: () => Project[];
  createProject: (input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: {},
      activeProjectId: 'proj-1',

      _hydrate: (projects) => set({ projects: toRecord(projects) }),

      setActiveProject: (id) => set({ activeProjectId: id }),

      getActiveProject: () => get().projects[get().activeProjectId],

      getAllProjects: () => Object.values(get().projects),

      createProject: (input) => {
        const now = new Date().toISOString();
        const project: Project = {
          id: `proj-${Date.now()}`,
          ...input,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projects: { ...state.projects, [project.id]: project } }));
        return project;
      },
    }),
    {
      name: 'scrumboard-projects',
      partialize: (s) => ({ activeProjectId: s.activeProjectId }),
    },
  ),
);
