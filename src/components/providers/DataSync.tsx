'use client';
import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useIssueStore } from '@/store/issueStore';
import { useSprintStore } from '@/store/sprintStore';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { useTodoStore } from '@/store/todoStore';
import type { Issue, Sprint, Project, Comment, ActivityLog } from '@/types';

interface SyncData {
  projects: Project[];
  sprints: Sprint[];
  issues: Issue[];
  comments: Comment[];
  activity: ActivityLog[];
}

export function DataSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { _hydrate: hydrateIssues } = useIssueStore();
  const { _hydrate: hydrateSprints } = useSprintStore();
  const { _hydrate: hydrateProjects, activeProjectId } = useProjectStore();
  const { _hydrate: hydrateTodos } = useTodoStore();
  const { setCurrentUserId } = useUIStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (session?.user) {
      const userId = (session.user as { id?: string }).id;
      if (userId) setCurrentUserId(userId);
    }
  }, [session, setCurrentUserId]);

  async function sync() {
    try {
      const [syncRes, todosRes] = await Promise.all([
        fetch('/api/sync'),
        fetch(`/api/todos?projectId=${encodeURIComponent(activeProjectId)}`),
      ]);
      if (syncRes.ok) {
        const data: SyncData = await syncRes.json();
        hydrateProjects(data.projects);
        hydrateSprints(data.sprints);
        hydrateIssues({
          issues: data.issues,
          comments: data.comments,
          activity: data.activity,
        });
      }
      if (todosRes.ok) {
        const todoData = await todosRes.json();
        if (Array.isArray(todoData)) hydrateTodos(todoData);
      }
    } catch {
      // silent – will retry next interval
    }
  }

  useEffect(() => {
    if (status !== 'authenticated') return;
    sync();
    intervalRef.current = setInterval(sync, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // activeProjectId is a dependency so switching projects reloads the todos,
  // which are scoped per project, straight away instead of one tick later.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, activeProjectId]);

  return <>{children}</>;
}
