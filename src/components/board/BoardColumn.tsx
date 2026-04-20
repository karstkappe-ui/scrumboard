'use client';
import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { IssueStatus } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Inbox } from 'lucide-react';

interface BoardColumnProps {
  status: IssueStatus;
  label: string;
  color: string;
  count: number;
  children: ReactNode;
}

export function BoardColumn({ status, label, color, count, children }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[260px] w-[260px] flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</span>
        <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          {count}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-colors duration-150',
          isOver ? 'bg-indigo-50/80 ring-2 ring-indigo-200' : 'bg-gray-100/60',
        )}
      >
        {count === 0 && !isOver ? (
          <EmptyState
            icon={<Inbox size={24} />}
            title="No issues"
            compact
            className="text-gray-300"
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
