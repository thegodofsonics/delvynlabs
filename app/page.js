"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  ExternalLink, 
  Play, 
  Pause, 
  RotateCcw, 
  CloudSun, 
  Github, 
  Youtube, 
  MessageSquare,
  Triangle,
  Loader2,
  Save
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  // --- STATE MANAGEMENT ---
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: "24", condition: "BENGALURU" });
  const [habitStats, setHabitStats] = useState({ percent: 0, done: 0, total: 0, loading: true });
  const [latestNote, setLatestNote] = useState({ title: '', content: '', id: null });
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionTask, setSessionTask] = useState("");

  // --- 1. SYSTEM CLOCK & WEATHER ---
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetch("https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current_weather=true")
      .then(res => res.json())
      .then(data => setWeather({ temp: Math.round(data.current_weather.temperature), condition: "BENGALURU" }))
      .catch(() => {});
    return () => clearInterval(timer);
  }, []);

  // --- 2. CLOUD DATA SYNC ---
  const fetchAllData = async () => {
    // Fetch Habits
    const { data: habits } = await supabase.from('habits').select('*');
    if (habits) {
      const done = habits.filter(h => h.is_done).length;
      const total = habits.length;
      setHabitStats({ percent: total > 0 ? Math.round((done / total) * 100) : 0, done, total, loading: false });
    }
    // Fetch Latest Note
    const { data: notes } = await supabase.from('notes').select('*').order('updated_at', { ascending: false }).limit(1);
    if (notes && notes[0]) setLatestNote(notes[0]);
  };

  useEffect(() => {
    fetchAllData();
    window.addEventListener('focus', fetchAllData);
    return () => window.removeEventListener('focus', fetchAllData);
  }, []);

  // --- 3. FOCUS ENGINE LOGIC ---
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
    const { error } = await supabase.from('sessions').insert([{
      task_name: sessionTask,
      duration_minutes: 25
    }]);
    if (!error) {
      setIsFinished(false);
      setSessionTask("");
      setTimeLeft(25 * 60);
      alert("Deep Work Logged to Cloud.");
    }
  };

  // --- HELPERS ---
  const formatTimer = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const dateString = time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeString = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (habitStats.percent / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      
      {/* HEADER */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-900 pb-8">
        <div>
          <p className="text-emerald-500 font-mono text-xs tracking-[0.3em] uppercase mb-2">System Online // Delvyn Labs</p>
          <h1 className="text-4xl font-bold tracking-tight mb-1">Hi Charan.</h1>
          <p className="text-gray-500 font-medium">{dateString}</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-3xl font-light tracking-widest text-white tabular-nums">{timeString}</div>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
            <CloudSun size={14} className="text-emerald-500" /> {weather.condition} ● {weather.temp}°C
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* 1. PROGRESS MONITOR */}
        <div className="bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem] flex flex-col items-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-8 w-full text-left font-mono">Activity Monitor</span>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-900" />
              <circle 
                cx="80" cy="80" r={radius} 
                stroke="currentColor" strokeWidth="6" fill="transparent" 
                strokeDasharray={circumference} 
                style={{ strokeDashoffset: habitStats.loading ? circumference : offset, transition: 'stroke-dashoffset 1.5s ease-out' }}
                className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {habitStats.loading ? <Loader2 className="animate-spin text-gray-700" /> : (
                <>
                  <span className="text-4xl font-bold text-white">{habitStats.percent}%</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Efficiency</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-between w-full px-2">
            <div><p className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">Done</p><p className="text-lg font-semibold text-white">{habitStats.done}</p></div>
            <div className="text-right"><p className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">Scope</p><p className="text-lg font-semibold text-white">{habitStats.total}</p></div>
          </div>
          <Link href="/habits" className="mt-8 text-[10px] bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full border border-emerald-500/20 transition-all flex items-center gap-2">
            PROTOCOL LOGS <ExternalLink size={10} />
          </Link>
        </div>

        {/* 2. FOCUS ENGINE (TIMER + LOGGING) */}
        <div className="md:col-span-2 bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem] relative flex flex-col justify-center min-h-[320px]">
          {isFinished ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] mb-4 block">Session Complete</span>
              <h3 className="text-2xl font-bold mb-6 text-white">What did you achieve?</h3>
              <div className="flex gap-3">
                <input 
                  value={sessionTask}
                  onChange={(e) => setSessionTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && logSession()}
                  placeholder="e.g., Refactored research nodes"
                  className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all"
                />
                <button onClick={logSession} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                  Log
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4 block font-mono">Focus Engine</span>
                <div className="text-8xl font-bold tracking-tighter tabular-nums text-white leading-none">{formatTimer(timeLeft)}</div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsActive(!isActive)} className={`p-8 rounded-[2rem] transition-all ${isActive ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>
                <button onClick={() => {setIsActive(false); setTimeLeft(25*60)}} className="p-8 bg-gray-800/30 text-gray-400 rounded-[2rem] border border-gray-800 hover:text-white transition-all">
                  <RotateCcw size={32} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. CLOUD NOTES WIDGET */}
        <div className="bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem] flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Latest Research</span>
            <Link href="/notes" className="text-emerald-500 hover:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Archive</Link>
          </div>
          <h3 className="text-white font-bold mb-3 truncate px-1">{latestNote.title || "No logs found"}</h3>
          <textarea 
            value={latestNote.content}
            onChange={async (e) => {
              const val = e.target.value;
              setLatestNote(prev => ({...prev, content: val}));
              if(latestNote.id) {
                await supabase.from('notes').update({ content: val, updated_at: new Date() }).eq('id', latestNote.id);
              }
            }}
            className="flex-1 bg-[#0a0a0a] border border-gray-800/50 rounded-2xl p-5 text-sm focus:outline-none focus:border-emerald-500/30 transition-all resize-none text-gray-400 custom-scrollbar font-light leading-relaxed"
            placeholder="Initialize thought..."
          />
        </div>

        {/* 4. QUICK LAUNCH & SYSTEM STATUS */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem]">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-8 block">Rapid Launchpad</span>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: <Github size={24} />, link: "https://github.com" },
                { icon: <Triangle size={24} className="fill-current" />, link: "https://vercel.com" },
                { icon: <Youtube size={24} />, link: "https://youtube.com" },
                { icon: <MessageSquare size={24} />, link: "https://chatgpt.com" }
              ].map((item, i) => (
                <a key={i} href={item.link} target="_blank" className="flex justify-center p-6 bg-[#161616] rounded-2xl border border-gray-800 hover:border-emerald-500/40 text-gray-500 hover:text-emerald-500 transition-all hover:-translate-y-1">
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Operational Status</span>
              <span className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> SYSTEM NOMINAL
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <CheckCircle size={18} className="text-emerald-500" />
              <span className="text-sm font-medium">Cloud sync latency: 14ms</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-center text-[10px] text-gray-800 uppercase tracking-[0.5em] font-mono">
        DELVYN LABS // BENGALURU NODE // {time.getFullYear()}
      </footer>
    </div>
  );
};

export default Dashboard;