"use client";

import React, { useState, useEffect } from 'react';
import { Trash2, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [weekData, setWeekData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 1. Load data from LocalStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    const savedWeek = localStorage.getItem('weekData');
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedWeek) setWeekData(JSON.parse(savedWeek));
  }, []);

  // 2. Save data & Sync with Dashboard
  useEffect(() => {
    // Save to local storage
    localStorage.setItem('habits', JSON.stringify(habits));
    
    // Calculate today's completion percentage
    const total = habits.length;
    const doneCount = habits.filter(h => h.done).length;
    const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    
    // Update the 7-day chart (last bar is 'Today')
    const newWeekData = [...weekData];
    newWeekData[6] = pct; 
    setWeekData(newWeekData);
    localStorage.setItem('weekData', JSON.stringify(newWeekData));

    // 🔥 This line tells the Dashboard tab to refresh its stats!
    window.dispatchEvent(new Event('storage'));
  }, [habits]);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      streak: 0,
      done: false
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const toggleHabit = (id) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const isDone = !h.done;
        return { 
          ...h, 
          done: isDone, 
          streak: isDone ? h.streak + 1 : Math.max(0, h.streak - 1) 
        };
      }
      return h;
    }));
  };

  const deleteHabit = (id, e) => {
    e.stopPropagation(); // Prevents toggling the habit when clicking delete
    const updatedHabits = habits.filter(h => h.id !== id);
    setHabits(updatedHabits);
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e8e8e8] p-6 md:p-12 font-sans">
      <div className="max-w-[480px] mx-auto">
        
        {/* Back Navigation */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-500 text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Habits</h1>
            <p className="text-sm text-gray-500 mt-1">{today}</p>
          </div>
          <div className="text-right">
             <div className="text-2xl font-mono text-emerald-500 font-bold">
               {habits.length > 0 ? Math.round((habits.filter(h => h.done).length / habits.length) * 100) : 0}%
             </div>
             <div className="text-[10px] text-gray-600 uppercase tracking-widest">Total Progress</div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 text-center">
            <div className="text-xl font-bold text-white">{habits.filter(h => h.done).length}</div>
            <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">Done</div>
          </div>
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 text-center">
            <div className="text-xl font-bold text-white">{habits.length}</div>
            <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">Total</div>
          </div>
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 text-center">
            <div className="text-xl font-bold text-emerald-500">
              {habits.length ? Math.max(...habits.map(h => h.streak)) : 0}
            </div>
            <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">Streak</div>
          </div>
        </div>

        {/* Add Input Section */}
        <div className="flex gap-2 mb-8 group">
          <input 
            type="text" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="Build a new habit..."
            className="flex-1 bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-700"
          />
          <button 
            onClick={addHabit}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20"
          >
            Add
          </button>
        </div>

        {/* Habits List */}
        <div className="space-y-3 mb-10">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">Current Goals</div>
          {habits.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-gray-900 rounded-3xl">
              <p className="text-gray-700 text-sm italic">No habits added yet. Start small.</p>
            </div>
          )}
          {habits.map((h) => (
            <div 
              key={h.id}
              onClick={() => toggleHabit(h.id)}
              className={`group flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                h.done 
                ? 'bg-emerald-950/20 border-emerald-500/30' 
                : 'bg-[#141414] border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                h.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-700'
              }`}>
                {h.done && <Check size={14} className="text-[#0f0f0f] stroke-[3px]" />}
              </div>
              <div className="flex-1">
                <div className={`text-[15px] font-medium transition-colors ${h.done ? 'text-emerald-400' : 'text-gray-200'}`}>
                  {h.name}
                </div>
                <div className={`text-[11px] mt-0.5 ${h.done ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {h.streak > 0 ? `🔥 ${h.streak} day streak` : 'Ready to start'}
                </div>
              </div>
              <button 
                onClick={(e) => deleteHabit(h.id, e)}
                className="text-gray-800 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Minimalist Chart Section */}
        <div className="bg-[#141414] border border-gray-800 rounded-3xl p-6">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-6">Activity Monitor</div>
          <div className="flex items-end justify-between gap-2 h-24 px-2">
            {weekData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div 
                  className={`w-full rounded-full transition-all duration-700 ease-out relative ${
                    val === 0 ? 'bg-gray-900 h-1' : 'bg-emerald-500 h-full shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  }`}
                  style={{ height: val > 0 ? `${val}%` : '4px' }}
                >
                  {val > 0 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}%
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-gray-700">{days[(new Date().getDay() - (6 - i) + 7) % 7]}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}