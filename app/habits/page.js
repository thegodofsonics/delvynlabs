"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Check, ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] p-8 font-sans">
      <div className="max-w-[480px] mx-auto">
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-gray-500 hover:text-emerald-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-medium tracking-tight">Habit Tracker</h1>
          <div className="w-5"></div> {/* Spacer */}
        </div>

        {/* Original Stats Grid Look */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#1a1a1a] rounded-2xl p-4 text-center border border-gray-800/50">
            <div className="text-2xl font-semibold text-white">{habits.filter(h => h.is_done).length}</div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">Done</div>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl p-4 text-center border border-gray-800/50">
            <div className="text-2xl font-semibold text-white">{habits.length}</div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">Total</div>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl p-4 text-center border border-gray-800/50">
            <div className="text-2xl font-semibold text-emerald-500">
              {habits.length ? Math.max(...habits.map(h => h.streak || 0)) : 0}
            </div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">Streak</div>
          </div>
        </div>

        {/* Input - Restyled to match Original */}
        <div className="flex gap-2 mb-8">
          <input 
            type="text" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="Add a new habit..."
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all"
          />
          <button onClick={addHabit} className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors">
            Add
          </button>
        </div>

        {/* Habit List - The original card style */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
          ) : (
            habits.map((h) => (
              <div 
                key={h.id}
                onClick={() => toggleHabit(h.id, h.is_done, h.streak)}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  h.is_done ? 'bg-[#0d2b22] border-[#1D9E75]' : 'bg-[#1a1a1a] border-[#2a2a2a]'
                }`}
              >
                <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
                  h.is_done ? 'bg-[#1D9E75] border-[#1D9E75]' : 'border-gray-600'
                }`}>
                  {h.is_done && <Check size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                  <div className={`text-[15px] ${h.is_done ? 'text-[#5DCAA5]' : 'text-white'}`}>{h.name}</div>
                  <div className={`text-xs ${h.is_done ? 'text-[#1D9E75]' : 'text-gray-600'}`}>
                    {h.streak > 0 ? `${h.streak} day streak` : 'No streak yet'}
                  </div>
                </div>
                <button 
                  onClick={(e) => deleteHabit(h.id, e)}
                  className="text-gray-700 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}