'use client';
import { Calendar, Zap, ArrowRight } from 'lucide-react';
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-center justify-center min-h-[180px]">
        <p className="text-sm text-gray-400">Geen actieve sprint in dit project.</p>
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-card-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-indigo-500 fill-indigo-500 flex-shrink-0" />
            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-[0.08em]">Actieve Sprint</p>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 truncate">{sprint.name}</h3>
          {sprint.goal && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{sprint.goal}</p>
          )}
        </div>
        <Badge variant={daysLeft <= 2 ? 'danger' : daysLeft <= 5 ? 'warning' : 'info'}>
          {daysLeft === 0 ? 'Eindigt vandaag' : `${daysLeft}d over`}
        </Badge>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4">
        <Calendar size={11} className="flex-shrink-0" />
        <span>{formatShortDate(sprint.startDate)} — {formatShortDate(sprint.endDate)}</span>
      </div>

      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-gray-500 font-medium">Issues voltooid</span>
            <span className="font-semibold text-gray-700">{doneCount} / {issues.length}</span>
          </div>
          <ProgressBar value={issueProgress} color={issueProgress >= 75 ? 'emerald' : 'indigo'} showLabel />
        </div>
        <div>
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-gray-500 font-medium">Story points</span>
            <span className="font-semibold text-gray-700">{spProgress.completed} / {spProgress.total} SP</span>
          </div>
          <ProgressBar value={spProgress.percentage} color="blue" showLabel />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3.5 border-t border-gray-50">
        {[
          { color: '#F59E0B', label: 'Bezig', count: inProgressCount },
          { color: '#7C3AED', label: 'Review', count: reviewCount },
          { color: '#059669', label: 'Klaar', count: doneCount },
        ].map(({ color, label, count }) => (
          <span key={label} className="flex items-center gap-1 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="font-semibold text-gray-700">{count}</span>
            <span className="text-gray-400 hidden sm:inline">{label}</span>
          </span>
        ))}
        <Link
          href="/board"
          className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group"
        >
          Board
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
