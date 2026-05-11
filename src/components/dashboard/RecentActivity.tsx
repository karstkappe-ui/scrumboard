'use client';
import { useIssueStore } from '@/store/issueStore';
import { MOCK_USERS } from '@/data/users';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeDate } from '@/lib/utils';
import type { ActivityLog } from '@/types';

function getActivityLabel(log: ActivityLog, issues: Record<string, { key: string; title: string }>): string {
  const issue = log.issueId ? issues[log.issueId] : null;
  const issueRef = issue ? `${issue.key}` : 'een issue';

  switch (log.action) {
    case 'issue_created': return `Aangemaakt: ${issueRef}`;
    case 'issue_deleted': return `Verwijderd: ${issueRef}`;
    case 'issue_moved':
      return `${issueRef} verplaatst naar ${log.newValue?.replace('_', ' ')}`;
    case 'issue_updated': return `${issueRef} bijgewerkt`;
    case 'issue_assigned': return `${issueRef} toegewezen`;
    case 'comment_added': return `Reactie op ${issueRef}`;
    case 'subtask_completed':
      return `Subtaak afgerond: ${log.metadata?.title ?? issueRef}`;
    case 'sprint_started':
      return `Sprint gestart: ${log.metadata?.sprintName ?? ''}`;
    case 'sprint_completed': return `Sprint afgerond`;
    default: return 'Issue bijgewerkt';
  }
}

export function RecentActivity() {
  const { activity, issues } = useIssueStore();
  const recent = activity.slice(0, 12);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-card-md hover:border-gray-200 transition-all duration-200">
      <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Recente activiteit</h3>
      {recent.length === 0 ? (
        <p className="text-xs text-gray-400">Nog geen activiteit.</p>
      ) : (
        <div className="space-y-3">
          {recent.map((log) => {
            const user = MOCK_USERS.find((u) => u.id === log.userId);
            return (
              <div key={log.id} className="flex items-start gap-2.5">
                <Avatar user={user} size="xs" className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-gray-600 leading-snug">
                    <span className="font-semibold text-gray-800">{user?.name ?? 'Iemand'}</span>{' '}
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
