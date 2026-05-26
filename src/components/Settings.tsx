import React, { useState, useEffect } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { ALL_CURRENCIES, UserProfile } from '../types';
import { Globe, Plus, Trash2, X, User, Target, Save, Settings as SettingsIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateProfile } from 'firebase/auth';

interface Props {
  profile: UserProfile | null;
  onClose: () => void;
  isTab?: boolean;
}

export const Settings: React.FC<Props> = ({ profile, onClose, isTab = false }) => {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [monthlyBudget, setMonthlyBudget] = useState(profile?.monthlyBudget?.toString() || '');
  const [budgetCurrency, setBudgetCurrency] = useState(profile?.budgetCurrency || 'USD');
  const [success, setSuccess] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const preferred = profile?.preferredCurrencies || ['USD', 'INR', 'EUR'];

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setMonthlyBudget(profile.monthlyBudget?.toString() || '');
      setBudgetCurrency(profile.budgetCurrency || 'USD');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName,
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        budgetCurrency
      }, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCurrency = ALL_CURRENCIES.find(c => c.code === budgetCurrency);

  const content = (
    <div className={`${isTab ? '' : 'max-w-3xl mx-auto p-6 md:p-12 min-h-screen flex flex-col'}`}>
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <SettingsIcon className="text-[#0a0a0a]" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white font-sans tracking-tight">Account Settings</h2>
            <p className="text-base text-white/40 mt-1 font-medium italic">Customize your experience and financial goals.</p>
          </div>
        </div>
        {!isTab && (
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all border border-white/5"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-6 shadow-xl">
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/60 ml-1">Display Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={18} />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:border-white/20 transition-all font-bold text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* Budget & Currency Section */}
        <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/60 ml-1">Monthly Budget</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold text-lg">
                  {activeCurrency?.symbol || '$'}
                </div>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:border-white/20 transition-all font-bold text-lg text-white"
                />
              </div>
            </div>

            <div className="space-y-3 relative">
              <label className="text-xs font-bold text-white/60 ml-1">Currency Symbol ({activeCurrency?.symbol})</label>
              <div className="relative">
                <button
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="w-full bg-white text-[#0a0a0a] px-6 py-4 rounded-2xl border border-white shadow-xl flex items-center justify-between h-[60px] transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">{activeCurrency?.symbol}</span>
                    <span className="text-xs font-bold">{activeCurrency?.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">{activeCurrency?.code}</span>
                    <Plus size={16} className={`transition-transform duration-300 ${isCurrencyDropdownOpen ? 'rotate-45' : ''}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {isCurrencyDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 right-0 top-full mt-3 bg-[#1a1a1a] border border-white/10 rounded-[24px] shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {ALL_CURRENCIES.map(curr => (
                          <button
                            key={curr.code}
                            onClick={() => {
                              setBudgetCurrency(curr.code);
                              setIsCurrencyDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all group ${
                              budgetCurrency === curr.code 
                                ? 'bg-white text-[#0a0a0a]' 
                                : 'hover:bg-white/5 text-white/40 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`text-lg font-bold ${budgetCurrency === curr.code ? 'text-[#0a0a0a]' : 'text-white/20 group-hover:text-white'}`}>
                                {curr.symbol}
                              </span>
                              <span className="text-xs font-bold">{curr.label}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-tighter ${budgetCurrency === curr.code ? 'text-[#0a0a0a]/40' : 'text-white/20'}`}>
                              {curr.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[10px] text-white/20 ml-1 italic">Tap the box to change your primary currency.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 pb-12 flex justify-center">
        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className={`py-4 px-12 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all shadow-2xl active:scale-95 ${
            success ? 'bg-emerald-500 text-white' : 'bg-white text-[#0a0a0a] hover:bg-white/90'
          }`}
        >
          {success ? <Check size={20} /> : <Save size={20} />}
          <span>{success ? 'Settings Saved!' : 'Save All Changes'}</span>
        </button>
      </div>
    </div>
  );

  if (isTab) {
    return content;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0a0a0a] z-[60] overflow-y-auto custom-scrollbar"
    >
      {content}
    </motion.div>
  );
};
