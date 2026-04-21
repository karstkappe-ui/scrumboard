'use client';
import { useState } from 'react';
import { Calendar, Zap, ChevronDown } from 'lucide-react';
import { useSprintStore } from '@/store/sprintStore';
import { useUIStore } from '@/store/uiStore';
import { useIssueStore } from '@/store/issueStore';
import { useProjectStore } from '@/store/projectStore';
import { Badge } from '@/components/ui/Badge';
import { formatShortDate, getSprintDaysRemaining, getStoryPointProgress } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function SprintHeader() {
  const { getSprintsByProject, getSprintById } = useSprintStore();
  const { getActiveSprint: getActiveSprintId, setActiveSprint } = useUIStore();
  const { getIssuesBySprint } = useIssueStore();
  const { getActiveProject } = useProjectStore();
  const [open, setOpen] = useState(false);

  const project = getActiveProject();
  if (!project) return null;

  const sprints = getSprintsByProject(project.id);
  const activeSprintId = getActiveSprintId(project.id);
  const sprint = activeSprintId ? getSprintById(activeSprintId) : sprints.find((s) => s.status === 'active');
  if (!sprint) return null;

  const issues = getIssuesBySprint(sprint.id);
  const daysLeft = getSprintDaysRemaining(sprint.endDate);
  const sp = getStoryPointProgress(issues);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Zap size={16} className="text-indigo-500 flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900 truncate">{sprint.name}</h2>
              <Badge variant={sprint.status === 'active' ? 'info' : sprint.status === 'completed' ? 'success' : 'default'}>
                {sprint.status === 'active' ? 'Active' : sprint.status === 'completed' ? 'Completed' : 'Planning'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {formatShortDate(sprint.startDate)} — {formatShortDate(sprint.endDate)}
              </span>
              <span>{issues.length} issues</span>
              <span>{sp.total} SP total</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {sprint.status === 'active' && (
            <Badge variant={daysLeft <= 2 ? 'danger' : daysLeft <= 5 ? 'warning' : 'default'}>
              {daysLeft === 0 ? 'Ends today' : `${daysLeft}d left`}
            </Badge>
          )}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
            >
              Switch Sprint <ChevronDown size={12} />
            </button>
            {open && (
              <div className="absolute right-0 top-8 z-20 w-56 bg-white border border-gray-200 rounded-lg shadow-panel py-1">
                {sprints.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveSprint(project.id, s.id); setOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left"
                  >
                    <span className="truncate font-medium">{s.name}</span>
                    <Badge variant={s.status === 'active' ? 'info' : s.status === 'completed' ? 'success' : 'default'} size="sm">
                      {s.status}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {sprint.status === 'active' && (
        <div className="mt-3">
          <ProgressBar value={sp.percentage} color="emerald" size="sm" />
          <p className="text-[10px] text-gray-400 mt-1">{sp.completed}/{sp.total} story points completed</p>
        </div>
      )}
    </div>
  );
}
