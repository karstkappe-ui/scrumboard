'use client';
import { CheckCircle2, Clock, AlertTriangle, Layers, TrendingUp, BarChart2 } from 'lucide-react';
import { useIssueStore } from '@/store/issueStore';
import { useSprintStore } from '@/store/sprintStore';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SprintProgressCard } from '@/components/dashboard/SprintProgressCard';
import { StatusBreakdown } from '@/components/dashboard/StatusBreakdown';
import { AssigneeBreakdown } from '@/components/dashboard/AssigneeBreakdown';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { issues } = useIssueStore();
  const { getActiveSprint, getIssuesBySprint } = { ...useSprintStore(), ...useIssueStore() };
  const activeSprint = useSprintStore((s) => s.getActiveSprint());

  const allIssues = Object.values(issues).filter((i) => i.type !== 'subtask');
  const sprintIssues = activeSprint ? Object.values(issues).filter((i) => i.sprintId === activeSprint.id && i.type !== 'subtask') : [];
  const backlogCount = allIssues.filter((i) => !i.sprintId).length;
  const openCount = allIssues.filter((i) => ['todo', 'in_progress', 'review'].includes(i.status)).length;
  const inProgressCount = sprintIssues.filter((i) => i.status === 'in_progress').length;
  const doneCount = sprintIssues.filter((i) => i.status === 'done').length;
  const urgentCount = allIssues.filter((i) => i.priority === 'urgent' && i.status !== 'done').length;
  const totalSP = sprintIssues.reduce((s, i) => s + (i.storyPoints ?? 0), 0);

  const today = formatDate(new Date().toISOString());

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Dashboard"
        subtitle={`Good morning, Karst · ${today}`}
      />

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Open Issues"
            value={openCount}
            subtitle="Across all sprints"
            icon={<Layers size={20} />}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
          />
          <StatsCard
            title="In Progress"
            value={inProgressCount}
            subtitle={activeSprint ? activeSprint.name : 'No active sprint'}
            icon={<Clock size={20} />}
            iconBg="#FFFBEB"
            iconColor="#D97706"
          />
          <StatsCard
            title="Done This Sprint"
            value={doneCount}
            subtitle={`of ${sprintIssues.length} total`}
            icon={<CheckCircle2 size={20} />}
            iconBg="#ECFDF5"
            iconColor="#059669"
            trend={sprintIssues.length > 0 ? { value: Math.round((doneCount / sprintIssues.length) * 100), label: '% complete' } : undefined}
          />
          <StatsCard
            title="Story Points"
            value={totalSP}
            subtitle="Total in active sprint"
            icon={<BarChart2 size={20} />}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
          />
        </div>

        {urgentCount > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-semibold">{urgentCount} urgent issue{urgentCount > 1 ? 's' : ''}</span> need immediate attention.
            </p>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <SprintProgressCard />
          </div>
          <div>
            <AssigneeBreakdown />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <StatusBreakdown />
          </div>
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        </div>

        {/* Backlog summary */}
        <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Backlog Summary</h3>
            <a href="/backlog" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Backlog', value: backlogCount, color: '#6B7280' },
              { label: 'Epics', value: allIssues.filter((i) => i.type === 'epic').length, color: '#7C3AED' },
              { label: 'Stories', value: allIssues.filter((i) => i.type === 'story').length, color: '#2563EB' },
              { label: 'Bugs', value: allIssues.filter((i) => i.type === 'bug').length, color: '#DC2626' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
