import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { Transaction, Budget, UserProfile, ALL_CURRENCIES } from './types';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { BudgetManager } from './components/BudgetManager';
import { IncomeManager } from './components/IncomeManager';
import { Settings } from './components/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LogOut, LayoutDashboard, History, Sparkles, Menu, X, Wallet, Target, Plus, Globe, ChevronDown, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NavItem = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={`w-full py-3 px-5 rounded-xl flex items-center gap-3 transition-all font-bold ${
      active 
        ? 'bg-white text-[#0a0a0a] shadow-xl translate-x-1' 
        : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className={`transition-transform group-hover:scale-110 ${active ? 'text-[#0a0a0a]' : 'text-white/20 group-hover:text-white'}`}>
      {icon}
    </div>
    <span className="text-xs uppercase tracking-widest">{label}</span>
  </button>
);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState('INR');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'budgets' | 'income' | 'settings'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (profile?.budgetCurrency) {
      setDisplayCurrency(profile.budgetCurrency);
    } else if (profile?.preferredCurrencies?.[0]) {
      setDisplayCurrency(profile.preferredCurrencies[0]);
    }
  }, [profile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(data);
    });

    const uq = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(uq, (doc) => {
      if (doc.exists()) {
        setProfile({ uid: doc.id, ...doc.data() } as UserProfile);
      }
    });

    const bq = query(
      collection(db, 'budgets'),
      where('uid', '==', user.uid)
    );

    const unsubscribeBudgets = onSnapshot(bq, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];
      setBudgets(data);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeProfile();
      unsubscribeBudgets();
    };
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0a0a] flex font-sans text-white">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-80 bg-[#111111] border-r border-white/5 flex-col p-8 fixed h-full shadow-2xl">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="text-[#0a0a0a]" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Finance Track</h1>
              <p className="text-xl text-white/40 mt-1 font-medium italic">Welcome {profile?.displayName || user.displayName || 'User'}!</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
            />
            <NavItem 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')} 
              icon={<History size={18} />} 
              label="Transactions" 
            />
            <NavItem 
              active={activeTab === 'budgets'} 
              onClick={() => setActiveTab('budgets')} 
              icon={<Target size={18} />} 
              label="Budget" 
            />
            <NavItem 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
              icon={<SettingsIcon size={18} />} 
              label="Settings" 
            />

            <div className="pt-4 space-y-4">
              <button
                onClick={() => { setFormType('expense'); setIsFormOpen(true); }}
                className="w-full py-3 px-5 bg-white hover:bg-white/90 text-[#0a0a0a] font-bold text-xs rounded-xl transition-all flex items-center gap-3 shadow-lg active:scale-95"
              >
                <Plus size={18} />
                <span>Add Transaction</span>
              </button>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner border border-white/5">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-white text-sm truncate">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-white/40 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-rose-500/20"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 bg-[#111111] border-b border-white/5 p-4 flex items-center justify-between z-40 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
              <Wallet className="text-[#0a0a0a]" size={20} />
            </div>
            <h1 className="text-lg font-bold text-white">Finance Track</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white/60"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden fixed top-[73px] left-0 right-0 bg-[#111111] border-b border-white/5 p-6 z-30 shadow-2xl space-y-4"
            >
              <NavItem 
                active={activeTab === 'dashboard'} 
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
                icon={<LayoutDashboard size={18} />} 
                label="Dashboard" 
              />
              <NavItem 
                active={activeTab === 'history'} 
                onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }} 
                icon={<History size={18} />} 
                label="Transactions" 
              />
              <NavItem 
                active={activeTab === 'budgets'} 
                onClick={() => { setActiveTab('budgets'); setIsMobileMenuOpen(false); }} 
                icon={<Target size={18} />} 
                label="Budget" 
              />
              <NavItem 
                active={activeTab === 'settings'} 
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} 
                icon={<SettingsIcon size={18} />} 
                label="Settings" 
              />
              <button
                onClick={() => { setFormType('expense'); setIsFormOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full py-3 px-5 bg-white text-[#0a0a0a] font-bold text-xs rounded-xl flex items-center justify-center gap-3 shadow-lg"
              >
                <Plus size={18} />
                Add Transaction
              </button>

              <div className="h-px bg-white/5 w-full my-1" />
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-rose-500/10 text-rose-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-rose-500/20"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-80 p-6 lg:p-12 mt-[73px] lg:mt-0">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <Dashboard 
                    transactions={transactions} 
                    budgets={budgets} 
                    profile={profile}
                    onAddClick={(type: 'income' | 'expense' = 'expense') => { 
                      setFormType(type); 
                      setIsFormOpen(true); 
                    }} 
                    displayCurrency={displayCurrency} 
                  />
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <TransactionList transactions={transactions} displayCurrency={displayCurrency} />
                </motion.div>
              )}

              {activeTab === 'budgets' && (
                <motion.div
                  key="budgets"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <BudgetManager budgets={budgets} displayCurrency={displayCurrency} />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <Settings 
                    profile={profile}
                    onClose={() => setActiveTab('dashboard')}
                    isTab={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <AnimatePresence>
          {isFormOpen && (
            <TransactionForm 
              onClose={() => { setIsFormOpen(false); }} 
              defaultCurrency={displayCurrency}
              defaultType={formType}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
