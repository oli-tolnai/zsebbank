import { create } from 'zustand';
import { db } from '@/db/database';
import type { Transaction, TransactionType } from '@/types';
import { generateId } from '@/utils/id';
import { useAccountStore } from './accountStore';

interface TransactionFilters {
  type?: TransactionType;
  labelIds?: string[];
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface TransactionState {
  transactions: Transaction[];
  isLoaded: boolean;
  load: (limit?: number) => Promise<void>;
  loadMore: (offset: number, limit: number) => Promise<Transaction[]>;
  loadFiltered: (filters: TransactionFilters) => Promise<void>;
  getById: (id: string) => Promise<Transaction | undefined>;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, oldTx: Transaction, newData: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getByAccount: (accountId: string, limit?: number) => Promise<Transaction[]>;
  reload: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoaded: false,

  load: async (limit = 50) => {
    const transactions = await db.transactions.orderBy('date').reverse().limit(limit).toArray();
    set({ transactions, isLoaded: true });
  },

  reload: async () => {
    const transactions = await db.transactions.orderBy('date').reverse().limit(50).toArray();
    set({ transactions });
  },

  loadMore: async (offset: number, limit: number) => {
    return await db.transactions.orderBy('date').reverse().offset(offset).limit(limit).toArray();
  },

  loadFiltered: async (filters: TransactionFilters) => {
    let collection = db.transactions.orderBy('date').reverse();

    const all = await collection.toArray();
    let filtered = all;

    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }
    if (filters.accountId) {
      filtered = filtered.filter((t) => t.accountId === filters.accountId || t.toAccountId === filters.accountId);
    }
    if (filters.startDate) {
      filtered = filtered.filter((t) => t.date >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter((t) => t.date <= filters.endDate!);
    }
    if (filters.labelIds && filters.labelIds.length > 0) {
      filtered = filtered.filter((t) => filters.labelIds!.some((lid) => t.labelIds.includes(lid)));
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.name.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s))
      );
    }

    set({ transactions: filtered });
  },

  getById: async (id: string) => {
    return await db.transactions.get(id);
  },

  addTransaction: async (data) => {
    const accountStore = useAccountStore.getState();
    const transaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      // Validate and apply balance changes
      if (data.type === 'expense') {
        const account = await db.accounts.get(data.accountId);
        if (!account) throw new Error('Számla nem található.');
        if (account.balance < data.amount) throw new Error('Nincs elég egyenleg a számlán.');
        await db.accounts.update(data.accountId, { balance: account.balance - data.amount });
      } else if (data.type === 'income') {
        const account = await db.accounts.get(data.accountId);
        if (!account) throw new Error('Számla nem található.');
        await db.accounts.update(data.accountId, { balance: account.balance + data.amount });
      } else if (data.type === 'transfer') {
        if (!data.toAccountId) throw new Error('Cél számla kötelező átutalásnál.');
        const source = await db.accounts.get(data.accountId);
        const target = await db.accounts.get(data.toAccountId);
        if (!source || !target) throw new Error('Számla nem található.');
        if (source.balance < data.amount) throw new Error('Nincs elég egyenleg a forrás számlán.');
        await db.accounts.update(data.accountId, { balance: source.balance - data.amount });
        await db.accounts.update(data.toAccountId, { balance: target.balance + data.amount });
      }

      await db.transactions.add(transaction);
    });

    // Reload both stores from DB for consistency
    await accountStore.reload();
    await get().reload();
  },

  updateTransaction: async (id, oldTx, newData) => {
    const accountStore = useAccountStore.getState();

    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      // Step 1: Reverse old transaction's balance effect
      if (oldTx.type === 'expense') {
        const acc = await db.accounts.get(oldTx.accountId);
        if (acc) await db.accounts.update(oldTx.accountId, { balance: acc.balance + oldTx.amount });
      } else if (oldTx.type === 'income') {
        const acc = await db.accounts.get(oldTx.accountId);
        if (acc) {
          if (acc.balance < oldTx.amount) throw new Error('Az egyenleg negatívba menne a visszavonás után.');
          await db.accounts.update(oldTx.accountId, { balance: acc.balance - oldTx.amount });
        }
      } else if (oldTx.type === 'transfer') {
        const source = await db.accounts.get(oldTx.accountId);
        const target = oldTx.toAccountId ? await db.accounts.get(oldTx.toAccountId) : null;
        if (source) await db.accounts.update(oldTx.accountId, { balance: source.balance + oldTx.amount });
        if (target) {
          if (target.balance < oldTx.amount) throw new Error('A cél számla egyenlege negatívba menne.');
          await db.accounts.update(oldTx.toAccountId!, { balance: target.balance - oldTx.amount });
        }
      }

      // Step 2: Apply new transaction's balance effect
      if (newData.type === 'expense') {
        const acc = await db.accounts.get(newData.accountId);
        if (!acc) throw new Error('Számla nem található.');
        if (acc.balance < newData.amount) throw new Error('Nincs elég egyenleg a számlán.');
        await db.accounts.update(newData.accountId, { balance: acc.balance - newData.amount });
      } else if (newData.type === 'income') {
        const acc = await db.accounts.get(newData.accountId);
        if (!acc) throw new Error('Számla nem található.');
        await db.accounts.update(newData.accountId, { balance: acc.balance + newData.amount });
      } else if (newData.type === 'transfer') {
        if (!newData.toAccountId) throw new Error('Cél számla kötelező átutalásnál.');
        const source = await db.accounts.get(newData.accountId);
        const target = await db.accounts.get(newData.toAccountId);
        if (!source || !target) throw new Error('Számla nem található.');
        if (source.balance < newData.amount) throw new Error('Nincs elég egyenleg a forrás számlán.');
        await db.accounts.update(newData.accountId, { balance: source.balance - newData.amount });
        await db.accounts.update(newData.toAccountId, { balance: target.balance + newData.amount });
      }

      // Step 3: Update the transaction record
      await db.transactions.update(id, { ...newData });
    });

    await accountStore.reload();
    await get().reload();
  },

  deleteTransaction: async (id) => {
    const accountStore = useAccountStore.getState();
    const tx = await db.transactions.get(id);
    if (!tx) return;

    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      // Reverse balance effect
      if (tx.type === 'expense') {
        const acc = await db.accounts.get(tx.accountId);
        if (acc) await db.accounts.update(tx.accountId, { balance: acc.balance + tx.amount });
      } else if (tx.type === 'income') {
        const acc = await db.accounts.get(tx.accountId);
        if (acc) {
          if (acc.balance < tx.amount) throw new Error('Az egyenleg negatívba menne a törlés után.');
          await db.accounts.update(tx.accountId, { balance: acc.balance - tx.amount });
        }
      } else if (tx.type === 'transfer') {
        const source = await db.accounts.get(tx.accountId);
        const target = tx.toAccountId ? await db.accounts.get(tx.toAccountId) : null;
        if (source) await db.accounts.update(tx.accountId, { balance: source.balance + tx.amount });
        if (target) {
          if (target.balance < tx.amount) throw new Error('A cél számla egyenlege negatívba menne.');
          await db.accounts.update(tx.toAccountId!, { balance: target.balance - tx.amount });
        }
      }

      await db.transactions.delete(id);
    });

    await accountStore.reload();
    await get().reload();
  },

  getByAccount: async (accountId: string, limit = 20) => {
    const byAccount = await db.transactions.where('accountId').equals(accountId).reverse().sortBy('date');
    const byToAccount = await db.transactions.where('toAccountId').equals(accountId).reverse().sortBy('date');
    const merged = [...byAccount, ...byToAccount]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
    return merged;
  },
}));
