'use client';
import { useIssueStore } from '@/store/issueStore';
import { useSprintStore } from '@/store/sprintStore';
import { useProjectStore } from '@/store/projectStore';
import { BOARD_COLUMNS } from '@/lib/constants';

export function StatusBreakdown() {
  const { getIssuesBySprint } = useIssueStore();
  const { getActiveSprint } = useSprintStore();
  const { getActiveProject } = useProjectStore();

  const project = getActiveProject();
  const sprint = project ? getActiveSprint(project.id) : undefined;
  const issues = sprint ? getIssuesBySprint(sprint.id) : [];
  const total = issues.length || 1;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Status Distribution</h3>
      <div className="space-y-3">
        {BOARD_COLUMNS.map((col) => {
          const count = issues.filter((i) => i.status === col.status).length;
          return (
            <div key={col.status} className="flex items-center gap-3">
              <div className="w-20 text-xs text-gray-600 truncate flex-shrink-0">{col.label}</div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((count / total) * 100)}%`, backgroundColor: col.color }}
                />
              </div>
              <div className="text-xs font-medium text-gray-700 w-4 text-right">{count}</div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4">{issues.length} total issues in active sprint</p>
    </div>
  );
}
