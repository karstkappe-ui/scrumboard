'use client';
import { Calendar, Play, CheckCircle2, MoreHorizontal, Pencil, Trash2, Target } from 'lucide-react';
import type { Sprint } from '@/types';
import { useSprintStore } from '@/store/sprintStore';
import { useIssueStore } from '@/store/issueStore';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { formatShortDate, getStoryPointProgress, getSprintProgress, getSprintDaysRemaining } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SprintCardProps {
  sprint: Sprint;
  onEdit?: (sprint: Sprint) => void;
}

export function SprintCard({ sprint, onEdit }: SprintCardProps) {
  const { startSprint, completeSprint, deleteSprint } = useSprintStore();
  const { getIssuesBySprint } = useIssueStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const issues = getIssuesBySprint(sprint.id);
  const sp = getStoryPointProgress(issues);
  const issueProgress = getSprintProgress(issues);
  const daysLeft = getSprintDaysRemaining(sprint.endDate);

  const statusVariant =
    sprint.status === 'active' ? 'info' : sprint.status === 'completed' ? 'success' : 'default';

  const byStatus = {
    todo: issues.filter((i) => i.status === 'todo').length,
    in_progress: issues.filter((i) => i.status === 'in_progress').length,
    review: issues.filter((i) => i.status === 'review').length,
    done: issues.filter((i) => i.status === 'done').length,
    backlog: issues.filter((i) => i.status === 'backlog').length,
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border shadow-card p-5',
        sprint.status === 'active' ? 'border-indigo-200 shadow-md' : 'border-gray-100',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-gray-900">{sprint.name}</h3>
            <Badge variant={statusVariant}>
              {sprint.status === 'active' ? 'Active' : sprint.status === 'completed' ? 'Completed' : 'Planning'}
            </Badge>
            {sprint.status === 'active' && daysLeft <= 3 && (
              <Badge variant="danger">{daysLeft === 0 ? 'Ends today!' : `${daysLeft}d left`}</Badge>
            )}
          </div>
          {sprint.goal && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sprint.goal}</p>
          )}
        </div>

        <div className="relative flex-shrink-0 ml-2">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-40 bg-white border border-gray-200 rounded-lg shadow-panel py-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => { onEdit?.(sprint); setMenuOpen(false); }}
              >
                <Pencil size={12} /> Edit sprint
              </button>
              {sprint.status === 'planning' && (
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  onClick={() => { deleteSprint(sprint.id); setMenuOpen(false); }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dates & counts */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {formatShortDate(sprint.startDate)} — {formatShortDate(sprint.endDate)}
        </span>
        <span className="text-gray-300">·</span>
        <span>{issues.length} issues</span>
        <span className="text-gray-300">·</span>
        <span>{sp.total} SP</span>
      </div>

      {/* Progress */}
      {sprint.status !== 'planning' && (
        <div className="space-y-2 mb-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Issues</span>
              <span className="text-gray-700 font-medium">{byStatus.done}/{issues.length}</span>
            </div>
            <ProgressBar value={issueProgress} color={sprint.status === 'completed' ? 'emerald' : 'indigo'} size="sm" showLabel />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Story points</span>
              <span className="text-gray-700 font-medium">{sp.completed}/{sp.total}</span>
            </div>
            <ProgressBar value={sp.percentage} color="blue" size="sm" showLabel />
          </div>
        </div>
      )}

      {/* Status breakdown */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        {Object.entries(byStatus).filter(([, count]) => count > 0).map(([status, count]) => {
          const colors: Record<string, string> = {
            backlog: '#9CA3AF', todo: '#3B82F6', in_progress: '#F59E0B', review: '#8B5CF6', done: '#10B981',
          };
          return (
            <span key={status} className="flex items-center gap-1 text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors[status] }} />
              {count} {status.replace('_', ' ')}
            </span>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
        {sprint.status === 'planning' && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Play size={13} />}
            onClick={() => startSprint(sprint.id)}
          >
            Start Sprint
          </Button>
        )}
        {sprint.status === 'active' && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<CheckCircle2 size={13} />}
            onClick={() => completeSprint(sprint.id)}
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            Complete Sprint
          </Button>
        )}
        {sprint.status === 'active' && (
          <span className="text-xs text-gray-400 ml-auto">
            {sprint.status === 'active' && `${daysLeft}d remaining`}
          </span>
        )}
      </div>
    </div>
  );
}
