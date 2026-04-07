import { create } from 'zustand';
import { db } from '@/db/database';
import type { Debt, DebtDirection, Transaction } from '@/types';
import { generateId } from '@/utils/id';
import { getToday } from '@/utils/format';
import { useAccountStore } from './accountStore';
import { useTransactionStore } from './transactionStore';

interface DebtState {
  debts: Debt[];
  isLoaded: boolean;
  load: () => Promise<void>;
  reload: () => Promise<void>;
  addDebt: (data: Omit<Debt, 'id' | 'status' | 'settledAccountId' | 'settledAt' | 'transactionId' | 'createdAt'>) => Promise<void>;
  updateDebt: (id: string, data: Partial<Pick<Debt, 'personName' | 'amount' | 'name' | 'description' | 'labelIds' | 'date' | 'direction'>>) => Promise<void>;
  settleDebt: (id: string, accountId: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  getDebt: (id: string) => Debt | undefined;
  getPending: () => Debt[];
  getByDirection: (direction: DebtDirection) => Debt[];
  totalOwedToMe: () => number;
  totalIOwe: () => number;
}

export const useDebtStore = create<DebtState>((set, get) => ({
  debts: [],
  isLoaded: false,

  load: async () => {
    const debts = await db.debts.orderBy('date').reverse().toArray();
    set({ debts, isLoaded: true });
  },

  reload: async () => {
    const debts = await db.debts.orderBy('date').reverse().toArray();
    set({ debts });
  },

  addDebt: async (data) => {
    const debt: Debt = {
      ...data,
      id: generateId(),
      status: 'pending',
      settledAccountId: null,
      settledAt: null,
      transactionId: null,
      createdAt: new Date().toISOString(),
    };
    await db.debts.add(debt);
    set((state) => ({ debts: [debt, ...state.debts] }));
  },

  updateDebt: async (id, data) => {
    const debt = get().getDebt(id);
    if (!debt) throw new Error('Tartozás nem található.');
    if (debt.status === 'settled') throw new Error('Teljesített tartozás nem szerkeszthető.');
    await db.debts.update(id, data);
    set((state) => ({
      debts: state.debts.map((d) => (d.id === id ? { ...d, ...data } : d)),
    }));
  },

  settleDebt: async (id, accountId) => {
    const accountStore = useAccountStore.getState();
    const transactionStore = useTransactionStore.getState();
    const debt = get().getDebt(id);
    if (!debt) throw new Error('Tartozás nem található.');
    if (debt.status === 'settled') throw new Error('Ez a tartozás már teljesült.');

    const txId = generateId();
    const txType = debt.direction === 'they_owe_me' ? 'income' : 'expense';
    const txName = `Tartozás: ${debt.personName} - ${debt.name}`;
    const today = getToday();

    // Atomi tranzakció: balance update + tranzakció rekord + debt status
    await db.transaction('rw', [db.debts, db.accounts, db.transactions], async () => {
      const account = await db.accounts.get(accountId);
      if (!account) throw new Error('Számla nem található.');

      if (debt.direction === 'they_owe_me') {
        await db.accounts.update(accountId, { balance: account.balance + debt.amount });
      } else {
        if (account.balance < debt.amount) throw new Error('Nincs elég egyenleg a számlán.');
        await db.accounts.update(accountId, { balance: account.balance - debt.amount });
      }

      // Tranzakció rekord létrehozása
      const transaction: Transaction = {
        id: txId,
        type: txType,
        amount: debt.amount,
        accountId,
        toAccountId: null,
        labelIds: debt.labelIds,
        name: txName,
        description: debt.description,
        date: today,
        recurringId: null,
        createdAt: new Date().toISOString(),
      };
      await db.transactions.add(transaction);

      // Debt status frissítése
      await db.debts.update(id, {
        status: 'settled',
        settledAccountId: accountId,
        settledAt: today,
        transactionId: txId,
      });
    });

    await accountStore.reload();
    await transactionStore.reload();
    await get().reload();
  },

  deleteDebt: async (id) => {
    const accountStore = useAccountStore.getState();
    const transactionStore = useTransactionStore.getState();
    const debt = get().getDebt(id);
    if (!debt) return;

    if (debt.status === 'settled') {
      if (debt.transactionId) {
        // Van tranzakció hozzá -> a deleteTransaction visszafordítja az egyenleget is
        await transactionStore.deleteTransaction(debt.transactionId);
        await db.debts.delete(id);
      } else {
        // Régi settled debt transactionId nélkül -> kézi egyenleg-visszafordítás (fallback)
        if (debt.settledAccountId) {
          await db.transaction('rw', [db.debts, db.accounts], async () => {
            const account = await db.accounts.get(debt.settledAccountId!);
            if (account) {
              if (debt.direction === 'they_owe_me') {
                if (account.balance < debt.amount) throw new Error('Az egyenleg negatívba menne a törlés után.');
                await db.accounts.update(debt.settledAccountId!, { balance: account.balance - debt.amount });
              } else {
                await db.accounts.update(debt.settledAccountId!, { balance: account.balance + debt.amount });
              }
            }
            await db.debts.delete(id);
          });
          await accountStore.reload();
        } else {
          await db.debts.delete(id);
        }
      }
    } else {
      await db.debts.delete(id);
    }

    await transactionStore.reload();
    await get().reload();
    set((state) => ({ debts: state.debts.filter((d) => d.id !== id) }));
  },

  getDebt: (id) => get().debts.find((d) => d.id === id),

  getPending: () => get().debts.filter((d) => d.status === 'pending'),

  getByDirection: (direction) => get().debts.filter((d) => d.direction === direction),

  totalOwedToMe: () =>
    get().debts.filter((d) => d.direction === 'they_owe_me' && d.status === 'pending').reduce((sum, d) => sum + d.amount, 0),

  totalIOwe: () =>
    get().debts.filter((d) => d.direction === 'i_owe_them' && d.status === 'pending').reduce((sum, d) => sum + d.amount, 0),
}));
