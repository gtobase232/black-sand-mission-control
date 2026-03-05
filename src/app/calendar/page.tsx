'use client';
import { useState, useMemo } from 'react';
import MissionBanner from '@/components/MissionBanner';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedCalendarEvents } from '@/lib/seed-data';
import { CalendarEvent, Assignee } from '@/lib/types';

const typeColors: Record<string, string> = {
  meeting: 'bg-blue-500/20 text-blue-400',
  deadline: 'bg-[#e94560]/20 text-[#e94560]',
  review: 'bg-purple-500/20 text-purple-400',
  launch: 'bg-green-500/20 text-green-400',
  other: 'bg-[#333] text-[#888]',
};

const emptyEvent = (): CalendarEvent => ({
  id: Date.now().toString(),
  title: '',
  date: '',
  time: '',
  assignee: 'Both',
  type: 'meeting',
});

export default function CalendarPage() {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('bs-calendar', seedCalendarEvents);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(2026, 2, 1)); // March 2026
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  }, [currentMonth]);

  const monthStr = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const openCreate = (day: number) => {
    const ev = emptyEvent();
    ev.date = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setEditingEvent(ev);
    setModalOpen(true);
  };

  const openEdit = (ev: CalendarEvent) => {
    setEditingEvent({ ...ev });
    setModalOpen(true);
  };

  const saveEvent = () => {
    if (!editingEvent || !editingEvent.title.trim()) return;
    setEvents(prev => {
      const exists = prev.find(e => e.id === editingEvent.id);
      if (exists) return prev.map(e => e.id === editingEvent.id ? editingEvent : e);
      return [...prev, editingEvent];
    });
    setModalOpen(false);
    setEditingEvent(null);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setModalOpen(false);
    setEditingEvent(null);
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div>
      <MissionBanner />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="rounded-lg border border-[#222] px-3 py-1.5 text-sm text-[#888] hover:bg-[#1a1a1a]">←</button>
          <span className="text-sm font-medium">{monthStr}</span>
          <button onClick={nextMonth} className="rounded-lg border border-[#222] px-3 py-1.5 text-sm text-[#888] hover:bg-[#1a1a1a]">→</button>
        </div>
      </div>

      <div className="rounded-xl border border-[#222] bg-[#111] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#222]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="px-3 py-2 text-center text-xs font-medium text-[#666]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {daysInMonth.map((day, i) => (
            <div
              key={i}
              onClick={() => day && openCreate(day)}
              className={`min-h-[100px] cursor-pointer border-b border-r border-[#1a1a1a] p-2 transition-colors hover:bg-[#1a1a1a] ${!day ? 'bg-[#0a0a0a]' : ''}`}
            >
              {day && (
                <>
                  <span className="text-xs text-[#666]">{day}</span>
                  <div className="mt-1 space-y-1">
                    {getEventsForDay(day).map(ev => (
                      <div
                        key={ev.id}
                        onClick={e => { e.stopPropagation(); openEdit(ev); }}
                        className={`rounded px-1.5 py-0.5 text-[10px] truncate ${typeColors[ev.type]}`}
                      >
                        {ev.time && <span className="mr-1 opacity-70">{ev.time}</span>}
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingEvent(null); }} title={editingEvent && events.find(e => e.id === editingEvent.id) ? 'Edit Event' : 'New Event'}>
        {editingEvent && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-[#888]">Title</label>
              <input value={editingEvent.title} onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" placeholder="Event title..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Date</label>
                <input type="date" value={editingEvent.date} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Time</label>
                <input type="time" value={editingEvent.time} onChange={e => setEditingEvent({ ...editingEvent, time: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Assignee</label>
                <select value={editingEvent.assignee} onChange={e => setEditingEvent({ ...editingEvent, assignee: e.target.value as Assignee })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  <option value="Wolve">Wolve</option>
                  <option value="Trinkster">Trinkster</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Type</label>
                <select value={editingEvent.type} onChange={e => setEditingEvent({ ...editingEvent, type: e.target.value as CalendarEvent['type'] })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="review">Review</option>
                  <option value="launch">Launch</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              {events.find(e => e.id === editingEvent.id) && (
                <button onClick={() => deleteEvent(editingEvent.id)} className="rounded-lg px-4 py-2 text-sm text-[#e94560] transition-colors hover:bg-[#e94560]/10">Delete</button>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={() => { setModalOpen(false); setEditingEvent(null); }} className="rounded-lg border border-[#222] px-4 py-2 text-sm text-[#888] transition-colors hover:bg-[#1a1a1a]">Cancel</button>
                <button onClick={saveEvent} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">Save</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
