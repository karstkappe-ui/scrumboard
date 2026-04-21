'use client';
import { GripVertical, MoreHorizontal, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue } from '@/types';
import { MOCK_USERS } from '@/data/users';
import { MOCK_LABELS } from '@/data/labels';
import { Avatar } from '@/components/ui/Avatar';
import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { IssueTypeIcon } from '@/components/ui/IssueTypeIcon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useUIStore } from '@/store/uiStore';
import { useIssueStore } from '@/store/issueStore';
import { useSprintStore } from '@/store/sprintStore';
import { useProjectStore } from '@/store/projectStore';
import { useState } from 'react';

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
  const labels = MOCK_LABELS.filter((l) => issue.labelIds.includes(l.id));
  const subtasks = getSubtasks(issue.id);
  const doneSubtasks = subtasks.filter((s) => s.status === 'done').length;
  const sprints = project
    ? getSprintsByProject(project.id).filter((s) => s.status !== 'completed')
    : [];

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white group transition-all',
        'cursor-pointer',
      )}
      onClick={() => selectIssue(issue.id)}
    >
      {/* Drag handle */}
      <GripVertical
        size={14}
        className="text-gray-300 group-hover:text-gray-400 cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Type + Key */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <IssueTypeIcon type={issue.type} size="sm" />
        <span className="text-[11px] font-mono text-gray-400 w-16">{issue.key}</span>
      </div>

      {/* Title */}
      <p className="flex-1 text-sm text-gray-800 font-medium truncate">{issue.title}</p>

      {/* Labels */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {labels.slice(0, 2).map((label) => (
          <span
            key={label.id}
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{ backgroundColor: `${label.color}15`, color: label.color }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {/* Status */}
      <StatusBadge status={issue.status} size="sm" />

      {/* Subtasks */}
      {subtasks.length > 0 && (
        <span className="text-[11px] text-gray-400 flex-shrink-0">
          {doneSubtasks}/{subtasks.length}
        </span>
      )}

      {/* Story points */}
      {issue.storyPoints !== undefined && (
        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 flex-shrink-0 w-6 text-center">
          {issue.storyPoints}
        </span>
      )}

      {/* Priority */}
      <PriorityIcon priority={issue.priority} size="sm" />

      {/* Assignee */}
      <Avatar user={assignee} size="xs" />

      {/* Actions menu */}
      <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal size={14} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-7 z-20 w-44 bg-white border border-gray-200 rounded-lg shadow-panel py-1">
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              onClick={() => { onEdit?.(issue); setMenuOpen(false); }}
            >
              <Pencil size={12} /> Edit issue
            </button>

            <div className="relative">
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => setSprintMenuOpen(!sprintMenuOpen)}
              >
                <ArrowRight size={12} /> Move to sprint
              </button>
              {sprintMenuOpen && (
                <div className="absolute left-full top-0 ml-1 w-44 bg-white border border-gray-200 rounded-lg shadow-panel py-1 z-30">
                  {sprints.map((s) => (
                    <button
                      key={s.id}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 truncate"
                      onClick={() => { addToSprint(issue.id, s.id); setMenuOpen(false); setSprintMenuOpen(false); }}
                    >
                      {s.name}
                    </button>
                  ))}
                  {issue.sprintId && (
                    <button
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => { removeFromSprint(issue.id); setMenuOpen(false); setSprintMenuOpen(false); }}
                    >
                      Remove from sprint
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 my-1" />
            <button
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              onClick={() => { deleteIssue(issue.id); setMenuOpen(false); }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
