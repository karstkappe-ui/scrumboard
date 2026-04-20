'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Zap, Play, CheckCircle2 } from 'lucide-react';
import type { Sprint, Issue } from '@/types';
import { BacklogItem } from './BacklogItem';
import { Badge } from '@/components/ui/Badge';
import { formatShortDate, getStoryPointProgress } from '@/lib/utils';
import { useSprintStore } from '@/store/sprintStore';
import { useIssueStore } from '@/store/issueStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SprintGroupProps {
  sprint: Sprint;
  issues: Issue[];
  onEditIssue?: (issue: Issue) => void;
}

export function SprintGroup({ sprint, issues, onEditIssue }: SprintGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const { startSprint, completeSprint } = useSprintStore();
  const sp = getStoryPointProgress(issues);

  const statusBadgeVariant =
    sprint.status === 'active' ? 'info' : sprint.status === 'completed' ? 'success' : 'default';

  return (
    <div className="mb-4">
      {/* Sprint header */}
      <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white group transition-colors">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {expanded ? (
            <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
          )}
          <Zap size={14} className="text-indigo-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-800">{sprint.name}</span>
          <Badge variant={statusBadgeVariant} size="sm">
            {sprint.status}
          </Badge>
          <span className="text-xs text-gray-400">
            {formatShortDate(sprint.startDate)} — {formatShortDate(sprint.endDate)}
          </span>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500">{issues.length} issues</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{sp.total} SP</span>

          {sprint.status === 'planning' && (
            <Button
              variant="outline"
              size="xs"
              leftIcon={<Play size={11} />}
              onClick={(e) => { e.stopPropagation(); startSprint(sprint.id); }}
            >
              Start sprint
            </Button>
          )}
          {sprint.status === 'active' && (
            <Button
              variant="outline"
              size="xs"
              leftIcon={<CheckCircle2 size={11} />}
              onClick={(e) => { e.stopPropagation(); completeSprint(sprint.id); }}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* Issues list */}
      {expanded && (
        <div className="ml-4 mt-1 space-y-0.5">
          {issues.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-2">
              No issues in this sprint. Add some from the backlog.
            </p>
          ) : (
            issues.map((issue) => (
              <BacklogItem key={issue.id} issue={issue} onEdit={onEditIssue} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
