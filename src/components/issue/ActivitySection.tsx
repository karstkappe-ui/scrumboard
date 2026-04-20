'use client';
import { useState } from 'react';
import { useIssueStore } from '@/store/issueStore';
import { MOCK_USERS } from '@/data/users';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeDate } from '@/lib/utils';
import type { ActivityLog } from '@/types';

function getActivityText(log: ActivityLog): string {
  switch (log.action) {
    case 'issue_created': return 'created this issue';
    case 'issue_updated': return log.field ? `updated ${log.field}` : 'updated this issue';
    case 'issue_moved': return `moved to ${log.newValue?.replace('_', ' ')}`;
    case 'issue_assigned': return 'changed the assignee';
    case 'comment_added': return 'left a comment';
    case 'subtask_completed': return `completed a subtask`;
    default: return 'updated this issue';
  }
}

interface ActivitySectionProps {
  issueId: string;
}

export function ActivitySection({ issueId }: ActivitySectionProps) {
  const { activity, getIssueComments, addComment } = useIssueStore();
  const [newComment, setNewComment] = useState('');

  const issueActivity = activity.filter((a) => a.issueId === issueId).slice(0, 10);
  const comments = getIssueComments(issueId);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    addComment(issueId, 'user-1', newComment.trim());
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      {/* Comments */}
      <div>
        <p className="text-xs font-semibold text-gray-700 mb-3">Comments</p>
        {comments.length === 0 && <p className="text-xs text-gray-400">No comments yet.</p>}
        <div className="space-y-3">
          {comments.map((comment) => {
            const author = MOCK_USERS.find((u) => u.id === comment.authorId);
            return (
              <div key={comment.id} className="flex gap-2">
                <Avatar user={author} size="sm" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-800">{author?.name}</span>
                    <span className="text-[10px] text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add comment */}
        <div className="flex gap-2 mt-3">
          <Avatar user={MOCK_USERS[0]} size="sm" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment…"
              rows={2}
              className="w-full text-xs rounded-lg border border-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) handleSubmitComment();
              }}
            />
            {newComment.trim() && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleSubmitComment}
                  className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded-md"
                >
                  Comment
                </button>
                <button
                  onClick={() => setNewComment('')}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity log */}
      {issueActivity.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Activity</p>
          <div className="space-y-2">
            {issueActivity.map((log) => {
              const user = MOCK_USERS.find((u) => u.id === log.userId);
              return (
                <div key={log.id} className="flex items-start gap-2">
                  <Avatar user={user} size="xs" className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-gray-800">{user?.name}</span>{' '}
                    {getActivityText(log)}
                    <span className="text-gray-400 ml-1.5">{formatRelativeDate(log.createdAt)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
