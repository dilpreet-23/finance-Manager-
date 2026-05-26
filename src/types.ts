export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferredCurrencies?: string[];
  monthlyBudget?: number;
  budgetCurrency?: string;
  createdAt?: string;
}

export interface Transaction {
  id?: string;
  uid: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  createdAt?: string;
}

export type Currency = string;

export const ALL_CURRENCIES: { code: string; symbol: string; label: string }[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
];

export const DEFAULT_CURRENCIES = ['USD', 'INR', 'EUR'];

export interface Budget {
  id?: string;
  uid: string;
  category: string;
  limit: number;
  currency: string;
  month: string; // YYYY-MM
}

export type TransactionCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Housing' 
  | 'Utilities' 
  | 'Health' 
  | 'Entertainment' 
  | 'Shopping' 
  | 'Salary' 
  | 'Investment'
  | 'Other Income'
  | 'Other Expense';

export const CATEGORIES: TransactionCategory[] = [
  'Food', 'Transport', 'Housing', 'Utilities', 'Health', 'Entertainment', 'Shopping', 'Salary', 'Investment', 'Other Income', 'Other Expense'
];

export const INCOME_CATEGORIES: TransactionCategory[] = [
  'Salary', 'Investment', 'Other Income'
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'Food', 'Transport', 'Housing', 'Utilities', 'Health', 'Entertainment', 'Shopping', 'Other Expense'
];
