import { create } from 'zustand';
import { db } from '@/db/database';

interface SettingsState {
  pin: string | null;
  isLocked: boolean;
  isLoaded: boolean;
  load: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  removePin: () => Promise<void>;
  unlock: () => void;
  lock: () => void;
  getSetting: (key: string) => Promise<string | null>;
  setSetting: (key: string, value: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  pin: null,
  isLocked: true,
  isLoaded: false,

  load: async () => {
    const pinSetting = await db.settings.get('pin');
    const pin = pinSetting?.value ?? null;
    set({
      pin,
      isLocked: pin !== null,
      isLoaded: true,
    });
  },

  setPin: async (pin: string) => {
    await db.settings.put({ key: 'pin', value: pin });
    set({ pin, isLocked: false });
  },

  removePin: async () => {
    await db.settings.delete('pin');
    set({ pin: null, isLocked: false });
  },

  unlock: () => set({ isLocked: false }),
  lock: () => set((state) => ({ isLocked: state.pin !== null })),

  getSetting: async (key: string) => {
    const setting = await db.settings.get(key);
    return setting?.value ?? null;
  },

  setSetting: async (key: string, value: string) => {
    await db.settings.put({ key, value });
  },
}));
