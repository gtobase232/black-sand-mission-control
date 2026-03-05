'use client';
import { useState } from 'react';
import MissionBanner from '@/components/MissionBanner';
import Modal from '@/components/Modal';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { seedDocs } from '@/lib/seed-data';
import { Doc } from '@/lib/types';

function renderMarkdown(text: string) {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-[#222] px-1.5 py-0.5 text-[#e94560] text-xs">$1</code>')
    .replace(/^```(\w+)?\n([\s\S]*?)```$/gm, '<pre class="rounded-lg bg-[#0a0a0a] p-3 my-3 overflow-x-auto text-xs text-[#ccc]"><code>$2</code></pre>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-[#ccc] list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-sm text-[#ccc] list-decimal">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function DocsPage() {
  const [docs, setDocs] = useLocalStorage<Doc[]>('bs-docs', seedDocs);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null);

  const filtered = docs.filter(d =>
    !search ||
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.project.toLowerCase().includes(search.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const projects = [...new Set(docs.map(d => d.project))];

  const openCreate = () => {
    setEditingDoc({
      id: Date.now().toString(),
      title: '',
      project: projects[0] || '',
      content: '',
      updatedAt: new Date().toISOString().split('T')[0],
      tags: [],
    });
    setModalOpen(true);
  };

  const openEdit = (doc: Doc) => {
    setEditingDoc({ ...doc, tags: [...doc.tags] });
    setModalOpen(true);
  };

  const saveDoc = () => {
    if (!editingDoc || !editingDoc.title.trim()) return;
    setDocs(prev => {
      const exists = prev.find(d => d.id === editingDoc.id);
      if (exists) return prev.map(d => d.id === editingDoc.id ? editingDoc : d);
      return [...prev, editingDoc];
    });
    setModalOpen(false);
    setEditingDoc(null);
  };

  const deleteDoc = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    setModalOpen(false);
    setEditingDoc(null);
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  if (selectedDoc) {
    return (
      <div>
        <MissionBanner />
        <button onClick={() => setSelectedDoc(null)} className="mb-4 text-sm text-[#888] hover:text-white transition-colors">← Back to Docs</button>
        <div className="rounded-xl border border-[#222] bg-[#111] p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{selectedDoc.title}</h1>
              <p className="mt-1 text-sm text-[#888]">{selectedDoc.project} · Updated {selectedDoc.updatedAt}</p>
            </div>
            <button onClick={() => openEdit(selectedDoc)} className="rounded-lg border border-[#222] px-3 py-1.5 text-sm text-[#888] hover:bg-[#1a1a1a]">Edit</button>
          </div>
          <div className="flex gap-2 mb-4">
            {selectedDoc.tags.map(tag => (
              <span key={tag} className="rounded-full bg-[#1a1a1a] px-2.5 py-0.5 text-[10px] text-[#888]">{tag}</span>
            ))}
          </div>
          <div className="prose prose-invert max-w-none text-sm text-[#ccc]" dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedDoc.content) }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <MissionBanner />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Docs</h1>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('grid')} className={`rounded-lg px-3 py-1.5 text-sm ${viewMode === 'grid' ? 'bg-[#222] text-white' : 'text-[#888] hover:text-white'}`}>▦</button>
          <button onClick={() => setViewMode('list')} className={`rounded-lg px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-[#222] text-white' : 'text-[#888] hover:text-white'}`}>▤</button>
          <button onClick={openCreate} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">+ New Doc</button>
        </div>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search docs by title, project, or tag..."
        className="mb-6 w-full rounded-lg border border-[#222] bg-[#111] px-4 py-2.5 text-sm text-white outline-none focus:border-[#e94560]"
      />

      {projects.map(project => {
        const projectDocs = filtered.filter(d => d.project === project);
        if (projectDocs.length === 0) return null;
        return (
          <div key={project} className="mb-8">
            <h2 className="mb-3 text-sm font-medium text-[#888]">{project}</h2>
            <div className={viewMode === 'grid' ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}>
              {projectDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`cursor-pointer rounded-lg border border-[#222] bg-[#111] p-4 transition-all hover:border-[#333] hover:bg-[#1a1a1a] ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}
                  style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                  <div>
                    <h3 className="text-sm font-medium">{doc.title}</h3>
                    <p className="mt-1 text-xs text-[#666]">Updated {doc.updatedAt}</p>
                  </div>
                  <div className={`flex gap-1.5 ${viewMode === 'grid' ? 'mt-3' : ''}`}>
                    {doc.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-[#1a1a1a] px-2 py-0.5 text-[10px] text-[#666]">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingDoc(null); }} title={editingDoc && docs.find(d => d.id === editingDoc.id) ? 'Edit Document' : 'New Document'}>
        {editingDoc && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-[#888]">Title</label>
              <input value={editingDoc.title} onChange={e => setEditingDoc({ ...editingDoc, title: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-[#888]">Project</label>
                <input value={editingDoc.project} onChange={e => setEditingDoc({ ...editingDoc, project: e.target.value })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888]">Tags (comma separated)</label>
                <input value={editingDoc.tags.join(', ')} onChange={e => setEditingDoc({ ...editingDoc, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#e94560]" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">Content (Markdown)</label>
              <textarea value={editingDoc.content} onChange={e => setEditingDoc({ ...editingDoc, content: e.target.value })} rows={10} className="w-full rounded-lg border border-[#222] bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-white outline-none focus:border-[#e94560]" />
            </div>
            <div className="flex justify-between pt-2">
              {docs.find(d => d.id === editingDoc.id) && (
                <button onClick={() => deleteDoc(editingDoc.id)} className="rounded-lg px-4 py-2 text-sm text-[#e94560] transition-colors hover:bg-[#e94560]/10">Delete</button>
              )}
              <div className="ml-auto flex gap-2">
                <button onClick={() => { setModalOpen(false); setEditingDoc(null); }} className="rounded-lg border border-[#222] px-4 py-2 text-sm text-[#888] transition-colors hover:bg-[#1a1a1a]">Cancel</button>
                <button onClick={saveDoc} className="rounded-lg bg-[#e94560] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#d63851]">Save</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
