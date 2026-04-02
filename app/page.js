import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  ExternalLink, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  CloudSun, 
  Github, 
  Youtube, 
  MessageSquare,
  Triangle 
} from 'lucide-react';

const Dashboard = () => {
  // --- Study Clock Logic ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- To-Do State ---
  const [todos, setTodos] = useState([
    { id: 1, text: "Review Delvyn Labs PR", completed: true },
    { id: 2, text: "Complete Habit Tracker logic", completed: true },
    { id: 3, text: "Sketch Note widget UI", completed: false },
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans">
      
      {/* HEADER SECTION */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-gray-400 mb-2">DELVYN LABS</h1>
          <h2 className="text-4xl font-semibold">Hi Charan, good afternoon.</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-mono">
            <span>THU 02 APR</span>
            <span>|</span>
            <span>15:45 GMT</span>
            <span>|</span>
            <span className="flex items-center gap-1"><CloudSun size={14} /> BENGALURU 24°C</span>
          </div>
        </div>
      </header>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl">
        
        {/* 1. HABIT SNAPSHOT */}
        <div className="bg-[#141414] border border-gray-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 w-full text-left">Habit Snapshot</span>
          <div className="relative w-32 h-32 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={364.4} strokeDashoffset={364.4 * 0.25} className="text-emerald-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">75%</span>
              <span className="text-xs text-gray-500">4/5</span>
            </div>
          </div>
          <p className="text-sm font-medium mb-1">Today's Focus:</p>
          <p className="text-sm text-gray-400 mb-4">Keep the chain.</p>
          <a href="/habits" className="text-xs text-emerald-500 hover:underline flex items-center gap-1">
            Link to /habits <ExternalLink size={12} />
          </a>
        </div>

        {/* 2. LAUNCHPAD */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#141414] border border-gray-800 p-6 rounded-3xl">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 block">Launchpad</span>
            <div className="flex gap-6">
              <div className="p-4 bg-[#1a1a1a] rounded-full border border-gray-700 hover:border-emerald-500 transition cursor-pointer"><Github size={24} /></div>
              <div className="p-4 bg-[#1a1a1a] rounded-full border border-gray-700 hover:border-emerald-500 transition cursor-pointer"><Triangle size={24} className="fill-current" /></div>
              <div className="p-4 bg-[#1a1a1a] rounded-full border border-gray-700 hover:border-emerald-500 transition cursor-pointer"><Youtube size={24} /></div>
              <div className="p-4 bg-[#1a1a1a] rounded-full border border-gray-700 hover:border-emerald-500 transition cursor-pointer"><MessageSquare size={24} /></div>
            </div>
          </div>

          {/* 3. STUDY CLOCK */}
          <div className="bg-[#141414] border border-gray-800 p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Study Clock</span>
              <span className="text-[10px] text-gray-600 flex items-center gap-1">● POMODORO MODE</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-7xl font-light tracking-tighter">{formatTime(timeLeft)}</div>
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

        {/* 4. SCRATCHPAD */}
        <div className="bg-[#141414] border border-gray-800 p-6 rounded-3xl">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">Scratchpad</span>
          <textarea 
            placeholder="Type an idea, auto-saves..."
            className="w-full h-32 bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 transition resize-none mb-3"
          />
          <button className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition">
            Add
          </button>
        </div>

        {/* 5. TO-DO SNAPSHOT */}
        <div className="md:col-span-2 bg-[#141414] border border-gray-800 p-6 rounded-3xl">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">To-Do Snapshot</span>
          <p className="text-[10px] text-gray-500 mb-4 uppercase">High Priority ({todos.filter(t => !t.completed).length})</p>
          <div className="space-y-3">
            {todos.map(todo => (
              <div key={todo.id} className="flex items-center gap-3 group cursor-pointer">
                <div className={`p-1 rounded ${todo.completed ? 'text-emerald-500' : 'text-gray-600 group-hover:text-gray-400'}`}>
                  <CheckCircle size={18} fill={todo.completed ? "currentColor" : "none"} className={todo.completed ? "text-emerald-500/20 stroke-emerald-500" : ""} />
                </div>
                <span className={`text-sm ${todo.completed ? 'text-gray-600 line-through' : 'text-gray-300'}`}>{todo.text}</span>
              </div>
            ))}
          </div>
          <button className="mt-6 text-xs text-gray-500 hover:text-white transition">View All Tasks</button>
        </div>

      </div>

      <footer className="mt-12 text-center text-[10px] text-gray-700 uppercase tracking-widest">
        © Charan, Delvyn Labs. Private Workspace. Authorized Access Only.
      </footer>
    </div>
  );
};

export default Dashboard;