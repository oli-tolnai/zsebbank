import { create } from 'zustand';
import { db } from '@/db/database';
import type { RecurringTransaction } from '@/types';
import { generateId } from '@/utils/id';
import { getNextDueDate, isPastOrToday, isWithinDays } from '@/utils/date';
import { useTransactionStore } from './transactionStore';

interface RecurringState {
  templates: RecurringTransaction[];
  isLoaded: boolean;
  load: () => Promise<void>;
  getUpcoming: (days: number) => RecurringTransaction[];
  getDue: () => RecurringTransaction[];
  addTemplate: (data: Omit<RecurringTransaction, 'id' | 'isActive' | 'createdAt'>) => Promise<void>;
  updateTemplate: (id: string, data: Partial<Omit<RecurringTransaction, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  executeDue: () => Promise<number>;
  reload: () => Promise<void>;
}

export const useRecurringStore = create<RecurringState>((set, get) => ({
  templates: [],
  isLoaded: false,

  load: async () => {
    const templates = await db.recurringTransactions.toArray();
    set({ templates, isLoaded: true });
  },

  reload: async () => {
    const templates = await db.recurringTransactions.toArray();
    set({ templates });
  },

  getUpcoming: (days: number) => {
    return get().templates.filter((t) => t.isActive && isWithinDays(t.nextDueDate, days));
  },

  getDue: () => {
    return get().templates.filter((t) => t.isActive && isPastOrToday(t.nextDueDate));
  },

  addTemplate: async (data) => {
    const template: RecurringTransaction = {
      ...data,
      id: generateId(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await db.recurringTransactions.add(template);
    set((state) => ({ templates: [...state.templates, template] }));
  },

  updateTemplate: async (id, data) => {
    await db.recurringTransactions.update(id, data);
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
  },

  deleteTemplate: async (id) => {
    await db.recurringTransactions.delete(id);
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
  },

  executeDue: async () => {
    const transactionStore = useTransactionStore.getState();
    const due = get().getDue();
    let executed = 0;

    for (const template of due) {
      let currentDueDate = template.nextDueDate;

      while (isPastOrToday(currentDueDate)) {
        try {
          await transactionStore.addTransaction({
            type: template.type,
            amount: template.amount,
            accountId: template.accountId,
            toAccountId: template.toAccountId,
            labelIds: template.labelIds,
            name: template.name,
            description: template.description,
            date: currentDueDate,
            recurringId: template.id,
          });
          executed++;
        } catch {
          // Insufficient balance - stop processing this template
          break;
        }

        currentDueDate = getNextDueDate(currentDueDate, template.frequency);
      }

      // Update next due date
      await db.recurringTransactions.update(template.id, { nextDueDate: currentDueDate });
    }

    if (executed > 0) {
      await get().reload();
    }

    return executed;
  },
}));
