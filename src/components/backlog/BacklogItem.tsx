'use client';
import { GripVertical, MoreHorizontal, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue } from '@/types';
import { MOCK_USERS } from '@/data/users';
import { MOCK_LABELS } from '@/data/labels';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { IssueTypeIcon } from '@/components/ui/IssueTypeIcon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUIStore } from '@/store/uiStore';
import { useIssueStore } from '@/store/issueStore';
import { useSprintStore } from '@/store/sprintStore';
import { useProjectStore } from '@/store/projectStore';
import { useState } from 'react';

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-amber-400',
  low: 'bg-sky-400',
  none: 'bg-gray-200',
};

interface BacklogItemProps {
  issue: Issue;
  onEdit?: (issue: Issue) => void;
}

export function BacklogItem({ issue, onEdit }: BacklogItemProps) {
  const { selectIssue } = useUIStore();
  const { deleteIssue, addToSprint, removeFromSprint, getSubtasks } = useIssueStore();
  const { getSprintsByProject } = useSprintStore();
  const { getActiveProject } = useProjectStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sprintMenuOpen, setSprintMenuOpen] = useState(false);

  const project = getActiveProject();
  const assignee = MOCK_USERS.find((u) => u.id === issue.assigneeId);
  const assignees = MOCK_USERS.filter((u) => (issue.assigneeIds ?? []).includes(u.id));
  const labels = MOCK_LABELS.filter((l) => issue.labelIds.includes(l.id));
  const subtasks = getSubtasks(issue.id);
  const doneSubtasks = subtasks.filter((s) => s.status === 'done').length;
  const sprints = project
    ? getSprintsByProject(project.id).filter((s) => s.status !== 'completed')
    : [];

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent',
        'hover:border-gray-100 hover:bg-white hover:shadow-card group transition-all duration-150 cursor-pointer',
      )}
      onClick={() => selectIssue(issue.id)}
    >
      {/* Drag handle */}
      <GripVertical
        size={13}
        className="text-gray-300 group-hover:text-gray-400 cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Priority dot */}
      <span
        className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', PRIORITY_DOT[issue.priority ?? 'none'])}
      />

      {/* Type + Key */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <IssueTypeIcon type={issue.type} size="sm" />
        <span className="text-[10px] font-mono text-gray-400 w-16">{issue.key}</span>
      </div>

      {/* Title */}
      <p className="flex-1 text-[13px] text-gray-700 font-medium truncate group-hover:text-gray-900 transition-colors">
        {issue.title}
      </p>

      {/* Labels */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {labels.slice(0, 2).map((label) => (
          <span
            key={label.id}
            className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
            style={{ backgroundColor: `${label.color}18`, color: label.color }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {/* Status */}
      <StatusBadge status={issue.status} size="sm" />

      {/* Subtasks */}
      {subtasks.length > 0 && (
        <span className={cn(
          'text-[10px] font-medium flex-shrink-0',
          doneSubtasks === subtasks.length ? 'text-emerald-600' : 'text-gray-400',
        )}>
          {doneSubtasks}/{subtasks.length}
        </span>
      )}

      {/* Story points */}
      {issue.storyPoints !== undefined && (
        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 rounded-md px-1.5 py-0.5 flex-shrink-0 w-6 text-center">
          {issue.storyPoints}
        </span>
      )}

      {/* Priority icon */}
      <PriorityIcon priority={issue.priority} size="sm" />

      {/* Assignee(s) */}
      {assignees.length > 1 ? (
        <AvatarGroup users={assignees} max={3} size="xs" />
      ) : (
        <Avatar user={assignee} size="xs" />
      )}

      {/* Actions menu */}
      <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreHorizontal size={13} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-7 z-20 w-44 bg-white border border-gray-100 rounded-xl shadow-panel py-1 animate-scale-in">
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => { onEdit?.(issue); setMenuOpen(false); }}
            >
              <Pencil size={12} className="text-gray-400" /> Bewerken
            </button>

            <div className="relative">
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setSprintMenuOpen(!sprintMenuOpen)}
              >
                <ArrowRight size={12} className="text-gray-400" /> Naar sprint
              </button>
              {sprintMenuOpen && (
                <div className="absolute left-full top-0 ml-1 w-44 bg-white border border-gray-100 rounded-xl shadow-panel py-1 z-30 animate-scale-in">
                  {sprints.map((s) => (
                    <button
                      key={s.id}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 truncate transition-colors"
                      onClick={() => { addToSprint(issue.id, s.id); setMenuOpen(false); setSprintMenuOpen(false); }}
                    >
                      {s.name}
                    </button>
                  ))}
                  {issue.sprintId && (
                    <button
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => { removeFromSprint(issue.id); setMenuOpen(false); setSprintMenuOpen(false); }}
                    >
                      Uit sprint verwijderen
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 my-1" />
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => { deleteIssue(issue.id); setMenuOpen(false); }}
            >
              <Trash2 size={12} /> Verwijderen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
