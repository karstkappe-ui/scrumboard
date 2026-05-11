'use client';
import { useState } from 'react';
import { X, Copy, Pencil } from 'lucide-react';
import { useIssueStore } from '@/store/issueStore';
import { useSprintStore } from '@/store/sprintStore';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { MOCK_USERS } from '@/data/users';
import { MOCK_LABELS } from '@/data/labels';
import { ISSUE_TYPES, PRIORITIES, ISSUE_STATUSES, STORY_POINTS } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
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
        className="fixed inset-0 z-30 bg-gray-950/20 backdrop-blur-[2px] animate-fade-in"
        onClick={() => selectIssue(null)}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-[680px] bg-white border-l border-gray-100 shadow-panel-lg flex flex-col animate-slide-in-right">
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0 bg-gray-50/60">
          <div className="flex items-center gap-2.5">
            <IssueTypeIcon type={issue.type} size="md" />
            <span className="text-xs font-mono font-semibold text-gray-400 tracking-wider">{issue.key}</span>
            <div className="h-3.5 w-px bg-gray-200" />
            <StatusBadge status={issue.status} />
          </div>
          <div className="flex items-center gap-0.5">
            <button
              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Link kopiëren"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={() => selectIssue(null)}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
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
                className="w-full text-xl font-bold text-gray-900 border-b-2 border-indigo-400 outline-none bg-transparent pb-0.5 mb-0.5"
              />
            ) : (
              <h2
                className="text-xl font-bold text-gray-900 leading-snug cursor-pointer group flex items-start gap-2"
                onClick={() => { setEditingTitle(true); setTitleValue(issue.title); }}
              >
                <span className="flex-1">{issue.title}</span>
                <Pencil
                  size={13}
                  className="text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1.5"
                />
              </h2>
            )}

            {/* Tabs */}
            <div className="flex gap-0 mt-5 mb-5 border-b border-gray-100">
              {(['details', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'pb-2.5 px-1 mr-5 text-[13px] font-medium border-b-2 -mb-px transition-colors capitalize',
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600',
                  )}
                >
                  {tab === 'details' ? 'Details' : 'Activiteit'}
                </button>
              ))}
            </div>

            {activeTab === 'details' ? (
              <div className="space-y-5">
                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 bg-gray-50/60 rounded-xl p-4 border border-gray-100">
                  <Field label="Status">
                    <select
                      value={issue.status}
                      onChange={(e) => updateIssue(issue.id, { status: e.target.value as typeof issue.status })}
                      className="text-[13px] border-0 bg-transparent p-0 focus:ring-0 cursor-pointer text-gray-700 font-medium"
                    >
                      {ISSUE_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Prioriteit">
                    <div className="flex items-center gap-1.5">
                      <PriorityIcon priority={issue.priority} size="sm" />
                      <select
                        value={issue.priority}
                        onChange={(e) => updateIssue(issue.id, { priority: e.target.value as typeof issue.priority })}
                        className="text-[13px] border-0 bg-transparent p-0 focus:ring-0 cursor-pointer text-gray-700 font-medium"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </Field>

                  <Field label="Toegewezen aan">
                    <div className="flex items-center gap-1.5">
                      <Avatar user={assignee} size="xs" />
                      <select
                        value={issue.assigneeId ?? ''}
                        onChange={(e) => updateIssue(issue.id, { assigneeId: e.target.value || undefined })}
                        className="text-[13px] border-0 bg-transparent p-0 focus:ring-0 cursor-pointer text-gray-700"
                      >
                        <option value="">Niet toegewezen</option>
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
                      className="text-[13px] border-0 bg-transparent p-0 focus:ring-0 cursor-pointer text-gray-700 font-medium"
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
                      className="text-[13px] border-0 bg-transparent p-0 focus:ring-0 cursor-pointer text-gray-700"
                    >
                      <option value="">Backlog</option>
                      {sprints.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Rapporteur">
                    <div className="flex items-center gap-1.5">
                      <Avatar user={reporter} size="xs" />
                      <span className="text-[13px] text-gray-700">{reporter?.name ?? '—'}</span>
                    </div>
                  </Field>

                  <Field label="Aangemaakt">
                    <span className="text-[13px] text-gray-600">{formatDate(issue.createdAt)}</span>
                  </Field>

                  <Field label="Gewijzigd">
                    <span className="text-[13px] text-gray-600">{formatRelativeDate(issue.updatedAt)}</span>
                  </Field>
                </div>

                {/* Labels */}
                {labels.length > 0 && (
                  <div>
                    <SectionLabel>Labels</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {labels.map((label) => (
                        <span
                          key={label.id}
                          className="px-2 py-1 rounded-full text-[11px] font-semibold"
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
                    <SectionLabel>Omschrijving</SectionLabel>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      {issue.description}
                    </p>
                  </div>
                )}

                {/* Acceptance criteria */}
                {issue.acceptanceCriteria && (
                  <div>
                    <SectionLabel>Acceptatiecriteria</SectionLabel>
                    <div className="bg-indigo-50/60 rounded-xl px-4 py-3 border border-indigo-100">
                      <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">
                        {issue.acceptanceCriteria}
                      </p>
                    </div>
                  </div>
                )}

                {/* Subtasks */}
                <div>
                  {subtasks.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <SectionLabel className="mb-0">Subtaken</SectionLabel>
                        <span className="text-[11px] font-semibold text-gray-400">
                          {subtasks.filter(s => s.status === 'done').length}/{subtasks.length}
                        </span>
                      </div>
                      <ProgressBar value={sp.percentage} size="sm" color="emerald" />
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
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-1">{label}</p>
      {children}
    </div>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-[11px] font-semibold text-gray-500 uppercase tracking-[0.07em] mb-2', className)}>
      {children}
    </p>
  );
}
