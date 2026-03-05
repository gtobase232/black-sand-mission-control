'use client';
import { useState } from 'react';
import MissionBanner from '@/components/MissionBanner';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedTasks } from '@/lib/seed-data';
import { Task, TaskStatus, Assignee, Priority } from '@/lib/types';

const columns: { key: TaskStatus; label: string }[] = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
];

const priorityColors: Record<Priority, string> = {
  low: 'bg-[#333] text-[#888]',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-yellow-500/20 text-yellow-400',
  critical: 'bg-[#e94560]/20 text-[#e94560]',
};

const emptyTask = (): Task => ({
  id: Date.now().toString(),
  title: '',
  description: '',
  assignee: 'Wolve',
  priority: 'medium',
  status: 'backlog',
  dueDate: '',
  createdAt: new Date().toISOString().split('T')[0],
});

export default function TaskBoard() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('bs-tasks', seedTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const openCreate = (status: TaskStatus) => {
    const t = emptyTask();
    t.status = status;
    setEditingTask(t);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask({ ...task });
    setModalOpen(true);
  };

  const saveTask = () => {
    if (!editingTask || !editingTask.title.trim()) return;
    setTasks(prev => {
      const exists = prev.find(t => t.id === editingTask.id);
      if (exists) return prev.map(t => t.id === editingTask.id ? editingTask : t);
      return [...prev, editingTask];
    });
    setModalOpen(false);
    setEditingTask(null);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask) return;
    setTasks(prev => prev.map(t => t.id === draggedTask ? { ...t, status } : t));
    setDraggedTask(null);
  };

  return (
    <div>
      <MissionBanner />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Task Board</h1>
        <button onClick={() => openCreate('backlog')} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">
          + New Task
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div
              key={col.key}
              className="min-w-[260px] flex-1"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.key)}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#888]">{col.label}</h3>
                <span className="rounded-full bg-[#1a1a1a] px-2 py-0.5 text-xs text-[#666]">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTask(task.id)}
                    onClick={() => openEdit(task)}
                    className="cursor-pointer rounded-lg border border-[#222] bg-[#111] p-3 transition-all hover:border-[#333] hover:bg-[#1a1a1a]"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium leading-snug">{task.title}</h4>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-[#666] line-clamp-2">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#555]">{task.assignee}</span>
                      {task.dueDate && <span className="text-[10px] text-[#555]">{task.dueDate}</span>}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => openCreate(col.key)}
                  className="w-full rounded-lg border border-dashed border-[#222] p-2 text-xs text-[#555] transition-colors hover:border-[#444] hover:text-[#888]"
                >
                  + Add task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingTask(null); }} title={editingTask && tasks.find(t => t.id === editingTask.id) ? 'Edit Task' : 'New Task'}>
        {editingTask && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-[#888]">Title</label>
              <input value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" placeholder="Task title..." />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Description</label>
              <textarea value={editingTask.description} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} rows={3} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" placeholder="Description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Assignee</label>
                <select value={editingTask.assignee} onChange={e => setEditingTask({ ...editingTask, assignee: e.target.value as Assignee })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  <option value="Wolve">Wolve</option>
                  <option value="Trinkster">Trinkster</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Priority</label>
                <select value={editingTask.priority} onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as Priority })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Status</label>
                <select value={editingTask.status} onChange={e => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  {columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Due Date</label>
                <input type="date" value={editingTask.dueDate} onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              {tasks.find(t => t.id === editingTask.id) && (
                <button onClick={() => deleteTask(editingTask.id)} className="rounded-lg px-4 py-2 text-sm text-[#e94560] transition-colors hover:bg-[#e94560]/10">Delete</button>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={() => { setModalOpen(false); setEditingTask(null); }} className="rounded-lg border border-[#222] px-4 py-2 text-sm text-[#888] transition-colors hover:bg-[#1a1a1a]">Cancel</button>
                <button onClick={saveTask} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">Save</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
