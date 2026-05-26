import React, { useState } from 'react';
import { setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Budget, CATEGORIES, TransactionCategory, ALL_CURRENCIES, Currency, DEFAULT_CURRENCIES } from '../types';
import { formatCurrency, convertAmount } from '../lib/utils';
import { Target, Plus, Trash2, Check, X, Globe, DollarSign, IndianRupee, Euro, PoundSterling, JapaneseYen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  budgets: Budget[];
  displayCurrency: string;
}

const getCurrencyIcon = (code: Currency, size = 14) => {
  switch (code) {
    case 'INR': return <IndianRupee size={size} />;
    case 'EUR': return <Euro size={size} />;
    case 'GBP': return <PoundSterling size={size} />;
    case 'JPY': return <JapaneseYen size={size} />;
    case 'CNY': return <JapaneseYen size={size} />;
    default: return <DollarSign size={size} />;
  }
};

export const BudgetManager: React.FC<Props> = ({ budgets, displayCurrency }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const handleSave = async () => {
    if (!auth.currentUser || !limit) return;
    setLoading(true);
    try {
      const budgetId = `${auth.currentUser.uid}_${category}_${currentMonth}`;
      await setDoc(doc(db, 'budgets', budgetId), {
        uid: auth.currentUser.uid,
        category,
        limit: parseFloat(limit),
        currency: displayCurrency,
        month: currentMonth,
      });
      setIsAdding(false);
      setLimit('');
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'budgets', id));
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  return (
    <div className="bg-white/5 p-8 rounded-[32px] shadow-xl border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Target className="text-[#0a0a0a]" size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white font-sans tracking-tight">Budget</h3>
            <p className="text-base text-white/40 font-medium italic">Fixed Budget ensures discipline.</p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="p-4 bg-white/5 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full px-3 py-2 bg-white/5 border-none rounded-lg text-xs font-medium text-white outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-[#111]">{cat}</option>
                  ))}
                </select>
                <div className="relative group">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/40 transition-colors pointer-events-none">
                    {getCurrencyIcon(displayCurrency as Currency, 10)}
                  </div>
                  <input
                    type="number"
                    placeholder="1.00"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full pl-6 pr-6 py-2 bg-white/5 border-none rounded-lg text-xs font-medium text-white outline-none focus:bg-white/10 transition-all placeholder:text-white/20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/40 transition-colors pointer-events-none">
                    {getCurrencyIcon(displayCurrency as Currency, 10)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-2 bg-white text-[#0a0a0a] rounded-lg font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Save
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-2 bg-white/5 text-white rounded-lg font-bold text-xs"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {budgets.length === 0 ? (
          <p className="text-center py-4 text-white/20 italic text-xs">No budgets set for this month.</p>
        ) : (
          budgets.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="font-bold text-white text-sm">{b.category}</p>
                <p className="text-[10px] text-white/40">{formatCurrency(convertAmount(b.limit, b.currency || 'USD', displayCurrency), displayCurrency)} limit</p>
              </div>
              <button
                onClick={() => b.id && handleDelete(b.id)}
                className="p-1.5 text-white/20 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
