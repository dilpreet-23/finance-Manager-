import React, { useMemo } from 'react';
import { Transaction, Budget, Currency, UserProfile } from '../types';
import { formatCurrency, convertAmount } from '../lib/utils';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, DollarSign, IndianRupee, Euro, Plus, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  profile: UserProfile | null;
  onAddClick: (type?: 'income' | 'expense') => void;
  displayCurrency: string;
}

const COLORS = ['#ffffff', '#8E9299', '#4a4a4a', '#F27D26', '#E6E6E6', '#d1d1d1', '#9e9e9e'];

const getCurrencyIcon = (code: Currency, size = 14) => {
  switch (code) {
    case 'INR': return <IndianRupee size={size} />;
    case 'EUR': return <Euro size={size} />;
    default: return <DollarSign size={size} />;
  }
};

export const Dashboard: React.FC<Props> = ({ transactions, budgets, profile, onAddClick, displayCurrency }) => {
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', displayCurrency), 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertAmount(t.amount, t.currency || 'USD', displayCurrency), 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions, displayCurrency]);

  const incomeTransactions = useMemo(() => 
    transactions.filter(t => t.type === 'income').slice(0, 5),
    [transactions]
  );

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const convertedAmount = convertAmount(t.amount, t.currency || 'USD', displayCurrency);
        categories[t.category] = (categories[t.category] || 0) + convertedAmount;
      });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions, displayCurrency]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      if (!months[month]) months[month] = { income: 0, expense: 0 };
      const convertedAmount = convertAmount(t.amount, t.currency || 'USD', displayCurrency);
      if (t.type === 'income') months[month].income += convertedAmount;
      else months[month].expense += convertedAmount;
    });
    return Object.entries(months).map(([name, data]) => ({ name, ...data }));
  }, [transactions, displayCurrency]);

  const totalBudget = useMemo(() => {
    if (profile?.monthlyBudget) {
      return convertAmount(profile.monthlyBudget, profile.budgetCurrency || 'USD', displayCurrency);
    }
    return budgets
      .reduce((sum, b) => sum + convertAmount(b.limit, b.currency || 'USD', displayCurrency), 0);
  }, [budgets, displayCurrency, profile]);

  const budgetPercent = useMemo(() => {
    if (totalBudget === 0) return 0;
    return (stats.expenses / totalBudget) * 100;
  }, [stats.expenses, totalBudget]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white font-sans mb-4 tracking-tight">Overview</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          title="Total Balance" 
          amount={stats.balance} 
          icon={<Wallet className="text-white" size={18} />} 
          color="bg-white/5"
          textColor={stats.balance < 0 ? "text-rose-400" : "text-white"}
          displayCurrency={displayCurrency}
        />
        <StatCard 
          title="Total Income" 
          amount={stats.income} 
          icon={<TrendingUp className="text-emerald-400" size={18} />} 
          color="bg-emerald-500/10"
          textColor="text-emerald-400"
          displayCurrency={displayCurrency}
        />
        <StatCard 
          title="Total Expenses" 
          amount={stats.expenses} 
          icon={<TrendingDown className="text-rose-400" size={18} />} 
          color="bg-rose-500/10"
          textColor="text-rose-400"
          displayCurrency={displayCurrency}
        />
        <StatCard 
          title="Monthly Budget" 
          amount={totalBudget} 
          icon={<Target className="text-indigo-400" size={18} />} 
          color="bg-indigo-500/10"
          textColor="text-indigo-400"
          displayCurrency={displayCurrency}
        />
        <StatCard 
          title="Budget Usage" 
          amount={budgetPercent} 
          icon={<Sparkles className="text-blue-400" size={18} />} 
          color="bg-blue-500/10"
          textColor="text-blue-400"
          displayCurrency={displayCurrency}
          isPercent={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 p-8 rounded-[32px] shadow-xl border border-white/5">
          <h3 className="text-base font-bold text-white mb-6 font-sans tracking-tight">Expenses by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111', 
                    border: 'none', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => formatCurrency(value, displayCurrency)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', color: 'rgba(255,255,255,0.4)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 p-8 rounded-[32px] shadow-xl border border-white/5">
          <h3 className="text-base font-bold text-white mb-6 font-sans tracking-tight">Income vs Expenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: '#111', 
                    border: 'none', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => formatCurrency(value, displayCurrency)}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, icon, color, textColor = "text-white", displayCurrency, isPercent }: any) => (
  <motion.div 
    whileHover={{ y: -3 }}
    className="bg-white/5 p-6 rounded-[32px] shadow-xl border border-white/5 flex flex-col gap-4"
  >
    <div className="flex items-center justify-between">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${color}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-white/40 text-xs font-medium mb-1">{title}</p>
      <h4 className={`text-lg font-bold font-mono ${textColor}`}>
        {isPercent ? `${amount.toFixed(1)}%` : formatCurrency(amount, displayCurrency)}
      </h4>
    </div>
  </motion.div>
);
