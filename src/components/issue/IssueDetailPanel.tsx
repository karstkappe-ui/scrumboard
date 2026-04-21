'use client';
import { useState } from 'react';
import { X, ExternalLink, Copy, MoreHorizontal, Pencil } from 'lucide-react';
import { useIssueStore } from '@/store/issueStore';
import { useSprintStore } from '@/store/sprintStore';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { MOCK_USERS } from '@/data/users';
import { MOCK_LABELS } from '@/data/labels';
import { ISSUE_TYPES, PRIORITIES, ISSUE_STATUSES, STORY_POINTS } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { PriorityIcon } from '@/components/ui/PriorityIcon';
import { IssueTypeIcon } from '@/components/ui/IssueTypeIcon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SubtaskList } from './SubtaskList';
import { ActivitySection } from './ActivitySection';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatDate, formatRelativeDate, getStoryPointProgress } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function IssueDetailPanel() {
  const { selectedIssueId, selectIssue } = useUIStore();
  const { issues, updateIssue, getSubtasks } = useIssueStore();
  const { getSprintsByProject } = useSprintStore();
  const { getActiveProject } = useProjectStore();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  const issue = selectedIssueId ? issues[selectedIssueId] : null;
  if (!issue) return null;

  const assignee = MOCK_USERS.find((u) => u.id === issue.assigneeId);
  const reporter = MOCK_USERS.find((u) => u.id === issue.reporterId);
  const labels = MOCK_LABELS.filter((l) => issue.labelIds.includes(l.id));
  const project = getActiveProject();
  const sprints = project ? getSprintsByProject(project.id) : [];
  const currentSprint = sprints.find((s) => s.id === issue.sprintId);
  const subtasks = getSubtasks(issue.id);
  const sp = getStoryPointProgress(subtasks);

  const handleTitleSave = () => {
    if (titleValue.trim()) updateIssue(issue.id, { title: titleValue.trim() });
    setEditingTitle(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] animate-fade-in"
        onClick={() => selectIssue(null)}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-2xl bg-white border-l border-gray-200 shadow-panel flex flex-col animate-slide-in-right">
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <IssueTypeIcon type={issue.type} size="md" />
            <span className="text-sm font-mono font-medium text-gray-500">{issue.key}</span>
            <div className="h-4 w-px bg-gray-200" />
            <StatusBadge status={issue.status} />
          </div>
          <div className="flex items-center gap-1">
            <button
              className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Copy link"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={() => selectIssue(null)}
              className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5">
            {/* Title */}
            {editingTitle ? (
              <input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
                className="w-full text-xl font-bold text-gray-900 border-b-2 border-indigo-400 outline-none bg-transparent pb-0.5"
              />
            ) : (
              <h2
                className="text-xl font-bold text-gray-900 leading-tight cursor-pointer hover:text-indigo-700 transition-colors group"
                onClick={() => { setEditingTitle(true); setTitleValue(issue.title); }}
              >
                {issue.title}
                <Pencil size={14} className="inline ml-2 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </h2>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mt-5 mb-5 border-b border-gray-100">
              {(['details', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'pb-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors',
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700',
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'details' ? (
              <div className="space-y-5">
                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Field label="Status">
                    <select
                      value={issue.status}
                      onChange={(e) => updateIssue(issue.id, { status: e.target.value as typeof issue.status })}
                      className="text-xs border-0 bg-transparent p-0 focus:ring-0 cursor-pointer text-gray-700 font-medium"
                    >
                      {ISSUE_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Priority">
                    <div className="flex items-center gap-1.5">
                      <PriorityIcon priority={issue.priority} size="sm" />
                      <select
                        value={issue.priority}
                        onChange={(e) => updateIssue(issue.id, { priority: e.target.value as typeof issue.priority })}
                        className="text-xs border-0 bg-transparent p-0 focus:ring-0 cursor-pointer text-gray-700 font-medium"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </Field>

                  <Field label="Assignee">
                    <div className="flex items-center gap-1.5">
                      <Avatar user={assignee} size="xs" />
                      <select
                        value={issue.assigneeId ?? ''}
                        onChange={(e) => updateIssue(issue.id, { assigneeId: e.target.value || undefined })}
                        className="text-xs border-0 bg-transparent p-0 focus:ring-0 cursor-pointer text-gray-700"
                      >
                        <option value="">Unassigned</option>
                        {MOCK_USERS.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </Field>

                  <Field label="Story Points">
                    <select
                      value={issue.storyPoints ?? ''}
                      onChange={(e) => updateIssue(issue.id, { storyPoints: e.target.value ? Number(e.target.value) : undefined })}
                      className="text-xs border-0 bg-transparent p-0 focus:ring-0 cursor-pointer text-gray-700 font-medium"
                    >
                      <option value="">—</option>
                      {STORY_POINTS.map((p) => (
                        <option key={p} value={p}>{p} SP</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Sprint">
                    <select
                      value={issue.sprintId ?? ''}
                      onChange={(e) => updateIssue(issue.id, { sprintId: e.target.value || undefined })}
                      className="text-xs border-0 bg-transparent p-0 focus:ring-0 cursor-pointer text-gray-700"
                    >
                      <option value="">Backlog</option>
                      {sprints.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Reporter">
                    <div className="flex items-center gap-1.5">
                      <Avatar user={reporter} size="xs" />
                      <span className="text-xs text-gray-700">{reporter?.name ?? '—'}</span>
                    </div>
                  </Field>

                  <Field label="Created">
                    <span className="text-xs text-gray-600">{formatDate(issue.createdAt)}</span>
                  </Field>

                  <Field label="Updated">
                    <span className="text-xs text-gray-600">{formatRelativeDate(issue.updatedAt)}</span>
                  </Field>
                </div>

                {/* Labels */}
                {labels.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Labels</p>
                    <div className="flex flex-wrap gap-1.5">
                      {labels.map((label) => (
                        <span
                          key={label.id}
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${label.color}18`, color: label.color }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {issue.description && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Description</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg px-3 py-3">
                      {issue.description}
                    </p>
                  </div>
                )}

                {/* Acceptance criteria */}
                {issue.acceptanceCriteria && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Acceptance Criteria</p>
                    <div className="bg-indigo-50/60 rounded-lg px-3 py-3 border border-indigo-100">
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                        {issue.acceptanceCriteria}
                      </p>
                    </div>
                  </div>
                )}

                {/* Subtasks */}
                <div>
                  {subtasks.length > 0 && (
                    <div className="mb-2">
                      <ProgressBar value={sp.percentage} size="sm" color="emerald" showLabel />
                    </div>
                  )}
                  <SubtaskList parentId={issue.id} />
                </div>
              </div>
            ) : (
              <ActivitySection issueId={issue.id} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      {children}
    </div>
  );
}
