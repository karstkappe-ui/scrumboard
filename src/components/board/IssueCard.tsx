'use client';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue } from '@/types';
import { MOCK_USERS } from '@/data/users';
import { MOCK_LABELS } from '@/data/labels';
import { Avatar } from '@/components/ui/Avatar';
import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { IssueTypeIcon } from '@/components/ui/IssueTypeIcon';
import { useUIStore } from '@/store/uiStore';
import { useIssueStore } from '@/store/issueStore';

const PRIORITY_BORDER: Record<string, string> = {
  urgent: 'border-l-red-400',
  high: 'border-l-orange-400',
  medium: 'border-l-amber-400',
  low: 'border-l-sky-400',
  none: 'border-l-gray-200',
};

interface IssueCardProps {
  issue: Issue;
  isOverlay?: boolean;
}

export function IssueCard({ issue, isOverlay }: IssueCardProps) {
  const { selectIssue } = useUIStore();
  const { getSubtasks, getIssueComments } = useIssueStore();
  const assignee = MOCK_USERS.find((u) => u.id === issue.assigneeId);
  const labels = MOCK_LABELS.filter((l) => issue.labelIds.includes(l.id));
  const subtasks = getSubtasks(issue.id);
  const doneSubtasks = subtasks.filter((s) => s.status === 'done').length;
  const comments = getIssueComments(issue.id);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: issue.id,
    disabled: isOverlay,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        selectIssue(issue.id);
      }}
      className={cn(
        'bg-white rounded-xl border-l-[3px] border border-gray-100 p-3.5 cursor-pointer select-none',
        'transition-all duration-150 group',
        'hover:-translate-y-px hover:shadow-card-md hover:border-gray-200',
        PRIORITY_BORDER[issue.priority ?? 'none'],
        isDragging && 'opacity-30 scale-[0.98]',
        isOverlay && 'shadow-lift rotate-[0.5deg] opacity-95 border-indigo-200',
      )}
    >
      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide"
              style={{ backgroundColor: `${label.color}18`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-[13px] text-gray-700 font-medium leading-snug line-clamp-2 mb-3 group-hover:text-gray-900 transition-colors">
        {issue.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <IssueTypeIcon type={issue.type} size="sm" />
          <span className="text-[10px] font-mono text-gray-400 tracking-tight">{issue.key}</span>
          <PriorityIcon priority={issue.priority} size="sm" />
        </div>
        <div className="flex items-center gap-2">
          {subtasks.length > 0 && (
            <span className={cn(
              'flex items-center gap-0.5 text-[10px] font-medium',
              doneSubtasks === subtasks.length ? 'text-emerald-600' : 'text-gray-400',
            )}>
              <CheckSquare size={10} />
              {doneSubtasks}/{subtasks.length}
            </span>
          )}
          {comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
              <MessageSquare size={10} />
              {comments.length}
            </span>
          )}
          {issue.storyPoints !== undefined && (
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 rounded-md px-1.5 py-0.5">
              {issue.storyPoints}
            </span>
          )}
          <Avatar user={assignee} size="xs" />
        </div>
      </div>
    </div>
  );
}
