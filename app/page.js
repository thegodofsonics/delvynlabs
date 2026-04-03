"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  ExternalLink, 
  Play, 
  Pause, 
  RotateCcw, 
  CloudSun, 
  Loader2, 
  Plus,
  Circle,
  Check,
  Layout
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  // --- STATE ---
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: "24", condition: "BENGALURU" });
  const [habitStats, setHabitStats] = useState({ percent: 0, done: 0, total: 0, loading: true });
  const [latestNote, setLatestNote] = useState({ title: '', content: '', id: null });
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionTask, setSessionTask] = useState("");

  // --- 1. CLOCK & WEATHER ---
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetch("https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current_weather=true")
      .then(res => res.json())
      .then(data => setWeather({ temp: Math.round(data.current_weather.temperature), condition: "BENGALURU" }))
      .catch(() => {});
    return () => clearInterval(timer);
  }, []);

  // --- 2. MULTI-SYNC DATA FETCH ---
  const fetchAllCloudData = async () => {
    // Habits
    const { data: habits } = await supabase.from('habits').select('*');
    if (habits) {
      const done = habits.filter(h => h.is_done).length;
      const total = habits.length;
      setHabitStats({ percent: total > 0 ? Math.round((done / total) * 100) : 0, done, total, loading: false });
    }
    // Notes
    const { data: notes } = await supabase.from('notes').select('*').order('updated_at', { ascending: false }).limit(1);
    if (notes?.[0]) setLatestNote(notes[0]);
    // Tasks (Top 3 uncompleted)
    const { data: taskList } = await supabase.from('tasks').select('*').eq('is_completed', false).order('created_at', { ascending: false }).limit(3);
    setTasks(taskList || []);
  };

  useEffect(() => {
    fetchAllCloudData();
    window.addEventListener('focus', fetchAllCloudData);
    return () => window.removeEventListener('focus', fetchAllCloudData);
  }, []);

  // --- 3. TASK QUICK-ADD ---
  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    const { data } = await supabase.from('tasks').insert([{ text: newTask, is_completed: false }]).select();
    if (data) {
      setTasks([data[0], ...tasks].slice(0, 3));
      setNewTask("");
    }
  };

  const quickToggleTask = async (id) => {
    setTasks(tasks.filter(t => t.id !== id)); // Remove from dashboard view immediately
    await supabase.from('tasks').update({ is_completed: true }).eq('id', id);
    fetchAllCloudData(); // Refresh stats
  };

  // --- 4. TIMER LOGIC ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const logSession = async () => {
    if (!sessionTask.trim()) return;
    await supabase.from('sessions').insert([{ task_name: sessionTask, duration_minutes: 25 }]);
    setIsFinished(false);
    setSessionTask("");
    setTimeLeft(25 * 60);
  };

  // --- HELPERS ---
  const formatTimer = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const dateString = time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeString = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-900 pb-8">
        <div>
          <p className="text-emerald-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-2">Operational Node // Delvyn Labs</p>
          <h1 className="text-4xl font-bold tracking-tight mb-1 underline decoration-emerald-500/20 underline-offset-8">Hi Charan.</h1>
          <p className="text-gray-500 font-medium mt-2">{dateString}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-3xl font-light tracking-widest text-white tabular-nums">{timeString}</div>
          <div className="flex items-center gap-2 text-[10px] text-gray-600 mt-1 font-mono">
            <CloudSun size={12} className="text-emerald-500" /> {weather.temp}°C BENGALURU
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* PROGRESS MONITOR */}
        <div className="bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem] flex flex-col items-center relative overflow-hidden">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-8 w-full text-left font-mono">System Efficiency</span>
          <div className="relative w-40 h-40 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="55" stroke="#1a1a1a" strokeWidth="8" fill="transparent" />
              <circle 
                cx="80" cy="80" r="55" 
                stroke="#10b981" strokeWidth="8" fill="transparent" 
                strokeDasharray={345} 
                style={{ strokeDashoffset: 345 - (habitStats.percent / 100) * 345, transition: 'stroke-dashoffset 1.5s ease' }}
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {habitStats.loading ? <Loader2 className="animate-spin text-gray-700" /> : (
                <><span className="text-4xl font-bold text-white">{habitStats.percent}%</span><span className="text-[9px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Protocol</span></>
              )}
            </div>
          </div>
          <div className="flex justify-between w-full px-2 mb-6">
            <div><p className="text-[9px] text-gray-600 font-bold uppercase">Done</p><p className="text-lg font-semibold text-white">{habitStats.done}</p></div>
            <div className="text-right"><p className="text-[9px] text-gray-600 font-bold uppercase">Total</p><p className="text-lg font-semibold text-white">{habitStats.total}</p></div>
          </div>
          <Link href="/habits" className="w-full text-center py-3 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-xl border border-emerald-500/20 uppercase tracking-widest transition-all">
            Edit Habits
          </Link>
        </div>

        {/* FOCUS ENGINE */}
        <div className="md:col-span-2 bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem] relative flex flex-col justify-center min-h-[320px]">
          {isFinished ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] mb-4 block">Session Complete</span>
              <h3 className="text-2xl font-bold mb-6 text-white">Log your achievement</h3>
              <div className="flex gap-3">
                <input value={sessionTask} onChange={(e) => setSessionTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && logSession()} placeholder="Task name..." className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none" />
                <button onClick={logSession} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">Submit</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4 block font-mono">Deep Work Timer</span>
                <div className="text-8xl font-bold tracking-tighter tabular-nums text-white leading-none">{formatTimer(timeLeft)}</div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsActive(!isActive)} className={`p-8 rounded-[2rem] transition-all ${isActive ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  {isActive ? <Pause size={32} /> : <Play size={32} />}
                </button>
                <button onClick={() => {setIsActive(false); setTimeLeft(25*60)}} className="p-8 bg-gray-800/30 text-gray-400 rounded-[2rem] border border-gray-800 hover:text-white transition-all"><RotateCcw size={32} /></button>
              </div>
            </div>
          )}
        </div>

        {/* TASK CONSOLE (The New Widget) */}
        <div className="bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem] flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Active Queue</span>
            <Link href="/tasks" className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Full List</Link>
          </div>
          
          <div className="flex gap-2 mb-6">
            <input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} placeholder="Quick add..." className="flex-1 bg-[#0a0a0a] border border-gray-800/50 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500/30 transition-all text-gray-300" />
            <button onClick={handleAddTask} className="bg-emerald-600/20 text-emerald-500 p-2 rounded-xl border border-emerald-500/20"><Plus size={16}/></button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-800">
                <Layout size={32} className="mb-2 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest font-mono">Queue Clear</p>
              </div>
            ) : (
              tasks.map(t => (
                <div key={t.id} onClick={() => quickToggleTask(t.id)} className="group flex items-center gap-3 p-3 bg-[#161616] border border-gray-800 rounded-xl hover:border-emerald-500/30 transition-all cursor-pointer">
                  <Circle size={14} className="text-gray-700 group-hover:text-emerald-500" />
                  <span className="text-xs text-gray-300 truncate flex-1">{t.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CLOUD NOTES WIDGET */}
        <div className="md:col-span-2 bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem] flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Latest Research Node</span>
            <Link href="/notes" className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Archive</Link>
          </div>
          <h3 className="text-white font-bold mb-3 truncate">{latestNote.title || "No data nodes found"}</h3>
          <textarea 
            value={latestNote.content}
            onChange={async (e) => {
              const val = e.target.value;
              setLatestNote(prev => ({...prev, content: val}));
              if(latestNote.id) { await supabase.from('notes').update({ content: val, updated_at: new Date() }).eq('id', latestNote.id); }
            }}
            className="flex-1 bg-[#0a0a0a] border border-gray-800/50 rounded-2xl p-6 text-sm focus:outline-none focus:border-emerald-500/30 transition-all resize-none text-gray-400 font-light leading-relaxed custom-scrollbar"
            placeholder="Initialize thought..."
          />
        </div>
      </div>

      <footer className="mt-20 text-center text-[9px] text-gray-800 uppercase tracking-[0.5em] font-mono">
        DELVYN LABS // BENGALURU NODE // {time.getFullYear()}
      </footer>
    </div>
  );
};

export default Dashboard;