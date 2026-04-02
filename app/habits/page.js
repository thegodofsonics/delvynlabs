"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Check } from 'lucide-react'; // Make sure to npm install lucide-react

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

  // 2. Save data whenever habits change
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('habits', JSON.stringify(habits));
      
      // Update today's bar in the chart
      const doneCount = habits.filter(h => h.done).length;
      const pct = Math.round((doneCount / habits.length) * 100);
      const newWeekData = [...weekData];
      newWeekData[6] = pct; 
      setWeekData(newWeekData);
      localStorage.setItem('weekData', JSON.stringify(newWeekData));
    }
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
    e.stopPropagation();
    setHabits(habits.filter(h => h.id !== id));
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e8e8e8] p-8 font-sans">
      <div className="max-w-[480px] mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-medium">Habit tracker</h1>
          <span className="text-sm text-gray-500">{today}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
            <div className="text-2xl font-medium">{habits.filter(h => h.done).length}</div>
            <div className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Done today</div>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
            <div className="text-2xl font-medium">{habits.length}</div>
            <div className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Total habits</div>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 text-center">
            <div className="text-2xl font-medium">
              {habits.length ? Math.max(...habits.map(h => h.streak)) : 0}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Best streak</div>
          </div>
        </div>

        <div className="text-[11px] font-medium text-gray-500 mb-3 uppercase tracking-widest">Today</div>

        {/* Habits List */}
        <div className="flex flex-col gap-2 mb-6">
          {habits.map((h) => (
            <div 
              key={h.id}
              onClick={() => toggleHabit(h.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                h.done ? 'bg-[#0d2b22] border-[#1D9E75]' : 'bg-[#1a1a1a] border-[#2a2a2a]'
              }`}
            >
              <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
                h.done ? 'bg-[#1D9E75] border-[#1D9E75]' : 'border-gray-600'
              }`}>
                {h.done && <Check size={14} className="text-white" />}
              </div>
              <div className="flex-1">
                <div className={`text-[15px] ${h.done ? 'text-[#5DCAA5]' : 'text-white'}`}>{h.name}</div>
                <div className={`text-xs ${h.done ? 'text-[#1D9E75]' : 'text-gray-600'}`}>
                  {h.streak > 0 ? `${h.streak} day streak` : 'No streak yet'}
                </div>
              </div>
              <button 
                onClick={(e) => deleteHabit(h.id, e)}
                className="text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Section */}
        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="Add a new habit..."
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D9E75] transition-all"
          />
          <button 
            onClick={addHabit}
            className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {/* Chart Section */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-4 tracking-tight">Last 7 days completion</div>
          <div className="flex items-end gap-2 h-20">
            {weekData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] text-gray-500">{val > 0 ? `${val}%` : ''}</span>
                <div 
                  className={`w-full rounded-t-[3px] min-h-[4px] transition-all duration-500 ${val === 0 ? 'bg-[#2a2a2a]' : 'bg-[#1D9E75]'}`}
                  style={{ height: `${(val / 100) * 60}px` }}
                />
                <span className="text-[9px] text-gray-600">{days[(new Date().getDay() - (6 - i) + 7) % 7]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}