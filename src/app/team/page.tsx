'use client';
import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Circle, Clock, Eye } from 'lucide-react';
import { useIssueStore } from '@/store/issueStore';
import { useProjectStore } from '@/store/projectStore';
import { useSprintStore } from '@/store/sprintStore';
import { MOCK_USERS } from '@/data/users';
import { Avatar } from '@/components/ui/Avatar';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import type { Issue, IssueStatus, Priority } from '@/types';

const STATUS_META: Record<IssueStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  backlog:     { label: 'Backlog',      icon: <Circle size={12} />,       color: 'text-gray-400',   bg: 'bg-gray-100'    },
  todo:        { label: 'Te doen',      icon: <Circle size={12} />,       color: 'text-indigo-500', bg: 'bg-indigo-50'   },
  in_progress: { label: 'In uitvoering',icon: <Clock size={12} />,        color: 'text-amber-600',  bg: 'bg-amber-50'    },
  review:      { label: 'Review',       icon: <Eye size={12} />,          color: 'text-purple-600', bg: 'bg-purple-50'   },
  done:        { label: 'Klaar',        icon: <CheckCircle2 size={12} />, color: 'text-emerald-600',bg: 'bg-emerald-50'  },
};

const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  low:    { label: 'Laag',   color: 'text-gray-400'  },
  medium: { label: 'Midden', color: 'text-blue-500'  },
  high:   { label: 'Hoog',   color: 'text-orange-500'},
  urgent: { label: 'Urgent', color: 'text-red-600'   },
};

const OPEN_STATUSES: IssueStatus[] = ['in_progress', 'review', 'todo', 'backlog'];
const STATUS_SORT: Record<IssueStatus, number> = { in_progress: 0, review: 1, todo: 2, backlog: 3, done: 4 };
const PRIORITY_SORT: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function TeamPage() {
  const { issues } = useIssueStore();
  const { getActiveProject } = useProjectStore();
  const { getActiveSprint } = useSprintStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const project = getActiveProject();
  const activeSprint = project ? getActiveSprint(project.id) : undefined;

  const projectIssues = Object.values(issues).filter(
    (i) => i.projectId === project?.id && i.type !== 'subtask',
  );

  const sprintIssueIds = new Set(
    activeSprint ? projectIssues.filter((i) => i.sprintId === activeSprint.id).map((i) => i.id) : [],
  );

  function getIssuesForUser(userId: string) {
    return projectIssues
      .filter((i) => i.assigneeId === userId)
      .sort((a, b) => {
        const statusDiff = STATUS_SORT[a.status] - STATUS_SORT[b.status];
        if (statusDiff !== 0) return statusDiff;
        return PRIORITY_SORT[a.priority] - PRIORITY_SORT[b.priority];
      });
  }

  const usersWithWork = MOCK_USERS.filter((u) =>
    projectIssues.some((i) => i.assigneeId === u.id),
  );
  const unassignedOpen = projectIssues.filter(
    (i) => !i.assigneeId && OPEN_STATUSES.includes(i.status),
  );

  const focusUser = selectedUser ?? usersWithWork[0]?.id ?? null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={project ? `${project.emoji} Team overzicht` : 'Team overzicht'}
        subtitle={activeSprint ? `Actieve sprint: ${activeSprint.name}` : 'Geen actieve sprint'}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: member list */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto p-3 space-y-1.5">
          <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Teamleden
          </p>
          {usersWithWork.map((user) => {
            const all = getIssuesForUser(user.id);
            const open = all.filter((i) => OPEN_STATUSES.includes(i.status));
            const inProgress = all.filter((i) => i.status === 'in_progress').length;
            const urgent = all.filter((i) => i.priority === 'urgent' && i.status !== 'done').length;
            const isActive = focusUser === user.id;
            return (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                  isActive
                    ? 'bg-white shadow-sm border border-gray-200'
                    : 'hover:bg-white hover:shadow-sm hover:border-gray-200 border border-transparent',
                )}
              >
                <Avatar user={user} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className={cn(
                    'text-xs font-bold',
                    open.length === 0 ? 'text-emerald-500' : 'text-gray-700',
                  )}>
                    {open.length} open
                  </span>
                  {inProgress > 0 && (
                    <span className="text-[10px] text-amber-600 font-medium">{inProgress} actief</span>
                  )}
                  {urgent > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-red-500 font-semibold">
                      <AlertCircle size={9} /> {urgent}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {unassignedOpen.length > 0 && (
            <>
              <div className="pt-2 pb-1">
                <p className="px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Niet toegewezen
                </p>
              </div>
              <button
                onClick={() => setSelectedUser('__unassigned__')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border',
                  focusUser === '__unassigned__'
                    ? 'bg-white shadow-sm border-gray-200'
                    : 'border-transparent hover:bg-white hover:shadow-sm hover:border-gray-200',
                )}
              >
                <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                  —
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700">Niemand</p>
                  <p className="text-xs text-gray-400">{unassignedOpen.length} open taken</p>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Right: detail panel */}
        <div className="flex-1 overflow-y-auto p-5">
          {focusUser && focusUser !== '__unassigned__' ? (
            <UserDetail
              user={MOCK_USERS.find((u) => u.id === focusUser)!}
              issues={getIssuesForUser(focusUser)}
              sprintIssueIds={sprintIssueIds}
              sprintName={activeSprint?.name}
            />
          ) : focusUser === '__unassigned__' ? (
            <UnassignedDetail issues={unassignedOpen} sprintIssueIds={sprintIssueIds} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Selecteer een teamlid
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserDetail({
  user,
  issues,
  sprintIssueIds,
  sprintName,
}: {
  user: { id: string; name: string; role: string; color: string; initials: string };
  issues: Issue[];
  sprintIssueIds: Set<string>;
  sprintName?: string;
}) {
  const open = issues.filter((i) => OPEN_STATUSES.includes(i.status));
  const done = issues.filter((i) => i.status === 'done');
  const sprintIssues = issues.filter((i) => sprintIssueIds.has(i.id));
  const sprintDone = sprintIssues.filter((i) => i.status === 'done').length;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* User header */}
      <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
        <Avatar user={user as never} size="lg" />
        <div className="flex-1">
          <h2 className="text-base font-bold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-400 capitalize">{user.role}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-amber-600">{open.filter((i) => i.status === 'in_progress').length}</p>
            <p className="text-xs text-gray-400">Actief</p>
          </div>
          <div>
            <p className="text-xl font-bold text-indigo-600">{open.length}</p>
            <p className="text-xs text-gray-400">Open</p>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600">{done.length}</p>
            <p className="text-xs text-gray-400">Klaar</p>
          </div>
        </div>
      </div>

      {/* Sprint progress */}
      {sprintName && sprintIssues.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">{sprintName}</p>
            <p className="text-xs text-gray-400">{sprintDone}/{sprintIssues.length} klaar</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: sprintIssues.length > 0 ? `${(sprintDone / sprintIssues.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* Open issues */}
      {open.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Open taken ({open.length})
          </p>
          <div className="space-y-2">
            {open.map((issue) => (
              <IssueRow key={issue.id} issue={issue} inSprint={sprintIssueIds.has(issue.id)} />
            ))}
          </div>
        </div>
      )}

      {open.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 size={32} className="text-emerald-400 mb-3" />
          <p className="text-sm font-semibold text-gray-700">Alles klaar!</p>
          <p className="text-xs text-gray-400 mt-1">Geen openstaande taken voor {user.name}</p>
        </div>
      )}

      {/* Done issues (collapsed summary) */}
      {done.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Afgerond ({done.length})
          </p>
          <div className="space-y-1.5 opacity-60">
            {done.slice(0, 5).map((issue) => (
              <IssueRow key={issue.id} issue={issue} inSprint={sprintIssueIds.has(issue.id)} />
            ))}
            {done.length > 5 && (
              <p className="text-xs text-gray-400 pl-3">+{done.length - 5} meer afgerond</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UnassignedDetail({ issues, sprintIssueIds }: { issues: Issue[]; sprintIssueIds: Set<string> }) {
  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">{issues.length} taken</span> zijn nog niet toegewezen aan een teamlid.
        </p>
      </div>
      <div className="space-y-2">
        {issues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} inSprint={sprintIssueIds.has(issue.id)} />
        ))}
      </div>
    </div>
  );
}

function IssueRow({ issue, inSprint }: { issue: Issue; inSprint: boolean }) {
  const status = STATUS_META[issue.status];
  const priority = PRIORITY_META[issue.priority];
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
      <div className={cn('mt-0.5 flex-shrink-0', status.color)}>{status.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug truncate">{issue.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-md', status.bg, status.color)}>
            {status.label}
          </span>
          <span className={cn('text-xs font-medium', priority.color)}>{priority.label}</span>
          {issue.storyPoints != null && (
            <span className="text-xs text-gray-400">{issue.storyPoints} SP</span>
          )}
          {inSprint && (
            <span className="text-xs text-indigo-400 font-medium flex items-center gap-0.5">
              <ArrowRight size={10} /> sprint
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
