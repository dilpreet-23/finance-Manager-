import React, { useMemo } from 'react';
import { Transaction, Currency } from '../types';
import { formatCurrency, convertAmount } from '../lib/utils';
import { Sparkles, TrendingUp, Plus, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  transactions: Transaction[];
  displayCurrency: string;
  onAddClick: () => void;
}

export const IncomeManager: React.FC<Props> = ({ transactions, displayCurrency, onAddClick }) => {
  const incomeTransactions = useMemo(() => 
    transactions.filter(t => t.type === 'income'),
    [transactions]
  );

  const totalIncome = useMemo(() => 
    incomeTransactions.reduce((sum, t) => 
      sum + convertAmount(t.amount, t.currency as Currency, displayCurrency), 0
    ),
    [incomeTransactions, displayCurrency]
  );

  const incomeByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    incomeTransactions.forEach(t => {
      const amount = convertAmount(t.amount, t.currency as Currency, displayCurrency);
      categories[t.category] = (categories[t.category] || 0) + amount;
    });
    return Object.entries(categories).sort((a, b) => b[1] - a[1]);
  }, [incomeTransactions, displayCurrency]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] font-sans tracking-tight">Income Management</h2>
          <p className="text-[#1a1a1a]/40 text-sm">Track and manage your revenue streams</p>
        </div>
        <button
          onClick={onAddClick}
          className="py-3 px-6 bg-[#1a1a1a] text-white font-bold rounded-2xl flex items-center gap-2 shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Add Income</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-8 rounded-[32px] border border-black/5 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-[#1a1a1a]/40 text-xs font-bold uppercase tracking-widest">Total Income</p>
              <h3 className="text-3xl font-bold text-[#1a1a1a]">{formatCurrency(totalIncome, displayCurrency)}</h3>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#1a1a1a]/60 uppercase tracking-widest px-1">Recent Credits</h4>
            <div className="space-y-3">
              {incomeTransactions.length === 0 ? (
                <div className="text-center py-12 bg-black/5 rounded-2xl border border-dashed border-black/10">
                  <p className="text-[#1a1a1a]/20 italic">No income records found.</p>
                </div>
              ) : (
                incomeTransactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-black/5 rounded-2xl border border-black/5 hover:bg-black/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                        <ArrowUpRight size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a1a1a] text-sm">{t.category}</p>
                        <p className="text-[10px] text-[#1a1a1a]/40">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-sm">
                        +{formatCurrency(convertAmount(t.amount, t.currency as Currency, displayCurrency), displayCurrency)}
                      </p>
                      <p className="text-[10px] text-[#1a1a1a]/20">{t.amount} {t.currency}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center">
              <Sparkles className="text-[#1a1a1a]/60" size={20} />
            </div>
            <h4 className="text-sm font-bold text-[#1a1a1a] uppercase tracking-widest">By Source</h4>
          </div>

          <div className="space-y-6">
            {incomeByCategory.map(([cat, amount]) => (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold text-[#1a1a1a]/60">{cat}</p>
                  <p className="text-xs font-bold text-[#1a1a1a]">{formatCurrency(amount, displayCurrency)}</p>
                </div>
                <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(amount / totalIncome) * 100}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  />
                </div>
              </div>
            ))}
            {incomeByCategory.length === 0 && (
              <p className="text-center text-[#1a1a1a]/20 text-xs italic py-8">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
