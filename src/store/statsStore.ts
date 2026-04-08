import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameStat } from '../types';

interface StatsState {
  history: GameStat[];
  addStat: (stat: Omit<GameStat, 'id' | 'timestamp'>) => void;
  clearStats: () => void;
}

// Safe localStorage wrapper — falls back to no-op when unavailable (e.g. React Native)
const safeLocalStorage = {
  getItem(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch {}
  },
  removeItem(key: string): void {
    try { localStorage.removeItem(key); } catch {}
  },
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      history: [],
      addStat: (stat) =>
        set((s) => ({
          history: [
            ...s.history,
            {
              ...stat,
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              timestamp: Date.now(),
            },
          ],
        })),
      clearStats: () => set({ history: [] }),
    }),
    {
      name: 'gauss-game-stats',
      storage: createJSONStorage(() => safeLocalStorage),
    }
  )
);
