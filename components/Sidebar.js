"use client";

import { Layout, CheckSquare, StickyNote, Banknote, BookOpen, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: <Layout size={20} />, label: 'Dashboard', path: '/' },
    { icon: <CheckSquare size={20} />, label: 'Habits', path: '/habits' },
    { icon: <StickyNote size={20} />, label: 'Notes', path: '/notes' },
    { icon: <Banknote size={20} />, label: 'Finance', path: '/finance' },
    { icon: <BookOpen size={20} />, label: 'Library', path: '/library' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 md:w-24 bg-[#0d0d0d] border-r border-gray-900 flex flex-col items-center py-10 z-50">
      <div className="mb-12 text-emerald-500">
        <div className="w-10 h-10 border-2 border-emerald-500 rounded-xl flex items-center justify-center font-bold">DL</div>
      </div>
      
      <div className="flex-1 flex flex-col gap-8">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`p-3 rounded-2xl transition-all group relative ${
              pathname === item.path ? 'bg-emerald-500/10 text-emerald-500' : 'text-gray-600 hover:text-gray-300'
            }`}
          >
            {item.icon}
            {/* Tooltip */}
            <span className="absolute left-20 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="text-gray-800 hover:text-gray-500 cursor-pointer transition-all">
        <Settings size={20} />
      </div>
    </nav>
  );
}