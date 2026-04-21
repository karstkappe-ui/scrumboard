import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterState } from '@/types';

const defaultFilters: FilterState = {
  assigneeIds: [],
  priorities: [],
  types: [],
  labelIds: [],
  statuses: [],
};

interface UIStore {
  selectedIssueId: string | null;
  activeSprintIds: Record<string, string>;
  filters: FilterState;
  searchQuery: string;
  isSidebarCollapsed: boolean;

  selectIssue: (id: string | null) => void;
  setActiveSprint: (projectId: string, sprintId: string) => void;
  getActiveSprint: (projectId: string) => string | undefined;
  setSearchQuery: (q: string) => void;
  toggleFilter: <K extends keyof FilterState>(key: K, value: FilterState[K][number]) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      selectedIssueId: null,
      activeSprintIds: { 'proj-1': 'sprint-2', 'proj-2': 'pure-sprint-2' },
      filters: defaultFilters,
      searchQuery: '',
      isSidebarCollapsed: false,

      selectIssue: (id) => set({ selectedIssueId: id }),

      setActiveSprint: (projectId, sprintId) =>
        set((state) => ({
          activeSprintIds: { ...state.activeSprintIds, [projectId]: sprintId },
        })),

      getActiveSprint: (projectId) => get().activeSprintIds[projectId],

      setSearchQuery: (q) => set({ searchQuery: q }),

      toggleFilter: (key, value) => {
        set((state) => {
          const current = state.filters[key] as string[];
          const exists = current.includes(value as string);
          return {
            filters: {
              ...state.filters,
              [key]: exists ? current.filter((v) => v !== value) : [...current, value as string],
            },
          };
        });
      },

      resetFilters: () => set({ filters: defaultFilters, searchQuery: '' }),

      hasActiveFilters: () => {
        const { filters, searchQuery } = get();
        return (
          searchQuery.trim().length > 0 ||
          filters.assigneeIds.length > 0 ||
          filters.priorities.length > 0 ||
          filters.types.length > 0 ||
          filters.labelIds.length > 0 ||
          filters.statuses.length > 0
        );
      },

      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    }),
    {
      name: 'scrumboard-ui',
      partialize: (s) => ({ isSidebarCollapsed: s.isSidebarCollapsed, activeSprintIds: s.activeSprintIds }),
    },
  ),
);
