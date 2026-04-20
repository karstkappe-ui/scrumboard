'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useSprintStore } from '@/store/sprintStore';
import { Header } from '@/components/layout/Header';
import { SprintHeader } from '@/components/board/SprintHeader';
import { BoardFilters } from '@/components/board/BoardFilters';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { CreateIssueModal } from '@/components/backlog/CreateIssueModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Columns3 } from 'lucide-react';

export default function BoardPage() {
  const { activeSprintId } = useUIStore();
  const { getSprintById } = useSprintStore();
  const [createOpen, setCreateOpen] = useState(false);

  const sprint = activeSprintId ? getSprintById(activeSprintId) : undefined;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Sprint Board"
        subtitle={sprint?.name ?? 'No active sprint'}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setCreateOpen(true)}
          >
            Add Issue
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
        {/* Sprint header bar */}
        {sprint ? (
          <>
            <SprintHeader />

            {/* Filters */}
            <div className="flex-shrink-0">
              <BoardFilters />
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin">
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

      <CreateIssueModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultSprintId={activeSprintId ?? undefined}
      />
    </div>
  );
}
