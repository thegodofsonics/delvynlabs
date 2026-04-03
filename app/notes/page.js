"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Loader2, StickyNote, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => { fetchNotes(); }, []);

  async function fetchNotes() {
    setLoading(true);
    const { data } = await supabase.from('notes').select('*').order('updated_at', { ascending: false });
    setNotes(data || []);
    setLoading(false);
  }

  const createNote = async () => {
    const newNote = { title: 'New Entry', content: '' };
    const { data, error } = await supabase.from('notes').insert([newNote]).select();
    if (data) {
      setNotes([data[0], ...notes]);
      setActiveNote(data[0]);
    }
  };

  // --- SMOOTH TYPING LOGIC ---
  const handleTextChange = (field, value) => {
    if (!activeNote) return;

    // 1. Update UI immediately so typing feels fast
    const updatedNote = { ...activeNote, [field]: value, updated_at: new Date().toISOString() };
    setActiveNote(updatedNote);
    setNotes(notes.map(n => n.id === activeNote.id ? updatedNote : n));

    // 2. Clear old timer and set a new one (Debounce 1 second)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from('notes')
        .update({ [field]: value, updated_at: new Date() })
        .eq('id', activeNote.id);
      console.log("Cloud Synced ✅");
    }, 1000);
  };

  const deleteNote = async (id, e) => {
    if (e) e.stopPropagation();
    const confirmDelete = window.confirm("Discard this entry from the cloud?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) {
      setNotes(notes.filter(n => n.id !== id));
      if (activeNote?.id === id) setActiveNote(null);
    } else {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 border-r border-gray-900 p-6 flex flex-col h-screen bg-[#0d0d0d]">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-emerald-500 mb-8 transition-all text-[10px] uppercase tracking-[0.2em] font-mono">
          <ArrowLeft size={14} /> Back to Terminal
        </Link>
        
        <button onClick={createNote} className="w-full py-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-2xl mb-8 flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">
          <Plus size={18} /> Initialize Entry
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-800" /></div>
          ) : notes.length === 0 ? (
            <p className="text-center text-gray-800 text-xs mt-10">NO LOGS FOUND</p>
          ) : (
            notes.map(n => (
              <div 
                key={n.id} 
                onClick={() => setActiveNote(n)}
                className={`group p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
                  activeNote?.id === n.id 
                  ? 'bg-emerald-950/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                  : 'bg-[#111] border-gray-800/50 hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className={`text-sm font-bold truncate pr-2 ${activeNote?.id === n.id ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {n.title || 'Untitled'}
                  </h3>
                  <ChevronRight size={14} className={activeNote?.id === n.id ? 'text-emerald-500' : 'text-gray-800'} />
                </div>
                <p className="text-[9px] text-gray-600 mt-2 font-mono tracking-tighter">
                  MODIFIED // {new Date(n.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* EDITOR AREA */}
      <div className="flex-1 flex flex-col h-screen bg-[#0a0a0a]">
        {activeNote ? (
          <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex justify-between items-center p-6 border-b border-gray-900/50">
              <input 
                value={activeNote.title}
                onChange={(e) => handleTextChange('title', e.target.value)}
                className="bg-transparent text-2xl font-bold text-white focus:outline-none w-full placeholder:text-gray-800"
                placeholder="Entry Title..."
              />
              <button 
                onClick={() => deleteNote(activeNote.id)} 
                className="ml-4 p-3 text-gray-800 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                title="Delete Note"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Main Textarea */}
            <textarea 
              value={activeNote.content}
              onChange={(e) => handleTextChange('content', e.target.value)}
              placeholder="Start your research here..."
              className="flex-1 bg-transparent text-gray-400 leading-relaxed resize-none focus:outline-none p-8 md:p-12 text-lg font-light placeholder:text-gray-900 custom-scrollbar"
            />
            
            <div className="p-4 border-t border-gray-900/50 text-[9px] text-gray-700 font-mono flex justify-between uppercase tracking-[0.2em]">
              <span>ID: {activeNote.id.slice(0,8)}</span>
              <span className="text-emerald-900">Encrypted Cloud Storage Active</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-800 animate-pulse">
            <StickyNote size={60} className="mb-6 opacity-5" />
            <p className="text-xs uppercase tracking-[0.4em] font-mono">Select a node to begin editing</p>
          </div>
        )}
      </div>
    </div>
  );
}