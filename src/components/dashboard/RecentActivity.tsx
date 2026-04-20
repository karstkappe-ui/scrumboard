'use client';
import { useIssueStore } from '@/store/issueStore';
import { MOCK_USERS } from '@/data/users';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeDate } from '@/lib/utils';
import type { ActivityLog } from '@/types';

function getActivityLabel(log: ActivityLog, issues: Record<string, { key: string; title: string }>): string {
  const issue = log.issueId ? issues[log.issueId] : null;
  const issueRef = issue ? `${issue.key}` : 'an issue';

  switch (log.action) {
    case 'issue_created': return `Created ${issueRef}`;
    case 'issue_deleted': return `Deleted ${issueRef}`;
    case 'issue_moved':
      return `Moved ${issueRef} to ${log.newValue?.replace('_', ' ')}`;
    case 'issue_updated': return `Updated ${issueRef}`;
    case 'issue_assigned': return `Assigned ${issueRef}`;
    case 'comment_added': return `Commented on ${issueRef}`;
    case 'subtask_completed':
      return `Completed subtask: ${log.metadata?.title ?? issueRef}`;
    case 'sprint_started':
      return `Started sprint: ${log.metadata?.sprintName ?? ''}`;
    case 'sprint_completed': return `Completed a sprint`;
    default: return 'Updated an issue';
  }
}

export function RecentActivity() {
  const { activity, issues } = useIssueStore();

  const recent = activity.slice(0, 12);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
      {recent.length === 0 ? (
        <p className="text-xs text-gray-400">No activity yet.</p>
      ) : (
        <div className="space-y-3">
          {recent.map((log) => {
            const user = MOCK_USERS.find((u) => u.id === log.userId);
            return (
              <div key={log.id} className="flex items-start gap-2.5">
                <Avatar user={user} size="xs" className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-tight">
                    <span className="font-medium">{user?.name ?? 'Someone'}</span>{' '}
                    {getActivityLabel(log, issues)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatRelativeDate(log.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
