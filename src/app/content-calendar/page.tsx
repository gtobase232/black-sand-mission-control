'use client';
import { useState, useMemo } from 'react';
import MissionBanner from '@/components/MissionBanner';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedContentPosts } from '@/lib/seed-data';
import { ContentPost } from '@/lib/types';

const statusColors: Record<string, string> = {
  draft: 'bg-[#333] text-[#888]',
  scheduled: 'bg-blue-500/20 text-blue-400',
  published: 'bg-green-500/20 text-green-400',
};

const platformIcons: Record<string, string> = {
  x: '𝕏',
  linkedin: 'in',
  both: '𝕏+in',
};

export default function ContentCalendarPage() {
  const [posts, setPosts] = useLocalStorage<ContentPost[]>('bs-content', seedContentPosts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);

  // Get week days starting from current week
  const weekDays = useMemo(() => {
    const start = new Date('2026-03-04');
    const dayOfWeek = start.getDay();
    const monday = new Date(start);
    monday.setDate(start.getDate() - dayOfWeek + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, []);

  const openCreate = (date?: string) => {
    setEditingPost({
      id: Date.now().toString(),
      title: '',
      content: '',
      scheduledDate: date || new Date().toISOString().split('T')[0],
      scheduledTime: '10:00',
      status: 'draft',
      platform: 'x',
    });
    setModalOpen(true);
  };

  const openEdit = (post: ContentPost) => {
    setEditingPost({ ...post });
    setModalOpen(true);
  };

  const savePost = () => {
    if (!editingPost || !editingPost.title.trim()) return;
    setPosts(prev => {
      const exists = prev.find(p => p.id === editingPost.id);
      if (exists) return prev.map(p => p.id === editingPost.id ? editingPost : p);
      return [...prev, editingPost];
    });
    setModalOpen(false);
    setEditingPost(null);
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setModalOpen(false);
    setEditingPost(null);
  };

  const publishedCount = posts.filter(p => p.status === 'published').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;

  return (
    <div>
      <MissionBanner />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content Calendar</h1>
          <p className="mt-1 text-sm text-[#888]">
            Published: <span className="text-green-400">{publishedCount}</span>
            {' · '}Scheduled: <span className="text-blue-400">{scheduledCount}</span>
            {' · '}Drafts: <span className="text-[#888]">{draftCount}</span>
          </p>
        </div>
        <button onClick={() => openCreate()} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">+ New Post</button>
      </div>

      {/* Weekly grid */}
      <div className="mb-6 rounded-xl border border-[#222] bg-[#111] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#222]">
          {weekDays.map(date => (
            <div key={date} className="border-r border-[#222] px-3 py-2 last:border-r-0">
              <p className="text-xs text-[#888]">{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</p>
              <p className="text-sm font-medium">{new Date(date + 'T12:00:00').getDate()}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weekDays.map(date => {
            const dayPosts = posts.filter(p => p.scheduledDate === date);
            return (
              <div
                key={date}
                className="min-h-[120px] border-r border-[#222] p-2 last:border-r-0 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                onClick={() => openCreate(date)}
              >
                <div className="space-y-1.5">
                  {dayPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={e => { e.stopPropagation(); openEdit(post); }}
                      className="rounded-lg border border-[#222] bg-[#0a0a0a] p-2 transition-all hover:border-[#333]"
                      style={{ animation: 'fadeIn 0.2s ease-out' }}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className={`rounded px-1 py-0.5 text-[9px] font-medium ${statusColors[post.status]}`}>{post.status}</span>
                        <span className="text-[9px] text-[#666]">{platformIcons[post.platform]}</span>
                      </div>
                      <p className="text-[10px] font-medium leading-tight line-clamp-2">{post.title}</p>
                      <p className="mt-1 text-[9px] text-[#555]">{post.scheduledTime}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All posts list */}
      <div className="rounded-xl border border-[#222] bg-[#111] overflow-hidden">
        <div className="border-b border-[#222] px-5 py-3">
          <h2 className="text-sm font-medium text-[#888]">All Posts</h2>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {posts.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)).map(post => (
            <div
              key={post.id}
              onClick={() => openEdit(post)}
              className="flex cursor-pointer items-center justify-between px-5 py-3 transition-colors hover:bg-[#1a1a1a]"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColors[post.status]}`}>{post.status}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                  <p className="text-xs text-[#666]">{post.scheduledDate} at {post.scheduledTime} · {platformIcons[post.platform]}</p>
                </div>
              </div>
              {post.impressions && (
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs text-[#888]">{post.impressions.toLocaleString()} imp</p>
                  <p className="text-[10px] text-[#555]">{post.engagement?.toLocaleString()} eng</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingPost(null); }} title={editingPost && posts.find(p => p.id === editingPost.id) ? 'Edit Post' : 'New Post'}>
        {editingPost && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-[#888]">Title</label>
              <input value={editingPost.title} onChange={e => setEditingPost({ ...editingPost, title: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Content</label>
              <textarea value={editingPost.content} onChange={e => setEditingPost({ ...editingPost, content: e.target.value })} rows={5} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Date</label>
                <input type="date" value={editingPost.scheduledDate} onChange={e => setEditingPost({ ...editingPost, scheduledDate: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Time</label>
                <input type="time" value={editingPost.scheduledTime} onChange={e => setEditingPost({ ...editingPost, scheduledTime: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Platform</label>
                <select value={editingPost.platform} onChange={e => setEditingPost({ ...editingPost, platform: e.target.value as ContentPost['platform'] })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                  <option value="x">X (Twitter)</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Status</label>
              <select value={editingPost.status} onChange={e => setEditingPost({ ...editingPost, status: e.target.value as ContentPost['status'] })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex justify-between pt-2">
              {posts.find(p => p.id === editingPost.id) && (
                <button onClick={() => deletePost(editingPost.id)} className="rounded-lg px-4 py-2 text-sm text-[#e94560] transition-colors hover:bg-[#e94560]/10">Delete</button>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={() => { setModalOpen(false); setEditingPost(null); }} className="rounded-lg border border-[#222] px-4 py-2 text-sm text-[#888] transition-colors hover:bg-[#1a1a1a]">Cancel</button>
                <button onClick={savePost} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">Save</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
