'use client';
import { useState, useMemo } from 'react';
import MissionBanner from '@/components/MissionBanner';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedFinance } from '@/lib/seed-data';
import { FinanceEntry } from '@/lib/types';

export default function FinancePage() {
  const [entries, setEntries] = useLocalStorage<FinanceEntry[]>('bs-finance', seedFinance);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);

  const totalRevenue = useMemo(() => entries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0), [entries]);
  const totalExpenses = useMemo(() => entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0), [entries]);
  const profit = totalRevenue - totalExpenses;

  const projectBreakdown = useMemo(() => {
    const projects: Record<string, { revenue: number; expenses: number }> = {};
    entries.forEach(e => {
      if (!projects[e.project]) projects[e.project] = { revenue: 0, expenses: 0 };
      if (e.type === 'revenue') projects[e.project].revenue += e.amount;
      else projects[e.project].expenses += e.amount;
    });
    return projects;
  }, [entries]);

  const maxAmount = useMemo(() => Math.max(...Object.values(projectBreakdown).map(p => Math.max(p.revenue, p.expenses)), 1), [projectBreakdown]);

  const openCreate = () => {
    setEditingEntry({
      id: Date.now().toString(),
      project: 'General',
      type: 'expense',
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setModalOpen(true);
  };

  const openEdit = (entry: FinanceEntry) => {
    setEditingEntry({ ...entry });
    setModalOpen(true);
  };

  const saveEntry = () => {
    if (!editingEntry) return;
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
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <button onClick={openCreate} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">+ Add Entry</button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#222] bg-[#111] p-5">
          <p className="text-xs text-[#888]">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[#222] bg-[#111] p-5">
          <p className="text-xs text-[#888]">Total Expenses</p>
          <p className="mt-1 text-2xl font-bold text-[#e94560]">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[#222] bg-[#111] p-5">
          <p className="text-xs text-[#888]">Net Profit</p>
          <p className={`mt-1 text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-[#e94560]'}`}>${profit.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[#666]">Margin: {totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0}%</p>
        </div>
      </div>

      {/* Bar chart by project */}
      <div className="mb-6 rounded-xl border border-[#222] bg-[#111] p-5">
        <h2 className="mb-4 text-sm font-medium text-[#888]">Revenue vs Expenses by Project</h2>
        <div className="space-y-4">
          {Object.entries(projectBreakdown).map(([project, data]) => (
            <div key={project}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm">{project}</span>
                <span className="text-xs text-[#888]">
                  P/L: <span className={data.revenue - data.expenses >= 0 ? 'text-green-400' : 'text-[#e94560]'}>
                    ${(data.revenue - data.expenses).toLocaleString()}
                  </span>
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="h-6 rounded bg-[#0a0a0a]">
                    <div className="flex h-full items-center rounded bg-green-500/20 px-2 text-[10px] text-green-400" style={{ width: `${(data.revenue / maxAmount) * 100}%` }}>
                      ${data.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-6 rounded bg-[#0a0a0a]">
                    <div className="flex h-full items-center rounded bg-[#e94560]/20 px-2 text-[10px] text-[#e94560]" style={{ width: `${(data.expenses / maxAmount) * 100}%` }}>
                      ${data.expenses.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className="rounded-xl border border-[#222] bg-[#111] overflow-hidden">
        <div className="border-b border-[#222] px-5 py-3">
          <h2 className="text-sm font-medium text-[#888]">Transactions</h2>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {entries.map(entry => (
            <div
              key={entry.id}
              onClick={() => openEdit(entry)}
              className="flex cursor-pointer items-center justify-between px-5 py-3 transition-colors hover:bg-[#1a1a1a]"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${entry.type === 'revenue' ? 'bg-green-500' : 'bg-[#e94560]'}`} />
                <div>
                  <p className="text-sm">{entry.description}</p>
                  <p className="text-[10px] text-[#666]">{entry.project} · {entry.category}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${entry.type === 'revenue' ? 'text-green-400' : 'text-[#e94560]'}`}>
                {entry.type === 'revenue' ? '+' : '-'}${entry.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingEntry(null); }} title={editingEntry && entries.find(e => e.id === editingEntry.id) ? 'Edit Entry' : 'New Entry'}>
        {editingEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Type</label>
                <select value={editingEntry.type} onChange={e => setEditingEntry({ ...editingEntry, type: e.target.value as 'revenue' | 'expense' })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Amount ($)</label>
                <input type="number" value={editingEntry.amount} onChange={e => setEditingEntry({ ...editingEntry, amount: Number(e.target.value) })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Project</label>
                <input value={editingEntry.project} onChange={e => setEditingEntry({ ...editingEntry, project: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Category</label>
                <input value={editingEntry.category} onChange={e => setEditingEntry({ ...editingEntry, category: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Description</label>
              <input value={editingEntry.description} onChange={e => setEditingEntry({ ...editingEntry, description: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Date</label>
              <input type="date" value={editingEntry.date} onChange={e => setEditingEntry({ ...editingEntry, date: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
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
