'use client';
import { useState } from 'react';
import MissionBanner from '@/components/MissionBanner';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedTeam } from '@/lib/seed-data';
import { TeamMember } from '@/lib/types';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  idle: 'bg-yellow-500/20 text-yellow-400',
  offline: 'bg-[#333] text-[#666]',
};

export default function TeamPage() {
  const [team, setTeam] = useLocalStorage<TeamMember[]>('bs-team', seedTeam);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const openEdit = (member: TeamMember) => {
    setEditingMember({ ...member });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingMember({
      id: Date.now().toString(),
      name: '',
      role: '',
      status: 'active',
      currentTask: '',
      avatar: '🤖',
    });
    setModalOpen(true);
  };

  const saveMember = () => {
    if (!editingMember || !editingMember.name.trim()) return;
    setTeam(prev => {
      const exists = prev.find(m => m.id === editingMember.id);
      if (exists) return prev.map(m => m.id === editingMember.id ? editingMember : m);
      return [...prev, editingMember];
    });
    setModalOpen(false);
    setEditingMember(null);
  };

  const deleteMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    setModalOpen(false);
    setEditingMember(null);
  };

  return (
    <div>
      <MissionBanner />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <button onClick={openCreate} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">+ Add Agent</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map(member => (
          <div
            key={member.id}
            onClick={() => openEdit(member)}
            className="cursor-pointer rounded-xl border border-[#222] bg-[#111] p-6 transition-all hover:border-[#333] hover:bg-[#1a1a1a]"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1a1a] text-3xl">
                {member.avatar}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-[#888]">{member.role}</p>
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : member.status === 'idle' ? 'bg-yellow-500' : 'bg-[#555]'}`}
                style={member.status === 'active' ? { animation: 'pulseDot 2s ease-in-out infinite' } : {}} />
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColors[member.status]}`}>
                {member.status}
              </span>
            </div>

            <div className="rounded-lg bg-[#0a0a0a] p-3">
              <p className="text-[10px] text-[#666]">Current Task</p>
              <p className="text-sm text-[#ccc]">{member.currentTask || 'No active task'}</p>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingMember(null); }} title={editingMember && team.find(m => m.id === editingMember.id) ? 'Edit Agent' : 'New Agent'}>
        {editingMember && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Name</label>
                <input value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Avatar Emoji</label>
                <input value={editingMember.avatar} onChange={e => setEditingMember({ ...editingMember, avatar: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Role</label>
              <input value={editingMember.role} onChange={e => setEditingMember({ ...editingMember, role: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Status</label>
                <select value={editingMember.status} onChange={e => setEditingMember({ ...editingMember, status: e.target.value as TeamMember['status'] })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Current Task</label>
              <input value={editingMember.currentTask} onChange={e => setEditingMember({ ...editingMember, currentTask: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div className="flex justify-between pt-2">
              {team.find(m => m.id === editingMember.id) && (
                <button onClick={() => deleteMember(editingMember.id)} className="rounded-lg px-4 py-2 text-sm text-[#e94560] transition-colors hover:bg-[#e94560]/10">Delete</button>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={() => { setModalOpen(false); setEditingMember(null); }} className="rounded-lg border border-[#222] px-4 py-2 text-sm text-[#888] transition-colors hover:bg-[#1a1a1a]">Cancel</button>
                <button onClick={saveMember} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">Save</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
