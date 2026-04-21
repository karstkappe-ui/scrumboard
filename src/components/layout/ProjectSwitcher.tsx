'use client';
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Project } from '@/types';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { useSprintStore } from '@/store/sprintStore';
import { cn } from '@/lib/utils';

export function ProjectSwitcher({ collapsed }: { collapsed: boolean }) {
  const { getAllProjects, activeProjectId, setActiveProject } = useProjectStore();
  const { setActiveSprint } = useUIStore();
  const { getActiveSprint } = useSprintStore();
  const [open, setOpen] = useState(false);

  const projects = getAllProjects();
  const active = projects.find((p) => p.id === activeProjectId);

  const handleSelect = (projectId: string) => {
    setActiveProject(projectId);
    const sprint = getActiveSprint(projectId);
    if (sprint) setActiveSprint(projectId, sprint.id);
    setOpen(false);
  };

  if (collapsed) {
    return (
      <div className="relative px-2 py-2">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-center rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          title={active?.name}
        >
          <span className="text-lg leading-none">{active?.emoji ?? '📋'}</span>
        </button>
        {open && (
          <div className="absolute left-full top-0 ml-2 z-50 w-52 bg-white border border-gray-200 rounded-xl shadow-panel py-1.5">
            <ProjectList projects={projects} activeId={activeProjectId} onSelect={handleSelect} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative px-3 py-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-gray-100 transition-colors group"
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm flex-shrink-0"
          style={{ backgroundColor: `${active?.color}18` }}
        >
          {active?.emoji ?? '📋'}
        </span>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-bold text-gray-900 truncate">{active?.name ?? 'Select project'}</p>
          <p className="text-[10px] text-gray-400 leading-tight truncate">{active?.key} · scrum board</p>
        </div>
        <ChevronDown size={13} className="text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-panel py-1.5">
            <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Projects
            </p>
            <ProjectList projects={projects} activeId={activeProjectId} onSelect={handleSelect} />
          </div>
        </>
      )}
    </div>
  );
}

function ProjectList({
  projects,
  activeId,
  onSelect,
}: {
  projects: Project[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {projects.map((project) => (
        <button
          key={project.id}
          onClick={() => onSelect(project.id)}
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md text-sm flex-shrink-0"
            style={{ backgroundColor: `${project.color}18` }}
          >
            {project.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{project.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{project.key}</p>
          </div>
          {project.id === activeId && <Check size={13} className="text-indigo-500 flex-shrink-0" />}
        </button>
      ))}
    </>
  );
}
