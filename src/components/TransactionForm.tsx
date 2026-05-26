import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { CATEGORIES, TransactionCategory, ALL_CURRENCIES, Currency, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import { Plus, X, DollarSign, Calendar, Tag, Globe, IndianRupee, Euro, PoundSterling, JapaneseYen, Briefcase, TrendingUp, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onClose: () => void;
  defaultCurrency?: string;
  defaultType?: 'income' | 'expense';
}

export const TransactionForm: React.FC<Props> = ({ onClose, defaultCurrency, defaultType }) => {
  const [type, setType] = useState<'income' | 'expense'>(defaultType || 'expense');
  const [category, setCategory] = useState<TransactionCategory>(type === 'income' ? 'Salary' : 'Food');
  const [amount, setAmount] = useState('0.00');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<Currency>((defaultCurrency as Currency) || 'INR');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const displayCurrencies = ALL_CURRENCIES;

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? 'Salary' : 'Food');
  };

  const getCurrencyIcon = (code: Currency) => {
    switch (code) {
      case 'INR': return <IndianRupee size={20} />;
      case 'EUR': return <Euro size={20} />;
      case 'GBP': return <PoundSterling size={20} />;
      case 'JPY': return <JapaneseYen size={20} />;
      case 'CNY': return <JapaneseYen size={20} />;
      case 'CHF': return <span className="font-bold text-xs">Fr</span>;
      case 'AED': return <span className="font-bold text-xs">د.إ</span>;
      default: return <DollarSign size={20} />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !amount) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        uid: auth.currentUser.uid,
        type,
        category,
        amount: parseFloat(amount),
        currency,
        description,
        date: new Date(date).toISOString(),
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#111111] rounded-[32px] w-full max-w-lg p-10 shadow-2xl relative border border-white/5"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-white mb-2 font-sans tracking-tight">Add Transaction</h2>
        <p className="text-lg text-white/40 mb-8 font-medium italic">Record your income to stay on track.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
                }`}
              >
                Income
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Amount</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors">
                    {getCurrencyIcon(currency)}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border-none rounded-2xl text-lg font-medium text-white focus:ring-2 focus:ring-white/5 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={20} />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border-none rounded-2xl text-sm font-medium text-white focus:ring-2 focus:ring-white/5 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Description</label>
              <input
                type="text"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border-none rounded-2xl text-sm font-medium text-white focus:ring-2 focus:ring-white/5 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Category</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={20} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border-none rounded-2xl text-sm font-medium text-white focus:ring-2 focus:ring-white/5 transition-all outline-none appearance-none"
                >
                  {currentCategories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#111]">{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-white hover:bg-white/90 text-[#0a0a0a] font-bold rounded-2xl transition-all shadow-lg hover:shadow-white/5 active:scale-[0.98] disabled:opacity-50 text-lg"
          >
            {loading ? 'Adding...' : 'Save Transaction'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
