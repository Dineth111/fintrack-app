import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  currency: string;
  monthlyBudget: number | null;
  setCurrency: (currency: string) => void;
  setMonthlyBudget: (budget: number | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: 'LKR',
      monthlyBudget: null,
      setCurrency: (currency) => set({ currency }),
      setMonthlyBudget: (monthlyBudget) => set({ monthlyBudget }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
