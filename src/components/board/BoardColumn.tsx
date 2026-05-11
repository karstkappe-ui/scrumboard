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
    <div className="flex flex-col min-w-[272px] w-[272px] flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-[0.07em] flex-1 truncate">
          {label}
        </span>
        <span
          className="text-[11px] font-semibold tabular-nums rounded-full px-1.5 py-0.5 min-w-[20px] text-center"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {count}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-2xl p-2 space-y-2 min-h-[200px] transition-all duration-150',
          isOver
            ? 'bg-indigo-50 ring-2 ring-indigo-300 ring-offset-0'
            : 'bg-gray-100/70',
        )}
      >
        {count === 0 && !isOver ? (
          <EmptyState
            icon={<Inbox size={22} />}
            title="Geen issues"
            compact
            className="text-gray-300 py-6"
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
