'use client';
import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useIssueStore } from '@/store/issueStore';
import { useUIStore } from '@/store/uiStore';
import { useFilteredIssues } from '@/hooks/useFilters';
import { BOARD_COLUMNS } from '@/lib/constants';
import { BoardColumn } from './BoardColumn';
import { IssueCard } from './IssueCard';
import type { Issue, IssueStatus } from '@/types';

interface KanbanBoardProps {
  sprintId: string;
}

export function KanbanBoard({ sprintId }: KanbanBoardProps) {
  const { issues, moveIssueToStatus, getIssuesBySprint } = useIssueStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sprintIssues = getIssuesBySprint(sprintId).filter((i) => i.type !== 'subtask');
  const filteredIssues = useFilteredIssues(sprintIssues);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeIssue = activeId ? issues[activeId] : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const overId = over.id as string;
    const isColumn = BOARD_COLUMNS.some((c) => c.status === overId);

    if (isColumn) {
      moveIssueToStatus(active.id as string, overId as IssueStatus);
    } else {
      const overIssue = issues[overId];
      if (overIssue) {
        moveIssueToStatus(active.id as string, overIssue.status);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full pb-4">
        {BOARD_COLUMNS.map((col) => {
          const colIssues = filteredIssues.filter((i) => i.status === col.status);
          return (
            <BoardColumn
              key={col.status}
              status={col.status}
              label={col.label}
              color={col.color}
              count={colIssues.length}
            >
              {colIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </BoardColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeIssue && <IssueCard issue={activeIssue} isOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
