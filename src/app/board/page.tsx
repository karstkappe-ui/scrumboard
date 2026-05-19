'use client';
import { useState } from 'react';
import { Plus, Columns3 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useSprintStore } from '@/store/sprintStore';
import { useProjectStore } from '@/store/projectStore';
import { Header } from '@/components/layout/Header';
import { SprintHeader } from '@/components/board/SprintHeader';
import { BoardFilters } from '@/components/board/BoardFilters';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { CreateIssueModal } from '@/components/backlog/CreateIssueModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function BoardPage() {
  const { getActiveSprint: getActiveSprintId } = useUIStore();
  const { getSprintById, getActiveSprint } = useSprintStore();
  const { getActiveProject } = useProjectStore();
  const [createOpen, setCreateOpen] = useState(false);

  const project = getActiveProject();
  const activeSprintId = project ? getActiveSprintId(project.id) : undefined;
  const sprint = project
    ? (activeSprintId ? getSprintById(activeSprintId) : undefined) ?? getActiveSprint(project.id)
    : undefined;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={project ? `${project.emoji} ${project.name} — Board` : 'Board'}
        subtitle={sprint?.name ?? 'No active sprint'}
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
            Add Issue
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
        {sprint ? (
          <>
            <SprintHeader />
            <div className="flex-shrink-0">
              <BoardFilters />
            </div>
            <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden scrollbar-thin">
              <KanbanBoard sprintId={sprint.id} />
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Columns3 size={40} />}
            title="No active sprint"
            description="Start a sprint from the Sprints page to see your board."
          />
        )}
      </div>

      {project && (
        <CreateIssueModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          defaultSprintId={sprint?.id}
          projectId={project.id}
          projectKey={project.key}
        />
      )}
    </div>
  );
}
