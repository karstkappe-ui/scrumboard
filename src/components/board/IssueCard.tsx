'use client';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue } from '@/types';
import { MOCK_USERS } from '@/data/users';
import { MOCK_LABELS } from '@/data/labels';
import { Avatar } from '@/components/ui/Avatar';
import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { IssueTypeIcon } from '@/components/ui/IssueTypeIcon';
import { useUIStore } from '@/store/uiStore';
import { useIssueStore } from '@/store/issueStore';

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

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

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
        'bg-white rounded-lg border border-gray-200 p-3 cursor-pointer select-none',
        'hover:border-indigo-300 hover:shadow-md transition-all duration-150 group',
        isDragging && 'opacity-40 rotate-1',
        isOverlay && 'shadow-panel border-indigo-300 rotate-1 opacity-95',
      )}
    >
      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: `${label.color}15`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2 mb-2.5 group-hover:text-gray-900">
        {issue.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <IssueTypeIcon type={issue.type} size="sm" />
          <span className="text-[10px] font-mono text-gray-400">{issue.key}</span>
          <PriorityIcon priority={issue.priority} size="sm" />
        </div>
        <div className="flex items-center gap-2">
          {subtasks.length > 0 && (
            <span className="text-[10px] text-gray-400">
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
            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
              {issue.storyPoints}
            </span>
          )}
          <Avatar user={assignee} size="xs" />
        </div>
      </div>
    </div>
  );
}
