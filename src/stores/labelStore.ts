import { create } from 'zustand';
import { db } from '@/db/database';
import type { Label, LabelType } from '@/types';
import { generateId } from '@/utils/id';

interface LabelState {
  labels: Label[];
  isLoaded: boolean;
  load: () => Promise<void>;
  addLabel: (data: Omit<Label, 'id' | 'isDefault' | 'createdAt'>) => Promise<void>;
  updateLabel: (id: string, data: Partial<Omit<Label, 'id' | 'isDefault' | 'createdAt'>>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  getByType: (type: LabelType | 'all') => Label[];
  getLabel: (id: string) => Label | undefined;
}

export const useLabelStore = create<LabelState>((set, get) => ({
  labels: [],
  isLoaded: false,

  load: async () => {
    const labels = await db.labels.toArray();
    set({ labels, isLoaded: true });
  },

  addLabel: async (data) => {
    const label: Label = {
      ...data,
      id: generateId(),
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    await db.labels.add(label);
    set((state) => ({ labels: [...state.labels, label] }));
  },

  updateLabel: async (id, data) => {
    await db.labels.update(id, data);
    set((state) => ({
      labels: state.labels.map((l) => (l.id === id ? { ...l, ...data } : l)),
    }));
  },

  deleteLabel: async (id) => {
    await db.labels.delete(id);
    set((state) => ({ labels: state.labels.filter((l) => l.id !== id) }));
  },

  getByType: (type) => {
    if (type === 'all') return get().labels;
    return get().labels.filter((l) => l.type === type || l.type === 'both');
  },

  getLabel: (id) => get().labels.find((l) => l.id === id),
}));
