"use client";

import { 
  LayoutDashboard, 
  CheckSquare, 
  StickyNote, 
  Banknote, 
  BookOpen, 
  Settings 
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
    <nav 
      style={{ width: '110px' }} 
      className="fixed left-0 top-0 h-screen bg-[#080808] border-r border-white/5 flex flex-col items-center py-10 z-50 shadow-2xl"
    >
      
      {/* LOGO */}
      <div className="mb-14">
        <div className="w-12 h-12 border border-emerald-500/30 rounded-2xl flex items-center justify-center bg-emerald-500/5">
          <span className="text-emerald-500 font-bold text-sm tracking-tighter">DL</span>
        </div>
      </div>
      
      {/* NAVIGATION */}
      <div className="flex-1 flex flex-col items-center gap-8 w-full">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`group relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isActive 
                ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {item.icon}
              
              {/* ACTIVE INDICATOR - Fixed to the very edge */}
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[2px_0_10px_rgba(16,185,129,0.4)]" />
              )}

              {/* TOOLTIP - Moved further right so it doesn't overlap */}
              <div className="absolute left-[90px] px-3 py-1.5 bg-[#121212] border border-gray-800 text-gray-300 text-[10px] font-bold rounded-lg opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none uppercase tracking-[0.15em] whitespace-nowrap z-[100] shadow-2xl">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* SETTINGS */}
      <div className="mt-auto mb-4 w-14 h-14 flex items-center justify-center text-gray-700 hover:text-emerald-500 transition-all cursor-pointer rounded-2xl hover:bg-white/5 group relative">
        <Settings size={24} />
        <div className="absolute left-[90px] px-3 py-1.5 bg-[#121212] border border-gray-800 text-gray-300 text-[10px] font-bold rounded-lg opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none uppercase tracking-[0.15em] whitespace-nowrap z-[100]">
          Settings
        </div>
      </div>
    </nav>
  );
}