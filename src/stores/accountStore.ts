import { create } from 'zustand';
import { db } from '@/db/database';
import type { Account, AccountType } from '@/types';
import { generateId } from '@/utils/id';

interface AccountState {
  accounts: Account[];
  isLoaded: boolean;
  load: () => Promise<void>;
  getAccount: (id: string) => Account | undefined;
  addAccount: (data: Omit<Account, 'id' | 'createdAt'>) => Promise<Account>;
  updateAccount: (id: string, data: Partial<Omit<Account, 'id' | 'createdAt'>>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  updateBalance: (id: string, delta: number) => Promise<void>;
  totalBalance: () => number;
  cashBalance: () => number;
  bankBalance: () => number;
  getAccountsByType: (type: AccountType) => Account[];
  reload: () => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  isLoaded: false,

  load: async () => {
    const accounts = await db.accounts.orderBy('order').toArray();
    set({ accounts, isLoaded: true });
  },

  reload: async () => {
    const accounts = await db.accounts.orderBy('order').toArray();
    set({ accounts });
  },

  getAccount: (id: string) => {
    return get().accounts.find((a) => a.id === id);
  },

  addAccount: async (data) => {
    const account: Account = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.accounts.add(account);
    set((state) => ({ accounts: [...state.accounts, account] }));
    return account;
  },

  updateAccount: async (id, data) => {
    await db.accounts.update(id, data);
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  },

  deleteAccount: async (id) => {
    await db.transaction('rw', [db.accounts, db.transactions, db.piggyBanks, db.piggyTransactions], async () => {
      await db.transactions.where('accountId').equals(id).delete();
      await db.transactions.where('toAccountId').equals(id).delete();
      await db.piggyTransactions.where('accountId').equals(id).delete();
      const linkedPiggies = await db.piggyBanks.where('linkedAccountId').equals(id).toArray();
      for (const piggy of linkedPiggies) {
        await db.piggyBanks.update(piggy.id, { linkedAccountId: null });
      }
      await db.accounts.delete(id);
    });
    set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) }));
  },

  updateBalance: async (id, delta) => {
    const account = get().getAccount(id);
    if (!account) throw new Error('Számla nem található.');
    const newBalance = account.balance + delta;
    if (newBalance < 0) throw new Error('Nincs elég egyenleg a számlán.');
    await db.accounts.update(id, { balance: newBalance });
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? { ...a, balance: newBalance } : a)),
    }));
  },

  totalBalance: () => get().accounts.reduce((sum, a) => sum + a.balance, 0),
  cashBalance: () => get().accounts.filter((a) => a.type === 'cash').reduce((sum, a) => sum + a.balance, 0),
  bankBalance: () => get().accounts.filter((a) => a.type === 'bank').reduce((sum, a) => sum + a.balance, 0),
  getAccountsByType: (type) => get().accounts.filter((a) => a.type === type),
}));
