'use client';
import { Calendar, Zap } from 'lucide-react';
import { useSprintStore } from '@/store/sprintStore';
import { useIssueStore } from '@/store/issueStore';
import { useProjectStore } from '@/store/projectStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { formatShortDate, getSprintDaysRemaining, getSprintProgress, getStoryPointProgress } from '@/lib/utils';
import Link from 'next/link';

export function SprintProgressCard() {
  const { getActiveSprint } = useSprintStore();
  const { getIssuesBySprint } = useIssueStore();
  const { getActiveProject } = useProjectStore();

  const project = getActiveProject();
  const sprint = project ? getActiveSprint(project.id) : undefined;
  if (!sprint) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5 flex items-center justify-center">
        <p className="text-sm text-gray-400">No active sprint in this project.</p>
      </div>
    );
  }

  const issues = getIssuesBySprint(sprint.id);
  const issueProgress = getSprintProgress(issues);
  const spProgress = getStoryPointProgress(issues);
  const daysLeft = getSprintDaysRemaining(sprint.endDate);
  const doneCount = issues.filter((i) => i.status === 'done').length;
  const inProgressCount = issues.filter((i) => i.status === 'in_progress').length;
  const reviewCount = issues.filter((i) => i.status === 'review').length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-indigo-500" />
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Active Sprint</p>
          </div>
          <h3 className="text-base font-semibold text-gray-900">{sprint.name}</h3>
          {sprint.goal && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{sprint.goal}</p>}
        </div>
        <Badge variant={daysLeft <= 2 ? 'danger' : daysLeft <= 5 ? 'warning' : 'info'}>
          {daysLeft === 0 ? 'Ends today' : `${daysLeft}d left`}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <Calendar size={12} />
        <span>{formatShortDate(sprint.startDate)} — {formatShortDate(sprint.endDate)}</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Issues completed</span>
            <span className="font-medium text-gray-700">{doneCount} / {issues.length}</span>
          </div>
          <ProgressBar value={issueProgress} color={issueProgress >= 75 ? 'emerald' : 'indigo'} showLabel />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Story points</span>
            <span className="font-medium text-gray-700">{spProgress.completed} / {spProgress.total} SP</span>
          </div>
          <ProgressBar value={spProgress.percentage} color="blue" showLabel />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
        {[
          { color: '#F59E0B', label: 'In Progress', count: inProgressCount },
          { color: '#7C3AED', label: 'In Review', count: reviewCount },
          { color: '#059669', label: 'Done', count: doneCount },
        ].map(({ color, label, count }) => (
          <span key={label} className="flex items-center gap-1 text-xs text-gray-600">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-gray-400">{count}</span>
            <span className="hidden sm:inline">{label}</span>
          </span>
        ))}
        <Link href="/board" className="ml-auto text-xs font-medium text-indigo-600 hover:text-indigo-700">
          View Board →
        </Link>
      </div>
    </div>
  );
}
