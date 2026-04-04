"use client";

import { 
  LayoutDashboard, 
  CheckSquare, 
  StickyNote, 
  Banknote, 
  BookOpen, 
  Settings,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/' },
    { icon: <CheckSquare size={22} />, label: 'Habits', path: '/habits' },
    { icon: <StickyNote size={22} />, label: 'Notes', path: '/notes' },
    { icon: <Banknote size={22} />, label: 'Finance', path: '/finance' },
    { icon: <BookOpen size={22} />, label: 'Library', path: '/library' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-24 md:w-28 bg-[#080808] border-r border-gray-900/50 flex flex-col items-center py-12 z-50 shadow-2xl">
      
      {/* LOGO AREA */}
      <div className="mb-16 relative">
        <div className="w-12 h-12 border border-emerald-500/30 rounded-2xl flex items-center justify-center bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <span className="text-emerald-500 font-bold tracking-tighter text-lg">DL</span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080808] animate-pulse" />
      </div>
      
      {/* NAVIGATION LINKS */}
      <div className="flex-1 flex flex-col gap-10">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`group relative p-4 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                isActive 
                ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {item.icon}
              
              {/* ACTIVE INDICATOR DOT */}
              {isActive && (
                <div className="absolute -left-1 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[4px_0_10px_rgba(16,185,129,0.5)]" />
              )}

              {/* FLOATING TOOLTIP */}
              <div className="absolute left-24 px-4 py-2 bg-[#111] border border-gray-800 text-white text-[10px] font-bold rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none uppercase tracking-[0.2em] whitespace-nowrap z-50 shadow-2xl">
                <div className="flex items-center gap-2">
                  {item.label} <ChevronRight size={10} className="text-emerald-500" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* BOTTOM SETTINGS */}
      <div className="mt-auto group relative p-4 text-gray-700 hover:text-emerald-500 transition-all cursor-pointer bg-white/0 hover:bg-white/5 rounded-2xl">
        <Settings size={22} />
        <div className="absolute left-24 px-4 py-2 bg-[#111] border border-gray-800 text-white text-[10px] font-bold rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none uppercase tracking-[0.2em] whitespace-nowrap z-50">
          Settings
        </div>
      </div>
    </nav>
  );
}