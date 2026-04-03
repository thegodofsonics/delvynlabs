"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Check, ArrowLeft, Loader2, Plus, Activity, Calendar } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Setup Live Clock for the Header
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('habits').select('*');
      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHabits(); }, []);

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    const { data, error } = await supabase.from('habits').insert([{ name: newHabitName, is_done: false, streak: 0 }]).select();
    if (!error) { setHabits([...habits, data[0]]); setNewHabitName(''); }
  };

  const toggleHabit = async (id, currentStatus, currentStreak) => {
    const newStatus = !currentStatus;
    const newStreak = newStatus ? (currentStreak || 0) + 1 : Math.max(0, (currentStreak || 0) - 1);
    setHabits(habits.map(h => h.id === id ? { ...h, is_done: newStatus, streak: newStreak } : h));
    await supabase.from('habits').update({ is_done: newStatus, streak: newStreak }).eq('id', id);
  };

  const deleteHabit = async (id, e) => {
    e.stopPropagation();
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (!error) setHabits(habits.filter(h => h.id !== id));
  };

  // Stats Calculations
  const doneCount = habits.filter(h => h.is_done).length;
  const totalCount = habits.length;
  const progressWidth = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-[500px] mx-auto">
        
        {/* HEADER SECTION */}
        <header className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-500 text-xs font-mono uppercase tracking-widest mb-6 transition-all">
            <ArrowLeft size={14} /> Back to Terminal
          </Link>
          
          <div className="flex justify-between items-end border-b border-gray-900 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Habit Protocol</h1>
              <p className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                <Calendar size={12} className="text-emerald-500" />
                {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-light text-white tabular-nums tracking-tighter">
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
              <p className="text-[9px] text-emerald-500/50 font-mono tracking-widest uppercase">Syncing Active</p>
            </div>
          </div>
        </header>

        {/* ACTIVITY MONITOR (The Progress Bar you asked for) */}
        <section className="bg-[#111] border border-gray-800/50 rounded-3xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" /> Efficiency Monitor
            </span>
            <span className="text-emerald-500 font-mono text-xs">{Math.round(progressWidth)}%</span>
          </div>
          
          {/* Custom Progress Bar */}
          <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out" 
              style={{ width: `${progressWidth}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-900">
            <div>
              <p className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">Completed</p>
              <p className="text-lg font-semibold text-white">{doneCount} <span className="text-xs text-gray-600">/ {totalCount}</span></p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">Active Streaks</p>
              <p className="text-lg font-semibold text-emerald-500">
                {habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0} <span className="text-xs text-emerald-900 text-gray-600">Days</span>
              </p>
            </div>
          </div>
        </section>

        {/* INPUT BOX */}
        <div className="flex gap-2 mb-10 group">
          <input 
            type="text" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="Initialize new habit..."
            className="flex-1 bg-[#141414] border border-gray-800/50 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/40 transition-all placeholder:text-gray-700"
          />
          <button 
            onClick={addHabit} 
            className="bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-500 hover:text-white px-6 rounded-2xl transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* HABIT LIST */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="animate-spin text-emerald-500" size={24} />
              <span className="text-[10px] text-gray-700 uppercase tracking-widest font-mono">Accessing Cloud...</span>
            </div>
          ) : (
            habits.map((h) => (
              <div 
                key={h.id}
                onClick={() => toggleHabit(h.id, h.is_done, h.streak)}
                className={`group flex items-center gap-4 p-5 rounded-[1.8rem] border transition-all duration-300 ${
                  h.is_done 
                  ? 'bg-emerald-950/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                  : 'bg-[#111] border-gray-800/50 hover:border-gray-700'
                }`}
              >
                {/* Custom Checkbox */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  h.is_done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-700 group-hover:border-emerald-500/50'
                }`}>
                  {h.is_done && <Check size={12} className="text-[#0a0a0a] stroke-[4px]" />}
                </div>

                <div className="flex-1 text-left">
                  <div className={`text-[15px] font-medium transition-colors ${h.is_done ? 'text-emerald-400' : 'text-gray-200'}`}>
                    {h.name}
                  </div>
                  <div className={`text-[10px] font-mono mt-0.5 tracking-wider ${h.is_done ? 'text-emerald-700' : 'text-gray-600'}`}>
                    STREAK: {h.streak || 0}
                  </div>
                </div>

                <button 
                  onClick={(e) => deleteHabit(h.id, e)}
                  className="text-gray-800 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <footer className="mt-20 text-[9px] text-gray-800 uppercase tracking-[0.5em] text-center font-mono italic">
          Data Residency: Bengaluru Node // Secure Connection
        </footer>
      </div>
    </div>
  );
}