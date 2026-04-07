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
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <CheckSquare size={20} />, label: 'Habits', path: '/habits' },
    { icon: <StickyNote size={20} />, label: 'Notes', path: '/notes' },
    { icon: <Banknote size={20} />, label: 'Finance', path: '/finance' },
    { icon: <BookOpen size={20} />, label: 'Library', path: '/library' },
  ];

  return (
    <nav 
      style={{ width: '80px' }} 
      className="fixed left-0 top-0 h-screen bg-[#050505] border-r border-white/5 flex flex-col items-center py-10 z-50"
    >
      
      {/* LOGO - Small & Sharp */}
      <div className="mb-14">
        <div className="w-9 h-9 border border-emerald-500/20 rounded-lg flex items-center justify-center bg-emerald-500/5">
          <span className="text-emerald-500 font-bold text-[10px] tracking-tighter">DL</span>
        </div>
      </div>
      
      {/* NAVIGATION - Tighter Gaps */}
      <div className="flex-1 flex flex-col items-center gap-4 w-full">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isActive 
                ? 'text-emerald-500 bg-emerald-500/10' 
                : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {item.icon}
              
              {/* ACTIVE ACCENT - Minimalist Line */}
              {isActive && (
                <div className="absolute left-0 w-[2px] h-4 bg-emerald-500 rounded-r-full shadow-[2px_0_10px_rgba(16,185,129,0.3)]" />
              )}

              {/* TOOLTIP - Elegant & Small */}
              <div className="absolute left-16 px-2.5 py-1 bg-[#111] border border-gray-800 text-gray-400 text-[9px] font-bold rounded-md opacity-0 translate-x-[-5px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none uppercase tracking-[0.2em] whitespace-nowrap z-50">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* SETTINGS */}
      <div className="mt-auto mb-2 w-11 h-11 flex items-center justify-center text-gray-700 hover:text-emerald-500 transition-all cursor-pointer rounded-xl hover:bg-white/5 group relative">
        <Settings size={20} />
        <div className="absolute left-16 px-2.5 py-1 bg-[#111] border border-gray-800 text-gray-400 text-[9px] font-bold rounded-md opacity-0 translate-x-[-5px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none uppercase tracking-[0.2em] whitespace-nowrap z-50">
          Settings
        </div>
      </div>
    </nav>
  );
}