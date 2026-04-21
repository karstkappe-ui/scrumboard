'use client';
import { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { useSprintStore } from '@/store/sprintStore';
import { useProjectStore } from '@/store/projectStore';
import { Header } from '@/components/layout/Header';
import { SprintCard } from '@/components/sprint/SprintCard';
import { CreateSprintModal } from '@/components/sprint/CreateSprintModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Sprint } from '@/types';

export default function SprintsPage() {
  const { getSprintsByProject } = useSprintStore();
  const { getActiveProject } = useProjectStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [editSprint, setEditSprint] = useState<Sprint | undefined>();

  const project = getActiveProject();
  const sprints = project ? getSprintsByProject(project.id) : [];
  const active = sprints.filter((s) => s.status === 'active');
  const planning = sprints.filter((s) => s.status === 'planning');
  const completed = sprints.filter((s) => s.status === 'completed');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={project ? `${project.emoji} ${project.name} — Sprints` : 'Sprints'}
        subtitle={`${sprints.length} sprints · ${active.length} active`}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => { setEditSprint(undefined); setCreateOpen(true); }}
          >
            New Sprint
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {sprints.length === 0 ? (
          <EmptyState
            icon={<Zap size={40} />}
            title="No sprints yet"
            description="Create your first sprint to start planning your work."
            action={
              <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={() => setCreateOpen(true)}>
                Create Sprint
              </Button>
            }
          />
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <Section title="Active Sprint" count={active.length}>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {active.map((sprint) => (
                    <SprintCard key={sprint.id} sprint={sprint} onEdit={(s) => { setEditSprint(s); setCreateOpen(true); }} />
                  ))}
                </div>
              </Section>
            )}
            {planning.length > 0 && (
              <Section title="Upcoming Sprints" count={planning.length}>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {planning.map((sprint) => (
                    <SprintCard key={sprint.id} sprint={sprint} onEdit={(s) => { setEditSprint(s); setCreateOpen(true); }} />
                  ))}
                </div>
              </Section>
            )}
            {completed.length > 0 && (
              <Section title="Completed Sprints" count={completed.length}>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {completed.map((sprint) => (
                    <SprintCard key={sprint.id} sprint={sprint} onEdit={(s) => { setEditSprint(s); setCreateOpen(true); }} />
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>

      {project && (
        <CreateSprintModal
          open={createOpen}
          onClose={() => { setCreateOpen(false); setEditSprint(undefined); }}
          editSprint={editSprint}
          projectId={project.id}
        />
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{count}</span>
      </div>
      {children}
    </div>
  );
}
