"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Loader2, StickyNote } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState(null);

  useEffect(() => { fetchNotes(); }, []);

  async function fetchNotes() {
    const { data } = await supabase.from('notes').select('*').order('updated_at', { ascending: false });
    setNotes(data || []);
    setLoading(false);
  }

  const createNote = async () => {
    const { data } = await supabase.from('notes').insert([{ title: 'New Idea', content: '' }]).select();
    if (data) {
      setNotes([data[0], ...notes]);
      setActiveNote(data[0]);
    }
  };

  const updateNote = async (id, title, content) => {
    setNotes(notes.map(n => n.id === id ? { ...n, title, content } : n));
    await supabase.from('notes').update({ title, content, updated_at: new Date() }).eq('id', id);
  };

  const deleteNote = async (id) => {
    await supabase.from('notes').delete().eq('id', id);
    setNotes(notes.filter(n => n.id !== id));
    if (activeNote?.id === id) setActiveNote(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR */}
      <div className="w-full md:w-80 border-r border-gray-900 p-6 flex flex-col h-screen">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 mb-8 transition-all text-xs uppercase tracking-widest font-mono">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        
        <button onClick={createNote} className="w-full py-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-xl mb-6 flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all">
          <Plus size={18} /> New Entry
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {loading ? <Loader2 className="animate-spin mx-auto text-gray-800" /> : 
            notes.map(n => (
              <div 
                key={n.id} 
                onClick={() => setActiveNote(n)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${activeNote?.id === n.id ? 'bg-emerald-950/10 border-emerald-500/40' : 'bg-[#111] border-gray-800/50 hover:border-gray-700'}`}
              >
                <h3 className="text-sm font-bold truncate">{n.title || 'Untitled'}</h3>
                <p className="text-[10px] text-gray-600 mt-1 uppercase font-mono tracking-tighter">
                  {new Date(n.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))
          }
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 p-6 md:p-12 flex flex-col h-screen">
        {activeNote ? (
          <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <input 
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, e.target.value, activeNote.content)}
                className="bg-transparent text-3xl font-bold text-white focus:outline-none w-full"
                placeholder="Title"
              />
              <button onClick={() => deleteNote(activeNote.id)} className="text-gray-800 hover:text-red-500 p-2"><Trash2 size={20} /></button>
            </div>
            <textarea 
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, activeNote.title, e.target.value)}
              placeholder="Start typing your research..."
              className="flex-1 bg-transparent text-gray-400 leading-relaxed resize-none focus:outline-none text-lg"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-800 italic">
            <StickyNote size={48} className="mb-4 opacity-10" />
            <p>Select or create an entry to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}