"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function FinancePage() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');

  useEffect(() => { fetchFinance(); }, []);

  async function fetchFinance() {
    const { data } = await supabase.from('finance').select('*').order('created_at', { ascending: false });
    setItems(data || []);
  }

  const addTransaction = async () => {
    if (!title || !amount) return;
    const { data } = await supabase.from('finance').insert([{ title, amount: parseFloat(amount), type }]).select();
    if (data) { setItems([data[0], ...items]); setTitle(''); setAmount(''); }
  };

  const total = items.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Finance Ledger</h1>
        <div className="mt-6 p-6 bg-[#111] border border-gray-800 rounded-[2rem] flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Net Balance</p>
            <p className={`text-3xl font-mono font-bold ${total >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              ₹{total.toLocaleString()}
            </p>
          </div>
          <Wallet size={32} className="text-gray-800" />
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111] border border-gray-800 p-6 rounded-3xl h-fit">
          <h3 className="text-xs font-bold uppercase text-gray-500 mb-6 tracking-widest">New Entry</h3>
          <div className="space-y-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Description" className="w-full bg-[#0a0a0a] border border-gray-800 p-4 rounded-xl outline-none focus:border-emerald-500" />
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-full bg-[#0a0a0a] border border-gray-800 p-4 rounded-xl outline-none focus:border-emerald-500" />
            <div className="flex gap-2">
              <button onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl border font-bold text-[10px] uppercase ${type === 'expense' ? 'bg-red-500/10 border-red-500 text-red-500' : 'border-gray-800 text-gray-500'}`}>Expense</button>
              <button onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl border font-bold text-[10px] uppercase ${type === 'income' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'border-gray-800 text-gray-500'}`}>Income</button>
            </div>
            <button onClick={addTransaction} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all">POST TRANSACTION</button>
          </div>
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-[#111] border border-gray-800 p-4 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                {item.type === 'income' ? <TrendingUp className="text-emerald-500" size={18} /> : <TrendingDown className="text-red-500" size={18} />}
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-[10px] text-gray-600 font-mono">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <p className={`font-mono font-bold ${item.type === 'income' ? 'text-emerald-500' : 'text-gray-300'}`}>
                {item.type === 'income' ? '+' : '-'}₹{item.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}