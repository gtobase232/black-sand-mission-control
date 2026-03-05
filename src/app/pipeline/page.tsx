'use client';
import { useState } from 'react';
import MissionBanner from '@/components/MissionBanner';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedLeads } from '@/lib/seed-data';
import { Lead, LeadStage } from '@/lib/types';

const stages: { key: LeadStage; label: string; color: string }[] = [
  { key: 'discovery', label: 'Discovery', color: 'bg-purple-500' },
  { key: 'outreach', label: 'Outreach', color: 'bg-blue-500' },
  { key: 'call', label: 'Call', color: 'bg-yellow-500' },
  { key: 'proposal', label: 'Proposal', color: 'bg-[#e94560]' },
  { key: 'closed', label: 'Closed', color: 'bg-green-500' },
];

export default function PipelinePage() {
  const [leads, setLeads] = useLocalStorage<Lead[]>('bs-leads', seedLeads);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  const openCreate = (stage: LeadStage) => {
    setEditingLead({
      id: Date.now().toString(),
      company: '',
      contact: '',
      value: 0,
      stage,
      notes: '',
      lastContact: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead({ ...lead });
    setModalOpen(true);
  };

  const saveLead = () => {
    if (!editingLead || !editingLead.company.trim()) return;
    setLeads(prev => {
      const exists = prev.find(l => l.id === editingLead.id);
      if (exists) return prev.map(l => l.id === editingLead.id ? editingLead : l);
      return [...prev, editingLead];
    });
    setModalOpen(false);
    setEditingLead(null);
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setModalOpen(false);
    setEditingLead(null);
  };

  const handleDrop = (stage: LeadStage) => {
    if (!draggedLead) return;
    setLeads(prev => prev.map(l => l.id === draggedLead ? { ...l, stage } : l));
    setDraggedLead(null);
  };

  const totalPipelineValue = leads.filter(l => l.stage !== 'closed').reduce((s, l) => s + l.value, 0);
  const closedValue = leads.filter(l => l.stage === 'closed').reduce((s, l) => s + l.value, 0);

  return (
    <div>
      <MissionBanner />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lead Pipeline</h1>
          <p className="mt-1 text-sm text-[#888]">
            Pipeline: <span className="text-white font-medium">${totalPipelineValue.toLocaleString()}</span>
            {' · '}Closed: <span className="text-green-400 font-medium">${closedValue.toLocaleString()}</span>
          </p>
        </div>
        <button onClick={() => openCreate('discovery')} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">+ New Lead</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.key);
          const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
          return (
            <div
              key={stage.key}
              className="min-w-[240px] flex-1"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <h3 className="text-sm font-medium text-[#888]">{stage.label}</h3>
                </div>
                <span className="text-xs text-[#555]">${stageValue.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                {stageLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDraggedLead(lead.id)}
                    onClick={() => openEdit(lead)}
                    className="cursor-pointer rounded-lg border border-[#222] bg-[#111] p-3 transition-all hover:border-[#333] hover:bg-[#1a1a1a]"
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                  >
                    <h4 className="text-sm font-medium">{lead.company}</h4>
                    <p className="mt-0.5 text-xs text-[#888]">{lead.contact}</p>
                    <p className="mt-2 text-xs text-[#666] line-clamp-2">{lead.notes}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-400">${lead.value.toLocaleString()}</span>
                      <span className="text-[10px] text-[#555]">{lead.lastContact}</span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => openCreate(stage.key)}
                  className="w-full rounded-lg border border-dashed border-[#222] p-2 text-xs text-[#555] transition-colors hover:border-[#444] hover:text-[#888]"
                >
                  + Add lead
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingLead(null); }} title={editingLead && leads.find(l => l.id === editingLead.id) ? 'Edit Lead' : 'New Lead'}>
        {editingLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Company</label>
                <input value={editingLead.company} onChange={e => setEditingLead({ ...editingLead, company: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Contact</label>
                <input value={editingLead.contact} onChange={e => setEditingLead({ ...editingLead, contact: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Deal Value ($)</label>
                <input type="number" value={editingLead.value} onChange={e => setEditingLead({ ...editingLead, value: Number(e.target.value) })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Stage</label>
                <select value={editingLead.stage} onChange={e => setEditingLead({ ...editingLead, stage: e.target.value as LeadStage })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Notes</label>
              <textarea value={editingLead.notes} onChange={e => setEditingLead({ ...editingLead, notes: e.target.value })} rows={3} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Last Contact</label>
              <input type="date" value={editingLead.lastContact} onChange={e => setEditingLead({ ...editingLead, lastContact: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div className="flex justify-between pt-2">
              {leads.find(l => l.id === editingLead.id) && (
                <button onClick={() => deleteLead(editingLead.id)} className="rounded-lg px-4 py-2 text-sm text-[#e94560] transition-colors hover:bg-[#e94560]/10">Delete</button>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={() => { setModalOpen(false); setEditingLead(null); }} className="rounded-lg border border-[#222] px-4 py-2 text-sm text-[#888] transition-colors hover:bg-[#1a1a1a]">Cancel</button>
                <button onClick={saveLead} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">Save</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
