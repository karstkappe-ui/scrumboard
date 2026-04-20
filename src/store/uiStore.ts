import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterState, Priority, IssueType, IssueStatus } from '@/types';

const defaultFilters: FilterState = {
  assigneeIds: [],
  priorities: [],
  types: [],
  labelIds: [],
  statuses: [],
};

interface UIStore {
  selectedIssueId: string | null;
  activeSprintId: string | null;
  filters: FilterState;
  searchQuery: string;
  isSidebarCollapsed: boolean;

  selectIssue: (id: string | null) => void;
  setActiveSprint: (id: string | null) => void;
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
      activeSprintId: 'sprint-2',
      filters: defaultFilters,
      searchQuery: '',
      isSidebarCollapsed: false,

      selectIssue: (id) => set({ selectedIssueId: id }),
      setActiveSprint: (id) => set({ activeSprintId: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),

      toggleFilter: (key, value) => {
        set((state) => {
          const current = state.filters[key] as string[];
          const exists = current.includes(value as string);
          return {
            filters: {
              ...state.filters,
              [key]: exists
                ? current.filter((v) => v !== value)
                : [...current, value as string],
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

      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    }),
    { name: 'scrumboard-ui', partialize: (s) => ({ isSidebarCollapsed: s.isSidebarCollapsed, activeSprintId: s.activeSprintId }) },
  ),
);
