'use client';
import { useState } from 'react';
import MissionBanner from '@/components/MissionBanner';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedDailyReports } from '@/lib/seed-data';
import { DailyReport } from '@/lib/types';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function getStreak(reports: DailyReport[]): number {
  if (reports.length === 0) return 0;
  const sorted = [...reports].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date + 'T12:00:00');
    const curr = new Date(sorted[i].date + 'T12:00:00');
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export default function DailyReportsPage() {
  const [reports] = useLocalStorage<DailyReport[]>('bs-daily-reports', seedDailyReports);
  const sorted = [...reports].sort((a, b) => b.date.localeCompare(a.date));
  const [expandedId, setExpandedId] = useState<string>(sorted[0]?.id || '');

  const totalCompleted = reports.reduce((s, r) => s + r.completedItems.length, 0);
  const streak = getStreak(reports);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? '' : id);

  return (
    <div>
      <MissionBanner />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Daily Reports</h1>
        <p className="mt-1 text-sm text-[#888]">Operational changelog &amp; progress timeline</p>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-[#222] bg-[#111] p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#555]">Total Reports</p>
          <p className="mt-1 text-2xl font-bold">{reports.length}</p>
        </div>
        <div className="rounded-lg border border-[#222] bg-[#111] p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#555]">Items Completed</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{totalCompleted}</p>
        </div>
        <div className="rounded-lg border border-[#222] bg-[#111] p-4">
          <p className="text-[10px] uppercase tracking-wider text-[#555]">Day Streak</p>
          <p className="mt-1 text-2xl font-bold text-[#e94560]">{streak} 🔥</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[#222]" />

        {sorted.map((report, idx) => {
          const isExpanded = expandedId === report.id;
          return (
            <div key={report.id} className="relative pl-12" style={{ animation: `fadeIn 0.2s ease-out ${idx * 0.05}s both` }}>
              {/* Timeline dot */}
              <div className={`absolute left-3 top-5 h-3 w-3 rounded-full border-2 ${idx === 0 ? 'border-[#e94560] bg-[#e94560]' : 'border-[#333] bg-[#111]'}`} />

              <div
                className={`cursor-pointer rounded-lg border transition-all ${isExpanded ? 'border-[#333] bg-[#111]' : 'border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#1a1a1a]'}`}
                onClick={() => toggle(report.id)}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="text-base font-semibold">{formatDate(report.date)}</h3>
                    {!isExpanded && (
                      <p className="mt-1 text-xs text-[#666]">
                        <span className="text-green-400">{report.completedItems.length} completed</span>
                        {report.inProgress.length > 0 && <span className="text-yellow-400"> · {report.inProgress.length} in progress</span>}
                        {report.blockers.length > 0 && <span className="text-red-400"> · {report.blockers.length} blocker{report.blockers.length > 1 ? 's' : ''}</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {!isExpanded && (
                      <div className="flex gap-1.5">
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] text-green-400">{report.completedItems.length}</span>
                        {report.blockers.length > 0 && (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400">{report.blockers.length}</span>
                        )}
                      </div>
                    )}
                    <span className="text-sm text-[#555] transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-[#222] p-4 space-y-5">
                    {/* Completed */}
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-green-400">
                        <span>✅</span> Completed
                      </h4>
                      <div className="space-y-1.5">
                        {report.completedItems.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-[#ccc]">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#888]">
                        <span>📊</span> Key Metrics
                      </h4>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                        {report.metrics.map((m, i) => (
                          <div key={i} className="rounded-lg border border-[#222] bg-[#0a0a0a] p-2.5">
                            <p className="text-[10px] text-[#555]">{m.label}</p>
                            <p className="mt-0.5 text-sm font-semibold">{m.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* In Progress */}
                    {report.inProgress.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-yellow-400">
                          <span>🚧</span> In Progress
                        </h4>
                        <div className="space-y-1.5">
                          {report.inProgress.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-[#ccc]">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Focus */}
                    {report.focus.length > 0 && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#e94560]">
                          <span>➡️</span> Today&apos;s Focus
                        </h4>
                        <div className="space-y-1.5">
                          {report.focus.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-[#ccc]">
                              <span className="mt-1 text-xs text-[#e94560]">{i + 1}.</span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blockers */}
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-red-400">
                        <span>⚠️</span> Blockers
                      </h4>
                      {report.blockers.length > 0 ? (
                        <div className="space-y-1.5">
                          {report.blockers.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-red-300">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                              {item}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#555]">None — clear runway ✈️</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
