import { create } from 'zustand';
import { db } from '@/db/database';
import type { PiggyBank, PiggyTransaction } from '@/types';
import { generateId } from '@/utils/id';
import { getToday } from '@/utils/format';
import { useAccountStore } from './accountStore';

interface PiggyState {
  piggyBanks: PiggyBank[];
  isLoaded: boolean;
  load: () => Promise<void>;
  addPiggyBank: (data: Omit<PiggyBank, 'id' | 'currentAmount' | 'createdAt'>) => Promise<void>;
  updatePiggyBank: (id: string, data: Partial<Omit<PiggyBank, 'id' | 'currentAmount' | 'createdAt'>>) => Promise<void>;
  deletePiggyBank: (id: string) => Promise<void>;
  deposit: (piggyId: string, accountId: string, amount: number) => Promise<void>;
  withdraw: (piggyId: string, accountId: string, amount: number) => Promise<void>;
  getTransactions: (piggyId: string) => Promise<PiggyTransaction[]>;
  getPiggyBank: (id: string) => PiggyBank | undefined;
  reload: () => Promise<void>;
}

export const usePiggyStore = create<PiggyState>((set, get) => ({
  piggyBanks: [],
  isLoaded: false,

  load: async () => {
    const piggyBanks = await db.piggyBanks.toArray();
    set({ piggyBanks, isLoaded: true });
  },

  reload: async () => {
    const piggyBanks = await db.piggyBanks.toArray();
    set({ piggyBanks });
  },

  addPiggyBank: async (data) => {
    const piggy: PiggyBank = {
      ...data,
      id: generateId(),
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };
    await db.piggyBanks.add(piggy);
    set((state) => ({ piggyBanks: [...state.piggyBanks, piggy] }));
  },

  updatePiggyBank: async (id, data) => {
    await db.piggyBanks.update(id, data);
    set((state) => ({
      piggyBanks: state.piggyBanks.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
  },

  deletePiggyBank: async (id) => {
    const piggy = get().getPiggyBank(id);
    if (!piggy) return;

    // If piggy has money and is linked to an account, return the money
    if (piggy.currentAmount > 0 && piggy.linkedAccountId) {
      const accountStore = useAccountStore.getState();
      await db.transaction('rw', [db.piggyBanks, db.piggyTransactions, db.accounts], async () => {
        const acc = await db.accounts.get(piggy.linkedAccountId!);
        if (acc) {
          await db.accounts.update(piggy.linkedAccountId!, { balance: acc.balance + piggy.currentAmount });
        }
        await db.piggyTransactions.where('piggyBankId').equals(id).delete();
        await db.piggyBanks.delete(id);
      });
      await accountStore.reload();
    } else {
      await db.transaction('rw', [db.piggyBanks, db.piggyTransactions], async () => {
        await db.piggyTransactions.where('piggyBankId').equals(id).delete();
        await db.piggyBanks.delete(id);
      });
    }

    set((state) => ({ piggyBanks: state.piggyBanks.filter((p) => p.id !== id) }));
  },

  deposit: async (piggyId, accountId, amount) => {
    const accountStore = useAccountStore.getState();

    await db.transaction('rw', [db.piggyBanks, db.piggyTransactions, db.accounts], async () => {
      const account = await db.accounts.get(accountId);
      if (!account) throw new Error('Számla nem található.');
      if (account.balance < amount) throw new Error('Nincs elég egyenleg a számlán.');

      const piggy = await db.piggyBanks.get(piggyId);
      if (!piggy) throw new Error('Persely nem található.');

      await db.accounts.update(accountId, { balance: account.balance - amount });
      await db.piggyBanks.update(piggyId, { currentAmount: piggy.currentAmount + amount });

      const piggyTx: PiggyTransaction = {
        id: generateId(),
        piggyBankId: piggyId,
        accountId,
        type: 'deposit',
        amount,
        date: getToday(),
        createdAt: new Date().toISOString(),
      };
      await db.piggyTransactions.add(piggyTx);
    });

    await accountStore.reload();
    await get().reload();
  },

  withdraw: async (piggyId, accountId, amount) => {
    const accountStore = useAccountStore.getState();

    await db.transaction('rw', [db.piggyBanks, db.piggyTransactions, db.accounts], async () => {
      const piggy = await db.piggyBanks.get(piggyId);
      if (!piggy) throw new Error('Persely nem található.');
      if (piggy.currentAmount < amount) throw new Error('Nincs elég pénz a perselyben.');

      const account = await db.accounts.get(accountId);
      if (!account) throw new Error('Számla nem található.');

      await db.accounts.update(accountId, { balance: account.balance + amount });
      await db.piggyBanks.update(piggyId, { currentAmount: piggy.currentAmount - amount });

      const piggyTx: PiggyTransaction = {
        id: generateId(),
        piggyBankId: piggyId,
        accountId,
        type: 'withdraw',
        amount,
        date: getToday(),
        createdAt: new Date().toISOString(),
      };
      await db.piggyTransactions.add(piggyTx);
    });

    await accountStore.reload();
    await get().reload();
  },

  getTransactions: async (piggyId: string) => {
    return await db.piggyTransactions.where('piggyBankId').equals(piggyId).reverse().sortBy('date');
  },

  getPiggyBank: (id) => get().piggyBanks.find((p) => p.id === id),
}));
