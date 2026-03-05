'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Task Board', icon: '▣' },
  { href: '/calendar', label: 'Calendar', icon: '◈' },
  { href: '/projects', label: 'Projects', icon: '◆' },
  { href: '/memory', label: 'Memory', icon: '◉' },
  { href: '/docs', label: 'Docs', icon: '▤' },
  { href: '/team', label: 'Team', icon: '◎' },
  { href: '/virtual-office', label: 'Virtual Office', icon: '⌂' },
  { href: '/finance', label: 'Finance', icon: '◇' },
  { href: '/pipeline', label: 'Lead Pipeline', icon: '▷' },
  { href: '/analytics', label: 'Analytics', icon: '◫' },
  { href: '/content-calendar', label: 'Content', icon: '▦' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-[#222] bg-[#111] p-2 text-white md:hidden"
      >
        {collapsed ? '✕' : '☰'}
      </button>

      <aside className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-[#222] bg-[#0a0a0a] transition-all duration-200 ${collapsed ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0'} md:w-56 lg:w-64`}>
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-[#222] px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e94560] text-sm font-bold">BS</div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Black Sand</h1>
            <p className="text-[10px] text-[#888]">Mission Control</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCollapsed(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                    isActive
                      ? 'bg-[#e94560]/10 text-[#e94560]'
                      : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-[#222] px-5 py-4">
          <p className="text-[10px] text-[#555]">CDMX · Targeting $50M</p>
          <p className="mt-1 text-[10px] text-[#333]">v1.0 · Mission Control</p>
        </div>
      </aside>
    </>
  );
}
