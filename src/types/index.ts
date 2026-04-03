// -- Enums / Union Types --
export type AccountType = 'cash' | 'bank';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type LabelType = 'expense' | 'income' | 'both';
export type Frequency = 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
export type SavingsTransactionType = 'deposit' | 'withdraw';

// All monetary amounts are integers in HUF (forints)

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  icon: string;
  color: string;
  order: number;
  createdAt: string;
}

export interface Label {
  id: string;
  name: string;
  type: LabelType;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  toAccountId: string | null;
  labelIds: string[];
  name: string;
  description: string | null;
  date: string;
  recurringId: string | null;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  toAccountId: string | null;
  labelIds: string[];
  description: string | null;
  frequency: Frequency;
  nextDueDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface PiggyBank {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  linkedAccountId: string | null;
  icon: string;
  color: string;
  createdAt: string;
}

export interface PiggyTransaction {
  id: string;
  piggyBankId: string;
  accountId: string;
  type: SavingsTransactionType;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface TransactionWithDetails extends Transaction {
  accountName: string;
  accountIcon: string;
  accountColor: string;
  toAccountName?: string;
  labels: Label[];
}

export interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
}

export interface LabelStats {
  labelId: string;
  labelName: string;
  labelIcon: string;
  labelColor: string;
  total: number;
  percentage: number;
}

export interface ZsebbankBackup {
  meta: {
    version: number;
    appVersion: string;
    exportedAt: string;
    tableCounts: Record<string, number>;
  };
  data: {
    accounts: Account[];
    labels: Label[];
    transactions: Transaction[];
    recurringTransactions: RecurringTransaction[];
    piggyBanks: PiggyBank[];
    piggyTransactions: PiggyTransaction[];
    settings: Setting[];
  };
}
