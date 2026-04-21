'use client';
import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useIssueStore } from '@/store/issueStore';
import { useProjectStore } from '@/store/projectStore';
import { IssueTypeIcon } from '@/components/ui/IssueTypeIcon';
import { Avatar } from '@/components/ui/Avatar';
import { MOCK_USERS } from '@/data/users';
import { cn } from '@/lib/utils';

interface SubtaskListProps {
  parentId: string;
}

export function SubtaskList({ parentId }: SubtaskListProps) {
  const { getSubtasks, moveIssueToStatus, createIssue } = useIssueStore();
  const { getActiveProject } = useProjectStore();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const subtasks = getSubtasks(parentId);
  const done = subtasks.filter((s) => s.status === 'done').length;
  const project = getActiveProject();

  const handleAddSubtask = () => {
    if (!newTitle.trim() || !project) return;
    createIssue({
      title: newTitle.trim(),
      type: 'subtask',
      priority: 'medium',
      status: 'todo',
      parentId,
      projectId: project.id,
      projectKey: project.key,
    });
    setNewTitle('');
    setAdding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">
          Subtasks
          {subtasks.length > 0 && (
            <span className="ml-1 text-gray-400 font-normal">
              ({done}/{subtasks.length})
            </span>
          )}
        </span>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="space-y-1">
        {subtasks.map((subtask) => {
          const assignee = MOCK_USERS.find((u) => u.id === subtask.assigneeId);
          const isDone = subtask.status === 'done';
          return (
            <div
              key={subtask.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 group"
            >
              <button
                onClick={() => moveIssueToStatus(subtask.id, isDone ? 'todo' : 'done')}
                className={cn(
                  'h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-gray-300 hover:border-emerald-400',
                )}
              >
                {isDone && <Check size={10} />}
              </button>
              <IssueTypeIcon type="subtask" size="sm" />
              <span
                className={cn(
                  'flex-1 text-xs min-w-0 truncate',
                  isDone ? 'line-through text-gray-400' : 'text-gray-700',
                )}
              >
                {subtask.title}
              </span>
              <span className="text-[10px] font-mono text-gray-300">{subtask.key}</span>
              {assignee && <Avatar user={assignee} size="xs" />}
            </div>
          );
        })}

        {adding && (
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="h-4 w-4 rounded border border-gray-300 flex-shrink-0" />
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubtask();
                if (e.key === 'Escape') { setAdding(false); setNewTitle(''); }
              }}
              placeholder="Subtask title…"
              className="flex-1 text-xs border-b border-indigo-300 outline-none pb-0.5 bg-transparent"
            />
          </div>
        )}

        {subtasks.length === 0 && !adding && (
          <p className="text-xs text-gray-400 px-2 py-1">No subtasks yet.</p>
        )}
      </div>
    </div>
  );
}
