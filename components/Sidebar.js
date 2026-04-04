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
    { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/' },
    { icon: <CheckSquare size={22} />, label: 'Habits', path: '/habits' },
    { icon: <StickyNote size={22} />, label: 'Notes', path: '/notes' },
    { icon: <Banknote size={22} />, label: 'Finance', path: '/finance' },
    { icon: <BookOpen size={22} />, label: 'Library', path: '/library' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-28 bg-[#080808] border-r border-white/5 flex flex-col items-center py-10 z-50 shadow-2xl">
      
      {/* LOGO - Clean and centered */}
      <div className="mb-14">
        <div className="w-10 h-10 border border-emerald-500/40 rounded-xl flex items-center justify-center bg-emerald-500/5">
          <span className="text-emerald-500 font-bold text-xs tracking-tighter">DL</span>
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
              className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isActive 
                ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {item.icon}
              
              {/* ACTIVE INDICATOR */}
              {isActive && (
                <div className="absolute left-0 w-0.5 h-5 bg-emerald-500 rounded-r-full shadow-[2px_0_8px_rgba(16,185,129,0.4)]" />
              )}

              {/* MINI TOOLTIP - Reduced size and cleaner font */}
              <div className="absolute left-[70px] px-2.5 py-1 bg-[#161616] border border-gray-800 text-gray-300 text-[9px] font-bold rounded-md opacity-0 translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none uppercase tracking-[0.15em] whitespace-nowrap z-50 shadow-xl border-l-emerald-500/50 border-l-2">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* SETTINGS */}
      <div className="mt-auto mb-4 w-12 h-12 flex items-center justify-center text-gray-700 hover:text-emerald-500 transition-all cursor-pointer rounded-xl hover:bg-white/5 group relative">
        <Settings size={22} />
        <div className="absolute left-[70px] px-2.5 py-1 bg-[#161616] border border-gray-800 text-gray-300 text-[9px] font-bold rounded-md opacity-0 translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none uppercase tracking-[0.15em] whitespace-nowrap z-50">
          Settings
        </div>
      </div>
    </nav>
  );
}