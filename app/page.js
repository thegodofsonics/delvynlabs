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
  Triangle 
} from 'lucide-react';

const Dashboard = () => {
  // --- 1. Live Time & Greeting Logic ---
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: "--", condition: "BENGALURU" });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Fetch real weather for Bengaluru
    fetch("https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current_weather=true")
      .then(res => res.json())
      .then(data => {
        setWeather({
          temp: Math.round(data.current_weather.temperature),
          condition: "BENGALURU"
        });
      })
      .catch(() => setWeather({ temp: "24", condition: "BENGALURU" }));

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";
  const timeString = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateString = time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });

  // --- 2. Shared Habit Logic (Syncing with /habits) ---
  const [habitStats, setHabitStats] = useState({ percent: 0, done: 0, total: 0 });

  const updateHabits = () => {
    const saved = localStorage.getItem('habits');
    if (saved) {
      const list = JSON.parse(saved);
      const done = list.filter(h => h.done).length;
      const total = list.length;
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;
      setHabitStats({ percent, done, total });
    }
  };

  useEffect(() => {
    updateHabits();
    // Listen for changes from the habits page
    window.addEventListener('storage', updateHabits);
    return () => window.removeEventListener('storage', updateHabits);
  }, []);

  // --- 3. Study Clock Logic ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert("Time's up! Take a break.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- 4. Smart Scratchpad Logic ---
  const [note, setNote] = useState("");
  useEffect(() => {
    const savedNote = localStorage.getItem('delvyn-note');
    if (savedNote) setNote(savedNote);
  }, []);

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    localStorage.setItem('delvyn-note', e.target.value);
  };

  // SVG Progress Math
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (habitStats.percent / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans">
      
      {/* HEADER SECTION */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-gray-400 mb-2">DELVYN LABS</h1>
          <h2 className="text-4xl font-semibold capitalize">Hi Charan, {greeting}.</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-mono">
            <span className="uppercase">{dateString}</span>
            <span>|</span>
            <span>{timeString}</span>
            <span>|</span>
            <span className="flex items-center gap-1 text-emerald-500/80">
              <CloudSun size={14} /> {weather.condition} {weather.temp}°C
            </span>
          </div>
        </div>
      </header>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* 1. HABIT SNAPSHOT */}
        <div className="bg-[#141414] border border-gray-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 w-full text-left">Habit Snapshot</span>
          <div className="relative w-32 h-32 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
              <circle 
                cx="64" cy="64" r={radius} 
                stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={circumference} 
                style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                className="text-emerald-500" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{habitStats.percent}%</span>
              <span className="text-xs text-gray-500">{habitStats.done}/{habitStats.total}</span>
            </div>
          </div>
          <p className="text-sm font-medium mb-1">Today's Focus:</p>
          <p className="text-sm text-gray-400 mb-4">{habitStats.percent === 100 ? "Goal Reached!" : "Keep the chain."}</p>
          <a href="/habits" className="text-xs text-emerald-500 hover:underline flex items-center gap-1">
            Manage Habits <ExternalLink size={12} />
          </a>
        </div>

        {/* 2. LAUNCHPAD */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#141414] border border-gray-800 p-6 rounded-3xl">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 block">Launchpad</span>
            <div className="flex gap-6">
              <a href="https://github.com" target="_blank" className="p-4 bg-[#1a1a1a] rounded-full border border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-emerald-500 transition-all"><Github size={24} /></a>
              <a href="https://vercel.com" target="_blank" className="p-4 bg-[#1a1a1a] rounded-full border border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-emerald-500 transition-all"><Triangle size={24} className="fill-current" /></a>
              <a href="https://youtube.com" target="_blank" className="p-4 bg-[#1a1a1a] rounded-full border border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-emerald-500 transition-all"><Youtube size={24} /></a>
              <a href="https://chatgpt.com" target="_blank" className="p-4 bg-[#1a1a1a] rounded-full border border-gray-700 hover:border-emerald-500 text-gray-400 hover:text-emerald-500 transition-all"><MessageSquare size={24} /></a>
            </div>
          </div>

          {/* 3. STUDY CLOCK */}
          <div className="bg-[#141414] border border-gray-800 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Study Clock</span>
              <span className="text-[10px] text-gray-600 flex items-center gap-1">● POMODORO MODE</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-7xl font-light tracking-tighter tabular-nums">{formatTime(timeLeft)}</div>
              <div className="flex gap-3">
                <button onClick={() => setIsActive(!isActive)} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition">
                  {isActive ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={() => {setIsActive(false); setTimeLeft(25*60)}} className="p-3 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 transition">
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. SCRATCHPAD (Now Auto-saves) */}
        <div className="bg-[#141414] border border-gray-800 p-6 rounded-3xl">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">Scratchpad</span>
          <textarea 
            value={note}
            onChange={handleNoteChange}
            placeholder="Type an idea, auto-saves..."
            className="w-full h-44 bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 transition resize-none"
          />
        </div>

        {/* 5. TO-DO SNAPSHOT (Static Placeholder) */}
        <div className="md:col-span-2 bg-[#141414] border border-gray-800 p-6 rounded-3xl">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">Priority Tasks</span>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-400 group">
              <CheckCircle size={18} className="text-emerald-500/40" />
              <span className="text-sm">Finish Delvyn Labs Dashboard Logic</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 group">
              <div className="w-[18px] h-[18px] border border-gray-700 rounded-full" />
              <span className="text-sm">Scale the Habit Tracker UI</span>
            </div>
          </div>
          <button className="mt-8 text-[10px] text-gray-600 hover:text-white uppercase tracking-widest transition">View Full List</button>
        </div>

      </div>

      <footer className="mt-12 text-center text-[10px] text-gray-800 uppercase tracking-[0.3em]">
        © Charan, Delvyn Labs. Private Workspace.
      </footer>
    </div>
  );
};

export default Dashboard;