"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Check, ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; // Using relative path for Vercel stability

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Habits from Supabase
  const fetchHabits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // 2. Add Habit
  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    
    const newHabitObj = {
      name: newHabitName,
      is_done: false,
      streak: 0
    };

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([newHabitObj])
        .select();

      if (error) throw error;
      
      if (data) {
        setHabits([...habits, data[0]]);
        setNewHabitName('');
      }
    } catch (error) {
      alert("Database Error: " + error.message);
    }
  };

  // 3. Toggle Done Status & Streak
  const toggleHabit = async (id, currentStatus, currentStreak) => {
    const newStatus = !currentStatus;
    const newStreak = newStatus ? (currentStreak || 0) + 1 : Math.max(0, (currentStreak || 0) - 1);

    // Optimistic Update (makes the UI feel instant)
    setHabits(habits.map(h => h.id === id ? { ...h, is_done: newStatus, streak: newStreak } : h));

    const { error } = await supabase
      .from('habits')
      .update({ is_done: newStatus, streak: newStreak })
      .eq('id', id);

    if (error) {
      console.error('Update failed:', error.message);
      fetchHabits(); // Rollback on error
    }
  };

  // 4. Delete Habit
  const deleteHabit = async (id, e) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete failed:', error.message);
    } else {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] p-6 md:p-12 font-sans text-center md:text-left">
      <div className="max-w-[500px] mx-auto">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-500 text-sm mb-10 transition-all">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">Cloud Habits</h1>
          <p className="text-gray-500 mt-2 text-sm">Synced across all your Delvyn Labs devices.</p>
        </header>

        {/* Input Field */}
        <div className="flex gap-3 mb-10 group">
          <input 
            type="text" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="What's the goal today?"
            className="flex-1 bg-[#141414] border border-gray-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-700"
          />
          <button 
            onClick={addHabit}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/10"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Habit List Section */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-xs text-gray-600 uppercase tracking-widest">Connecting to Cloud...</p>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-900 rounded-[2rem]">
              <p className="text-gray-700 text-sm italic">The cloud is empty. Add a habit to begin.</p>
            </div>
          ) : (
            habits.map((h) => (
              <div 
                key={h.id}
                onClick={() => toggleHabit(h.id, h.is_done, h.streak)}
                className={`group flex items-center gap-4 p-5 rounded-[1.5rem] border cursor-pointer transition-all duration-300 ${
                  h.is_done 
                  ? 'bg-emerald-950/10 border-emerald-500/30' 
                  : 'bg-[#141414] border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Checkbox Circle */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  h.is_done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-700'
                }`}>
                  {h.is_done && <Check size={14} className="text-[#0a0a0a] stroke-[3.5px]" />}
                </div>

                {/* Habit Details */}
                <div className="flex-1 text-left">
                  <div className={`text-[16px] font-medium transition-colors ${h.is_done ? 'text-emerald-400' : 'text-gray-200'}`}>
                    {h.name}
                  </div>
                  <div className={`text-[11px] mt-0.5 font-mono ${h.is_done ? 'text-emerald-600' : 'text-gray-600'}`}>
                    STREAK: {h.streak || 0} DAYS
                  </div>
                </div>

                {/* Delete Button */}
                <button 
                  onClick={(e) => deleteHabit(h.id, e)}
                  className="text-gray-800 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <footer className="mt-20 text-[10px] text-gray-800 uppercase tracking-[0.4em] text-center">
          Encrypted Connection ● Cloud Hosted
        </footer>
      </div>
    </div>
  );
}