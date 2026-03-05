'use client';
import { useState } from 'react';
import MissionBanner from '@/components/MissionBanner';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedMemoryEntries } from '@/lib/seed-data';
import { MemoryEntry } from '@/lib/types';

const categoryColors: Record<string, string> = {
  decision: 'bg-[#e94560]/20 text-[#e94560]',
  insight: 'bg-blue-500/20 text-blue-400',
  milestone: 'bg-green-500/20 text-green-400',
  note: 'bg-[#333] text-[#888]',
};

const categoryIcons: Record<string, string> = {
  decision: '⚡',
  insight: '💡',
  milestone: '🏁',
  note: '📝',
};

export default function MemoryPage() {
  const [entries, setEntries] = useLocalStorage<MemoryEntry[]>('bs-memory', seedMemoryEntries);
  const [tab, setTab] = useState<'daily' | 'longterm'>('daily');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MemoryEntry | null>(null);
  const [longTermDoc, setLongTermDoc] = useLocalStorage<string>('bs-memory-longterm',
    `# Black Sand — Long-Term Memory\n\n## Core Strategy\n- Focus on B2B SaaS in LATAM, then expand to US\n- Agent-first approach (not chatbots, not workflows)\n- Pricing: $2K-10K/month per agent, enterprise custom above $25K\n- HQ in CDMX for timezone advantage covering both markets\n\n## Key Learnings\n- Hyper-personalized emails get 3x response rate\n- Thread format performs best on X\n- Prediction markets need strict risk management (max 5% per position)\n- Local businesses willing to pay $800-1200 for AI-generated websites\n\n## Milestones\n- Feb 20: Hit 1,000 X followers\n- Mar 2: First paying client ($5K MRR)\n- Mar 4: 1,180 X followers\n\n## Important Contacts\n- Carlos Mendez (TechFlow MX) — hot lead, $15K potential\n- Ana García (Rappi Ads) — enterprise opportunity, $25K\n- Fernando Ruiz (Bitso) — trading desk analysis, $30K\n\n## Technical Decisions\n- Stack: Node.js + TypeScript + Claude API\n- Database: PostgreSQL + pgvector for memory\n- Queue: Redis + BullMQ for agent orchestration\n- Real-time streaming responses for all agents`
  );

  const filteredEntries = entries
    .filter(e => !search || e.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  const groupedByDate = filteredEntries.reduce<Record<string, MemoryEntry[]>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const openCreate = () => {
    setEditingEntry({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content: '',
      category: 'note',
    });
    setModalOpen(true);
  };

  const openEdit = (entry: MemoryEntry) => {
    setEditingEntry({ ...entry });
    setModalOpen(true);
  };

  const saveEntry = () => {
    if (!editingEntry || !editingEntry.content.trim()) return;
    setEntries(prev => {
      const exists = prev.find(e => e.id === editingEntry.id);
      if (exists) return prev.map(e => e.id === editingEntry.id ? editingEntry : e);
      return [...prev, editingEntry];
    });
    setModalOpen(false);
    setEditingEntry(null);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setModalOpen(false);
    setEditingEntry(null);
  };

  return (
    <div>
      <MissionBanner />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Memory</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('daily')} className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${tab === 'daily' ? 'bg-[#e94560] text-white' : 'border border-[#222] text-[#888] hover:bg-[#1a1a1a]'}`}>Daily</button>
          <button onClick={() => setTab('longterm')} className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${tab === 'longterm' ? 'bg-[#e94560] text-white' : 'border border-[#222] text-[#888] hover:bg-[#1a1a1a]'}`}>Long-term</button>
        </div>
      </div>

      {tab === 'daily' ? (
        <>
          <div className="mb-4 flex gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search memories..."
              className="flex-1 rounded-lg border border-[#222] bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]"
            />
            <button onClick={openCreate} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">+ Add</button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, dayEntries]) => (
              <div key={date} style={{ animation: 'fadeIn 0.2s ease-out' }}>
                <h3 className="mb-3 text-sm font-medium text-[#666]">{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                <div className="relative ml-4 border-l border-[#222] pl-6 space-y-3">
                  {dayEntries.map(entry => (
                    <div
                      key={entry.id}
                      onClick={() => openEdit(entry)}
                      className="relative cursor-pointer rounded-lg border border-[#222] bg-[#111] p-4 transition-all hover:border-[#333] hover:bg-[#1a1a1a]"
                    >
                      <div className="absolute -left-[31px] top-4 h-3 w-3 rounded-full border-2 border-[#222] bg-[#111]" />
                      <div className="mb-2 flex items-center gap-2">
                        <span>{categoryIcons[entry.category]}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${categoryColors[entry.category]}`}>{entry.category}</span>
                      </div>
                      <p className="text-sm text-[#ccc]">{entry.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-[#222] bg-[#111] p-6">
          <textarea
            value={longTermDoc}
            onChange={e => setLongTermDoc(e.target.value)}
            className="min-h-[500px] w-full bg-transparent font-mono text-sm text-[#ccc] outline-none"
            placeholder="Write your long-term memory document here..."
          />
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingEntry(null); }} title={editingEntry && entries.find(e => e.id === editingEntry.id) ? 'Edit Memory' : 'New Memory'}>
        {editingEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Date</label>
                <input type="date" value={editingEntry.date} onChange={e => setEditingEntry({ ...editingEntry, date: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Category</label>
                <select value={editingEntry.category} onChange={e => setEditingEntry({ ...editingEntry, category: e.target.value as MemoryEntry['category'] })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  <option value="decision">Decision</option>
                  <option value="insight">Insight</option>
                  <option value="milestone">Milestone</option>
                  <option value="note">Note</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Content</label>
              <textarea value={editingEntry.content} onChange={e => setEditingEntry({ ...editingEntry, content: e.target.value })} rows={4} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" placeholder="What happened?" />
            </div>
            <div className="flex justify-between pt-2">
              {entries.find(e => e.id === editingEntry.id) && (
                <button onClick={() => deleteEntry(editingEntry.id)} className="rounded-lg px-4 py-2 text-sm text-[#e94560] transition-colors hover:bg-[#e94560]/10">Delete</button>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={() => { setModalOpen(false); setEditingEntry(null); }} className="rounded-lg border border-[#222] px-4 py-2 text-sm text-[#888] transition-colors hover:bg-[#1a1a1a]">Cancel</button>
                <button onClick={saveEntry} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">Save</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
