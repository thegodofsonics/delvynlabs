"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Check, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Make sure this path is correct!

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Habits from Supabase on Load
  useEffect(() => {
    fetchHabits();
  }, []);

  async function fetchHabits() {
    setLoading(true);
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) console.error('Error fetching:', error);
    else setHabits(data || []);
    setLoading(false);
  }

  // 2. Add Habit to Cloud
  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    
    const newHabit = {
      name: newHabitName,
      is_done: false,
      streak: 0,
      // Temporarily using a hardcoded UUID or null if you haven't set up Auth yet
      // If your SQL has 'user_id not null', you'll need to handle Auth next!
    };

    const { data, error } = await supabase
      .from('habits')
      .insert([newHabit])
      .select();

    if (error) {
        alert("Check your Supabase RLS policies! If it's locked, this will fail.");
        console.error(error);
    } else {
        setHabits([...habits, data[0]]);
        setNewHabitName('');
    }
  };

  // 3. Toggle Status in Cloud
  const toggleHabit = async (id, currentStatus, currentStreak) => {
    const newStatus = !currentStatus;
    const newStreak = newStatus ? currentStreak + 1 : Math.max(0, currentStreak - 1);

    const { error } = await supabase
      .from('habits')
      .update({ is_done: newStatus, streak: newStreak })
      .eq('id', id);

    if (error) console.error(error);
    else {
      setHabits(habits.map(h => h.id === id ? { ...h, is_done: newStatus, streak: newStreak } : h));
    }
  };

  // 4. Delete from Cloud
  const deleteHabit = async (id, e) => {
    e.stopPropagation();
    const { error } = await supabase.from('habits').delete().eq('id', id);

    if (error) console.error(error);
    else setHabits(habits.filter(h => h.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e8e8e8] p-6 md:p-12">
      <div className="max-w-[480px] mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 mb-8 transition-colors">
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8">Cloud Habits</h1>

        <div className="flex gap-2 mb-8">
          <input 
            type="text" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Add habit to cloud..."
            className="flex-1 bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
          />
          <button onClick={addHabit} className="bg-emerald-600 px-5 py-3 rounded-xl font-bold">Add</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
        ) : (
          <div className="space-y-3">
            {habits.map((h) => (
              <div 
                key={h.id}
                onClick={() => toggleHabit(h.id, h.is_done, h.streak)}
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  h.is_done ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-[#141414] border-gray-800'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${h.is_done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-700'}`}>
                  {h.is_done && <Check size={14} className="text-black stroke-[3px]" />}
                </div>
                <div className="flex-1">
                  <div className={h.is_done ? 'text-emerald-400' : 'text-gray-200'}>{h.name}</div>
                  <div className="text-[11px] text-gray-600">Streak: {h.streak}</div>
                </div>
                <button onClick={(e) => deleteHabit(h.id, e)} className="text-gray-800 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}