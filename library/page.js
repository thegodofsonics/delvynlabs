"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, CheckCircle2, Bookmark, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LibraryPage() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLibrary(); }, []);

  async function fetchLibrary() {
    setLoading(true);
    const { data } = await supabase.from('library').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  const addItem = async () => {
    if (!title) return;
    const { data } = await supabase.from('library').insert([{ 
      title, 
      author, 
      status: 'reading', 
      progress_percent: 0 
    }]).select();
    if (data) {
      setItems([data[0], ...items]);
      setTitle('');
      setAuthor('');
    }
  };

  const updateProgress = async (id, currentProgress) => {
    let nextProgress = currentProgress + 10;
    if (nextProgress > 100) nextProgress = 100;
    
    setItems(items.map(item => item.id === id ? { ...item, progress_percent: nextProgress } : item));
    await supabase.from('library').update({ progress_percent: nextProgress }).eq('id', id);
  };

  const deleteItem = async (id, e) => {
    e.stopPropagation();
    await supabase.from('library').delete().eq('id', id);
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen text-gray-200">
      <header className="mb-12">
        <p className="text-emerald-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-2">Knowledge Archive</p>
        <h1 className="text-4xl font-bold text-white tracking-tight">The Library</h1>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* ADD NEW BOOK */}
        <div className="bg-[#111] border border-gray-800 p-8 rounded-[2.5rem] h-fit sticky top-8">
          <h3 className="text-[10px] font-bold uppercase text-gray-500 mb-6 tracking-widest flex items-center gap-2">
            <Plus size={14} className="text-emerald-500" /> New Acquisition
          </h3>
          <div className="space-y-4">
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Book or Course Title" 
              className="w-full bg-[#0a0a0a] border border-gray-800 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm" 
            />
            <input 
              value={author} 
              onChange={(e) => setAuthor(e.target.value)} 
              placeholder="Author / Platform" 
              className="w-full bg-[#0a0a0a] border border-gray-800 p-4 rounded-2xl outline-none focus:border-emerald-500 text-sm" 
            />
            <button 
              onClick={addItem} 
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20"
            >
              Add to Collection
            </button>
          </div>
        </div>

        {/* BOOK LIST */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-800 rounded-[2.5rem]">
              <BookOpen size={48} className="mx-auto text-gray-900 mb-4" />
              <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">Library is empty</p>
            </div>
          ) : (
            items.map(item => (
              <div 
                key={item.id} 
                className="bg-[#111] border border-gray-800 p-6 rounded-[2rem] group hover:border-emerald-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#0a0a0a] border border-gray-800 rounded-xl text-emerald-500">
                      <Bookmark size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{item.author}</p>
                    </div>
                  </div>
                  <button onClick={(e) => deleteItem(item.id, e)} className="text-gray-800 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Reading Progress</span>
                    <span className="text-xs font-bold text-emerald-500">{item.progress_percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                      style={{ width: `${item.progress_percent}%` }}
                    />
                  </div>
                  <button 
                    onClick={() => updateProgress(item.id, item.progress_percent)}
                    className="mt-4 text-[10px] font-bold text-emerald-500/60 hover:text-emerald-500 uppercase tracking-widest flex items-center gap-2 transition-all"
                  >
                    Update Progress <CheckCircle2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}