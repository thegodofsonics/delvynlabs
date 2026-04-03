"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Check, Loader2, Circle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  }

  const addTask = async () => {
    if (!newTask.trim()) return;
    const { data } = await supabase.from('tasks').insert([{ text: newTask, is_completed: false }]).select();
    if (data) {
      setTasks([data[0], ...tasks]);
      setNewTask('');
    }
  };

  const toggleTask = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: newStatus } : t));
    await supabase.from('tasks').update({ is_completed: newStatus }).eq('id', id);
  };

  const deleteTask = async (id, e) => {
    e.stopPropagation();
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-6 md:p-12 font-sans">
      <div className="max-w-[500px] mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-emerald-500 mb-10 text-[10px] uppercase tracking-widest font-mono transition-all">
          <ArrowLeft size={14} /> Back to Terminal
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Task Queue</h1>
          <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-[0.2em]">Priority Execution Mode</p>
        </header>

        {/* Input */}
        <div className="flex gap-2 mb-10">
          <input 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Initialize new task..."
            className="flex-1 bg-[#111] border border-gray-800/50 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/40 transition-all"
          />
          <button onClick={addTask} className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 px-6 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
            <Plus size={20} />
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-800" /></div>
          ) : (
            tasks.map(t => (
              <div 
                key={t.id}
                onClick={() => toggleTask(t.id, t.is_completed)}
                className={`flex items-center gap-4 p-5 rounded-[1.8rem] border transition-all cursor-pointer ${
                  t.is_completed ? 'bg-emerald-950/5 border-emerald-500/20 opacity-50' : 'bg-[#111] border-gray-800/50'
                }`}
              >
                <div className={t.is_completed ? 'text-emerald-500' : 'text-gray-700'}>
                  {t.is_completed ? <Check size={20} /> : <Circle size={20} />}
                </div>
                <span className={`flex-1 text-sm ${t.is_completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                  {t.text}
                </span>
                <button onClick={(e) => deleteTask(t.id, e)} className="text-gray-800 hover:text-red-500 p-2">
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