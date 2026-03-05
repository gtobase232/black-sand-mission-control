'use client';
import { useMemo } from 'react';
import MissionBanner from '@/components/MissionBanner';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedAnalytics } from '@/lib/seed-data';
import { AnalyticsData } from '@/lib/types';

export default function AnalyticsPage() {
  const [data] = useLocalStorage<AnalyticsData>('bs-analytics', seedAnalytics);

  const maxFollowers = useMemo(() => Math.max(...data.xFollowers.map(d => d.count)), [data]);
  const maxImpressions = useMemo(() => Math.max(...data.contentPerformance.map(d => d.impressions)), [data]);
  const latestFollowers = data.xFollowers[data.xFollowers.length - 1]?.count || 0;
  const followerGrowth = data.xFollowers.length >= 2
    ? latestFollowers - data.xFollowers[0].count
    : 0;

  return (
    <div>
      <MissionBanner />
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Analytics</h1>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#222] bg-[#111] p-5">
          <p className="text-xs text-[#888]">X Followers</p>
          <p className="mt-1 text-2xl font-bold">{latestFollowers.toLocaleString()}</p>
          <p className="mt-1 text-xs text-green-400">+{followerGrowth} this period</p>
        </div>
        <div className="rounded-xl border border-[#222] bg-[#111] p-5">
          <p className="text-xs text-[#888]">Avg Engagement</p>
          <p className="mt-1 text-2xl font-bold">4.2%</p>
          <p className="mt-1 text-xs text-green-400">Above industry avg</p>
        </div>
        <div className="rounded-xl border border-[#222] bg-[#111] p-5">
          <p className="text-xs text-[#888]">Total Impressions</p>
          <p className="mt-1 text-2xl font-bold">{data.contentPerformance.reduce((s, d) => s + d.impressions, 0).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[#222] bg-[#111] p-5">
          <p className="text-xs text-[#888]">Total Leads</p>
          <p className="mt-1 text-2xl font-bold">{data.conversionRates.reduce((s, d) => s + d.leads, 0)}</p>
        </div>
      </div>

      {/* Follower growth chart */}
      <div className="mb-6 rounded-xl border border-[#222] bg-[#111] p-5">
        <h2 className="mb-4 text-sm font-medium text-[#888]">X Followers Growth</h2>
        <div className="flex items-end gap-2" style={{ height: 200 }}>
          {data.xFollowers.map((point, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-[#888]">{point.count}</span>
              <div
                className="w-full rounded-t bg-[#e94560] transition-all"
                style={{ height: `${(point.count / maxFollowers) * 160}px` }}
              />
              <span className="text-[9px] text-[#555]">
                {new Date(point.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content performance */}
      <div className="mb-6 rounded-xl border border-[#222] bg-[#111] p-5">
        <h2 className="mb-4 text-sm font-medium text-[#888]">Content Performance</h2>
        <div className="space-y-3">
          {data.contentPerformance.map((post, i) => (
            <div key={i} className="rounded-lg bg-[#0a0a0a] p-3" style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">{post.title}</p>
              </div>
              <div className="mb-2 h-3 rounded-full bg-[#1a1a1a]">
                <div className="flex h-full items-center rounded-full bg-blue-500/30 px-2" style={{ width: `${(post.impressions / maxImpressions) * 100}%` }}>
                  <span className="text-[9px] text-blue-400">{post.impressions.toLocaleString()} impressions</span>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-[#888]">
                <span>Engagement: <span className="text-white">{post.engagement.toLocaleString()}</span></span>
                <span>Clicks: <span className="text-white">{post.clicks.toLocaleString()}</span></span>
                <span>CTR: <span className="text-green-400">{((post.clicks / post.impressions) * 100).toFixed(1)}%</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion rates */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-5">
        <h2 className="mb-4 text-sm font-medium text-[#888]">Conversion Rates by Source</h2>
        <div className="overflow-hidden rounded-lg border border-[#222]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222] bg-[#0a0a0a]">
                <th className="px-4 py-2 text-left text-xs text-[#888] font-medium">Source</th>
                <th className="px-4 py-2 text-right text-xs text-[#888] font-medium">Visitors</th>
                <th className="px-4 py-2 text-right text-xs text-[#888] font-medium">Leads</th>
                <th className="px-4 py-2 text-right text-xs text-[#888] font-medium">Conv. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {data.conversionRates.map((row, i) => (
                <tr key={i} className="transition-colors hover:bg-[#1a1a1a]">
                  <td className="px-4 py-2.5 text-sm">{row.source}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-[#888]">{row.visitors.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-[#888]">{row.leads}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${row.rate >= 5 ? 'bg-green-500/20 text-green-400' : row.rate >= 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#333] text-[#888]'}`}>
                      {row.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
