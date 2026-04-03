"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Loader2, StickyNote, ChevronRight, Save } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
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
    const { data } = await supabase.from('notes').insert([newNote]).select();
    if (data) {
      setNotes([data[0], ...notes]);
      setActiveNote(data[0]);
    }
  };

  // --- DELETE LOGIC ---
  const deleteNote = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!window.confirm("Permanently delete this cloud entry?")) return;

    // Optimistic Update: Remove from UI immediately
    const prevNotes = [...notes];
    setNotes(notes.filter(n => n.id !== id));
    if (activeNote?.id === id) setActiveNote(null);

    const { error } = await supabase.from('notes').delete().eq('id', id);
    
    if (error) {
      console.error("Delete failed:", error);
      setNotes(prevNotes); // Rollback if DB fails
      alert("Cloud Error: Could not delete.");
    }
  };

  // --- TYPING & AUTO-SAVE LOGIC ---
  const handleTextChange = (field, value) => {
    if (!activeNote) return;

    // 1. Update UI state immediately
    const updatedNote = { ...activeNote, [field]: value, updated_at: new Date().toISOString() };
    setActiveNote(updatedNote);
    setNotes(notes.map(n => n.id === activeNote.id ? updatedNote : n));

    // 2. Debounce Save to Supabase (1 second delay)
    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from('notes')
        .update({ [field]: value, updated_at: new Date() })
        .eq('id', activeNote.id);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 border-r border-gray-900 p-6 flex flex-col h-screen bg-[#0d0d0d] z-10">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-emerald-500 mb-8 transition-all text-[10px] uppercase tracking-[0.2em] font-mono">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        
        <button onClick={createNote} className="w-full py-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-2xl mb-8 flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">
          <Plus size={18} /> New Entry
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-800" /></div>
          ) : (
            notes.map(n => (
              <div 
                key={n.id} 
                onClick={() => setActiveNote(n)}
                className={`group p-4 rounded-2xl cursor-pointer border transition-all duration-300 relative ${
                  activeNote?.id === n.id 
                  ? 'bg-emerald-950/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                  : 'bg-[#111] border-gray-800/50 hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start pr-6">
                  <h3 className={`text-sm font-bold truncate ${activeNote?.id === n.id ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {n.title || 'Untitled'}
                  </h3>
                </div>
                <p className="text-[9px] text-gray-600 mt-2 font-mono uppercase tracking-tighter">
                  {new Date(n.updated_at).toLocaleDateString()}
                </p>
                
                {/* Individual Trash Icon in Sidebar */}
                <button 
                  onClick={(e) => deleteNote(n.id, e)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN EDITOR */}
      <div className="flex-1 flex flex-col h-screen bg-[#0a0a0a]">
        {activeNote ? (
          <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex justify-between items-center p-6 border-b border-gray-900/50">
              <div className="flex-1">
                <input 
                  value={activeNote.title}
                  onChange={(e) => handleTextChange('title', e.target.value)}
                  className="bg-transparent text-2xl font-bold text-white focus:outline-none w-full"
                  placeholder="Entry Title..."
                />
                <div className="flex items-center gap-3 mt-1">
                   <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">ID: {activeNote.id.slice(0,8)}</span>
                   {isSaving && <span className="text-[9px] text-emerald-500 font-mono animate-pulse uppercase tracking-widest flex items-center gap-1"><Save size={10}/> Saving...</span>}
                </div>
              </div>
              <button 
                onClick={() => deleteNote(activeNote.id)} 
                className="ml-4 p-4 text-gray-800 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
              >
                <Trash2 size={22} />
              </button>
            </div>

            <textarea 
              value={activeNote.content}
              onChange={(e) => handleTextChange('content', e.target.value)}
              placeholder="Start your research here..."
              className="flex-1 bg-transparent text-gray-400 leading-relaxed resize-none focus:outline-none p-8 md:p-12 text-lg font-light custom-scrollbar"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-800 italic p-10 text-center">
            <StickyNote size={60} className="mb-6 opacity-5" />
            <p className="text-xs uppercase tracking-[0.4em] font-mono leading-loose">Access a node from the sidebar<br/>to begin data entry</p>
          </div>
        )}
      </div>
    </div>
  );
}