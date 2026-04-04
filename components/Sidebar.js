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
    { icon: <LayoutDashboard size={24} />, label: 'Dashboard', path: '/' },
    { icon: <CheckSquare size={24} />, label: 'Habits', path: '/habits' },
    { icon: <StickyNote size={24} />, label: 'Notes', path: '/notes' },
    { icon: <Banknote size={24} />, label: 'Finance', path: '/finance' },
    { icon: <BookOpen size={24} />, label: 'Library', path: '/library' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 md:w-24 bg-[#080808] border-r border-white/5 flex flex-col items-center py-8 z-50">
      
      {/* LOGO - Simplified and Centered */}
      <div className="mb-12 flex items-center justify-center">
        <div className="w-10 h-10 border border-emerald-500/50 rounded-xl flex items-center justify-center bg-emerald-500/10">
          <span className="text-emerald-500 font-bold text-sm tracking-tighter">DL</span>
        </div>
      </div>
      
      {/* NAVIGATION - Spaced out vertically */}
      <div className="flex-1 flex flex-col items-center gap-6 w-full px-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`group relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isActive 
                ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {item.icon}
              
              {/* SLICK ACTIVE INDICATOR */}
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full" />
              )}

              {/* TOOLTIP */}
              <div className="absolute left-20 px-3 py-2 bg-[#111] border border-gray-800 text-white text-[10px] font-bold rounded-lg opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none uppercase tracking-[0.2em] whitespace-nowrap z-50 shadow-2xl">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* SETTINGS - Pushed to bottom */}
      <div className="mt-auto w-14 h-14 flex items-center justify-center text-gray-700 hover:text-emerald-500 transition-all cursor-pointer rounded-2xl hover:bg-white/5 group relative">
        <Settings size={24} />
        <div className="absolute left-20 px-3 py-2 bg-[#111] border border-gray-800 text-white text-[10px] font-bold rounded-lg opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none uppercase tracking-[0.2em] whitespace-nowrap z-50">
          Settings
        </div>
      </div>
    </nav>
  );
}