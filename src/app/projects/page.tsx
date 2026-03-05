'use client';
import { useState } from 'react';
import MissionBanner from '@/components/MissionBanner';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedProjects } from '@/lib/seed-data';
import { Project, ProjectStatus } from '@/lib/types';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-purple-500/20 text-purple-400',
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-blue-500/20 text-blue-400',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useLocalStorage<Project[]>('bs-projects', seedProjects);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const openEdit = (project: Project) => {
    setEditingProject({ ...project, kpis: project.kpis.map(k => ({ ...k })) });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingProject({
      id: Date.now().toString(),
      name: '',
      description: '',
      status: 'planning',
      progress: 0,
      kpis: [{ label: '', value: '', target: '' }],
    });
    setModalOpen(true);
  };

  const saveProject = () => {
    if (!editingProject || !editingProject.name.trim()) return;
    setProjects(prev => {
      const exists = prev.find(p => p.id === editingProject.id);
      if (exists) return prev.map(p => p.id === editingProject.id ? editingProject : p);
      return [...prev, editingProject];
    });
    setModalOpen(false);
    setEditingProject(null);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setModalOpen(false);
    setEditingProject(null);
  };

  return (
    <div>
      <MissionBanner />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <button onClick={openCreate} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">
          + New Project
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map(project => (
          <div
            key={project.id}
            onClick={() => openEdit(project)}
            className="cursor-pointer rounded-xl border border-[#222] bg-[#111] p-5 transition-all hover:border-[#333] hover:bg-[#1a1a1a]"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[project.status]}`}>
                {project.status}
              </span>
            </div>
            <p className="mb-4 text-sm text-[#888] line-clamp-2">{project.description}</p>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs text-[#666]">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#222]">
                <div className="h-full rounded-full bg-[#e94560] transition-all" style={{ width: `${project.progress}%` }} />
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
              {project.kpis.map((kpi, i) => (
                <div key={i} className="rounded-lg bg-[#0a0a0a] p-2">
                  <p className="text-[10px] text-[#666]">{kpi.label}</p>
                  <p className="text-sm font-semibold">{kpi.value}</p>
                  <p className="text-[10px] text-[#555]">/ {kpi.target}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingProject(null); }} title={editingProject && projects.find(p => p.id === editingProject.id) ? 'Edit Project' : 'New Project'}>
        {editingProject && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-[#888]">Name</label>
              <input value={editingProject.name} onChange={e => setEditingProject({ ...editingProject, name: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Description</label>
              <textarea value={editingProject.description} onChange={e => setEditingProject({ ...editingProject, description: e.target.value })} rows={3} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Status</label>
                <select value={editingProject.status} onChange={e => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Progress (%)</label>
                <input type="number" min="0" max="100" value={editingProject.progress} onChange={e => setEditingProject({ ...editingProject, progress: Number(e.target.value) })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              {projects.find(p => p.id === editingProject.id) && (
                <button onClick={() => deleteProject(editingProject.id)} className="rounded-lg px-4 py-2 text-sm text-[#e94560] transition-colors hover:bg-[#e94560]/10">Delete</button>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={() => { setModalOpen(false); setEditingProject(null); }} className="rounded-lg border border-[#222] px-4 py-2 text-sm text-[#888] transition-colors hover:bg-[#1a1a1a]">Cancel</button>
                <button onClick={saveProject} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">Save</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
