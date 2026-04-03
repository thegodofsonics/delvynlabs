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
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: "24", condition: "BENGALURU" });
  const [habitStats, setHabitStats] = useState({ percent: 0, done: 0, total: 0, loading: true });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [note, setNote] = useState("");
  const [latestNote, setLatestNote] = useState({ title: '', content: '', id: null });

  // 1. Live Clock & Weather
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    fetch("https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current_weather=true")
      .then(res => res.json())
      .then(data => setWeather({ temp: Math.round(data.current_weather.temperature), condition: "BENGALURU" }))
      .catch(() => {});

    return () => clearInterval(timer);
  }, []);

  // 2. FETCH CLOUD HABITS (The "Real" Progress)
  const fetchCloudStats = async () => {
    const { data, error } = await supabase.from('habits').select('*');
    if (!error && data) {
      const done = data.filter(h => h.is_done).length;
      const total = data.length;
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;
      setHabitStats({ percent, done, total, loading: false });
    }
  };

  useEffect(() => {
    fetchCloudStats();
    // Auto-refresh stats every 30 seconds or when window is focused
    const interval = setInterval(fetchCloudStats, 30000);
    window.addEventListener('focus', fetchCloudStats);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchCloudStats);
    };
  }, []);

  useEffect(() => { fetchLatestNote(); }, []);
    const fetchLatestNote = async () => {
    const { data } = await supabase.from('notes').select('*').order('updated_at', { ascending: false }).limit(1);
    if (data && data[0]) setLatestNote(data[0]);
  };

  // 3. Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 4. Scratchpad Persistence
  useEffect(() => {
    const saved = localStorage.getItem('delvyn-note');
    if (saved) setNote(saved);
  }, []);

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    localStorage.setItem('delvyn-note', e.target.value);
  };

  // Formatting
  const timeString = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateString = time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatTimer = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Progress Circle Math
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (habitStats.percent / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      
      {/* HEADER: DATE & GREETING */}
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

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* 1. PROGRESS MONITOR */}
        <div className="bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem] flex flex-col items-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-8 w-full text-left">Activity Monitor</span>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-900" />
              <circle 
                cx="80" cy="80" r={radius} 
                stroke="currentColor" strokeWidth="6" fill="transparent" 
                strokeDasharray={circumference} 
                style={{ strokeDashoffset: habitStats.loading ? circumference : offset, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {habitStats.loading ? <Loader2 className="animate-spin text-gray-700" /> : (
                <>
                  <span className="text-4xl font-bold text-white">{habitStats.percent}%</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Productivity</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-between w-full px-2">
            <div className="text-left">
              <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter">Completed</p>
              <p className="text-lg font-semibold text-white">{habitStats.done} Tasks</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter">Total Scope</p>
              <p className="text-lg font-semibold text-white">{habitStats.total} Habits</p>
            </div>
          </div>

          <Link href="/habits" className="mt-8 text-[10px] bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full border border-emerald-500/20 transition-all flex items-center gap-2">
            UPDATE LOGS <ExternalLink size={10} />
          </Link>
        </div>

        {/* 2. LAUNCHPAD & TIMER */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem]">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-6 block">Quick Launch</span>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: <Github size={22} />, link: "https://github.com" },
                { icon: <Triangle size={22} className="fill-current" />, link: "https://vercel.com" },
                { icon: <Youtube size={22} />, link: "https://youtube.com" },
                { icon: <MessageSquare size={22} />, link: "https://chatgpt.com" }
              ].map((item, i) => (
                <a key={i} href={item.link} target="_blank" className="p-5 bg-[#181818] rounded-2xl border border-gray-800 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-500 transition-all hover:-translate-y-1">
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-2 block font-mono">Focus Engine</span>
              <div className="text-7xl font-bold tracking-tighter tabular-nums text-white">{formatTimer(timeLeft)}</div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsActive(!isActive)} className={`p-6 rounded-2xl transition-all ${isActive ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </button>
              <button onClick={() => {setIsActive(false); setTimeLeft(25*60)}} className="p-6 bg-gray-800/30 text-gray-400 rounded-2xl border border-gray-800 hover:bg-gray-800 transition-all">
                <RotateCcw size={28} />
              </button>
            </div>
          </div>
        </div>

        // 3. The JSX for the Widget
        <div className="bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Latest Research</span>
            <Link href="/notes" className="text-emerald-500 hover:underline text-[10px] font-bold uppercase tracking-widest">Full Log</Link>
          </div>
          
          <h3 className="text-white font-bold mb-2 truncate">{latestNote.title || "No notes yet"}</h3>
          <textarea 
            value={latestNote.content}
            onChange={async (e) => {
              const newContent = e.target.value;
              setLatestNote({...latestNote, content: newContent});
              if(latestNote.id) {
                await supabase.from('notes').update({ content: newContent, updated_at: new Date() }).eq('id', latestNote.id);
              }
            }}
            className="flex-1 bg-[#0a0a0a] border border-gray-800/50 rounded-2xl p-5 text-sm focus:outline-none focus:border-emerald-500/30 transition-all resize-none text-gray-400"
            placeholder="Write something..."
          />
        </div>    

        {/* 4. RECENT ACTIVITY (Shows Cloud Status) */}
        <div className="md:col-span-2 bg-[#111] border border-gray-800/50 p-8 rounded-[2.5rem]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Operational Status</span>
            <span className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> CLOUD SYNC ACTIVE
            </span>
          </div>
          <div className="space-y-4">
            {habitStats.done === habitStats.total && habitStats.total !== 0 ? (
              <div className="text-emerald-500 text-sm font-medium italic">All systems clear. 100% Habit efficiency reached.</div>
            ) : (
              <div className="flex items-center gap-4 text-gray-400">
                <CheckCircle size={20} className="text-emerald-500/20" />
                <span className="text-sm font-medium">Next Milestone: Reach {(habitStats.percent + 10).toString().slice(0,2)}% completion</span>
              </div>
            )}
            <div className="h-[1px] bg-gray-900 w-full my-4" />
            <p className="text-xs text-gray-600 italic">"Discipline is the bridge between goals and accomplishment."</p>
          </div>
        </div>

      </div>

      <footer className="mt-20 text-center text-[10px] text-gray-800 uppercase tracking-[0.5em] font-mono">
        DEVLN-LABS // BENGALURU NODE // {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Dashboard;