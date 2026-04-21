'use client';
import { useState } from 'react';
import { Plus, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { useIssueStore } from '@/store/issueStore';
import { useSprintStore } from '@/store/sprintStore';
import { useProjectStore } from '@/store/projectStore';
import { useFilteredIssues } from '@/hooks/useFilters';
import { Header } from '@/components/layout/Header';
import { BacklogFilters } from '@/components/backlog/BacklogFilters';
import { SprintGroup } from '@/components/backlog/SprintGroup';
import { BacklogItem } from '@/components/backlog/BacklogItem';
import { CreateIssueModal } from '@/components/backlog/CreateIssueModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Issue } from '@/types';

export default function BacklogPage() {
  const { getBacklogIssues, getIssuesBySprint } = useIssueStore();
  const { getSprintsByProject } = useSprintStore();
  const { getActiveProject } = useProjectStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editIssue, setEditIssue] = useState<Issue | undefined>();
  const [backlogExpanded, setBacklogExpanded] = useState(true);

  const project = getActiveProject();
  const sprints = project
    ? getSprintsByProject(project.id).filter((s) => s.status !== 'completed')
    : [];
  const backlogIssues = project ? getBacklogIssues(project.id) : [];
  const filteredBacklog = useFilteredIssues(backlogIssues);
  const totalSP = backlogIssues.reduce((s, i) => s + (i.storyPoints ?? 0), 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={project ? `${project.emoji} ${project.name} — Backlog` : 'Backlog'}
        subtitle={`${backlogIssues.length} items · ${totalSP} story points`}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => { setEditIssue(undefined); setCreateOpen(true); }}
          >
            Create Issue
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <div className="mb-4">
          <BacklogFilters />
        </div>

        {sprints.map((sprint) => {
          const sprintIssues = getIssuesBySprint(sprint.id).filter((i) => i.type !== 'subtask');
          return (
            <SprintGroup
              key={sprint.id}
              sprint={sprint}
              issues={sprintIssues}
              onEditIssue={(issue) => { setEditIssue(issue); setCreateOpen(true); }}
            />
          );
        })}

        <div className="mt-4">
          <button
            onClick={() => setBacklogExpanded(!backlogExpanded)}
            className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-white group transition-colors text-left"
          >
            {backlogExpanded ? (
              <ChevronDown size={14} className="text-gray-400" />
            ) : (
              <ChevronRight size={14} className="text-gray-400" />
            )}
            <Package size={14} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-800">Product Backlog</span>
            <span className="text-xs text-gray-400 ml-1">
              ({filteredBacklog.length} items{totalSP > 0 ? ` · ${totalSP} SP` : ''})
            </span>
          </button>

          {backlogExpanded && (
            <div className="ml-4 mt-1 space-y-0.5">
              {filteredBacklog.length === 0 ? (
                <EmptyState
                  icon={<Package size={28} />}
                  title="Backlog is empty"
                  description="Create issues to add them to the backlog."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus size={13} />}
                      onClick={() => { setEditIssue(undefined); setCreateOpen(true); }}
                    >
                      Create Issue
                    </Button>
                  }
                  compact
                />
              ) : (
                filteredBacklog.map((issue) => (
                  <BacklogItem
                    key={issue.id}
                    issue={issue}
                    onEdit={(issue) => { setEditIssue(issue); setCreateOpen(true); }}
                  />
                ))
              )}
              {filteredBacklog.length > 0 && (
                <button
                  onClick={() => { setEditIssue(undefined); setCreateOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg w-full transition-colors"
                >
                  <Plus size={12} /> Add to backlog
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {project && (
        <CreateIssueModal
          open={createOpen}
          onClose={() => { setCreateOpen(false); setEditIssue(undefined); }}
          editIssue={editIssue}
          projectId={project.id}
          projectKey={project.key}
        />
      )}
    </div>
  );
}
