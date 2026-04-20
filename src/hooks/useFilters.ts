import { useMemo } from 'react';
import { useIssueStore } from '@/store/issueStore';
import { useUIStore } from '@/store/uiStore';
import type { Issue } from '@/types';

export function useFilteredIssues(issues: Issue[]): Issue[] {
  const { filters, searchQuery } = useUIStore();

  return useMemo(() => {
    return issues.filter((issue) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(q);
        const matchesKey = issue.key.toLowerCase().includes(q);
        if (!matchesTitle && !matchesKey) return false;
      }
      if (filters.assigneeIds.length > 0) {
        if (!issue.assigneeId || !filters.assigneeIds.includes(issue.assigneeId)) return false;
      }
      if (filters.priorities.length > 0) {
        if (!filters.priorities.includes(issue.priority)) return false;
      }
      if (filters.types.length > 0) {
        if (!filters.types.includes(issue.type)) return false;
      }
      if (filters.labelIds.length > 0) {
        const hasLabel = filters.labelIds.some((lid) => issue.labelIds.includes(lid));
        if (!hasLabel) return false;
      }
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(issue.status)) return false;
      }
      return true;
    });
  }, [issues, filters, searchQuery]);
}
