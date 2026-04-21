'use client';
import { useIssueStore } from '@/store/issueStore';
import { useSprintStore } from '@/store/sprintStore';
import { useProjectStore } from '@/store/projectStore';
import { MOCK_USERS } from '@/data/users';
import { Avatar } from '@/components/ui/Avatar';

export function AssigneeBreakdown() {
  const { getIssuesBySprint } = useIssueStore();
  const { getActiveSprint } = useSprintStore();
  const { getActiveProject } = useProjectStore();

  const project = getActiveProject();
  const sprint = project ? getActiveSprint(project.id) : undefined;
  const issues = sprint ? getIssuesBySprint(sprint.id) : [];

  const data = MOCK_USERS.map((user) => {
    const assigned = issues.filter((i) => i.assigneeId === user.id);
    const done = assigned.filter((i) => i.status === 'done').length;
    return { user, total: assigned.length, done };
  })
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Team Workload</h3>
      {data.length === 0 ? (
        <p className="text-xs text-gray-400">No assignments in active sprint.</p>
      ) : (
        <div className="space-y-3">
          {data.map(({ user, total, done }) => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar user={user} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 truncate">{user.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{done}/{total}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(total / maxTotal) * 100}%`, backgroundColor: user.color, opacity: 0.7 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
