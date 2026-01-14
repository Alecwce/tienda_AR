// src/store/useUserStore.ts - User state management with Zustand
import type { User, UserMeasurements, UserStats } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  measurements: UserMeasurements | null;
  favorites: string[];
  history: string[]; // Recently viewed product IDs
  stats: UserStats;

  // Actions
  setUser: (user: User | null) => void;
  logout: () => void;

  // Measurements
  setMeasurements: (measurements: UserMeasurements) => void;
  clearMeasurements: () => void;

  // Favorites
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // History
  addToHistory: (productId: string) => void;
  clearHistory: () => void;

  // Stats
  incrementArTries: () => void;
}

const MAX_HISTORY_ITEMS = 20;

const defaultStats: UserStats = {
  totalOrders: 0,
  totalSpent: 0,
  favoriteCount: 0,
  arTriesCount: 0,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      measurements: null,
      favorites: [],
      history: [],
      stats: defaultStats,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          favorites: user?.favorites || [],
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          // Mantener measurements y history locales
        });
      },

      setMeasurements: (measurements) => {
        set({ measurements });
      },

      clearMeasurements: () => {
        set({ measurements: null });
      },

      toggleFavorite: (productId) => {
        const favorites = [...get().favorites];
        const index = favorites.indexOf(productId);

        if (index >= 0) {
          favorites.splice(index, 1);
        } else {
          favorites.push(productId);
        }

        set({
          favorites,
          stats: { ...get().stats, favoriteCount: favorites.length },
        });
      },

      isFavorite: (productId) => {
        return get().favorites.includes(productId);
      },

      addToHistory: (productId) => {
        const history = get().history.filter((id) => id !== productId);
        history.unshift(productId);

        // Limitar a MAX_HISTORY_ITEMS
        if (history.length > MAX_HISTORY_ITEMS) {
          history.pop();
        }

        set({ history });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      incrementArTries: () => {
        set({
          stats: {
            ...get().stats,
            arTriesCount: get().stats.arTriesCount + 1,
          },
        });
      },
    }),
    {
      name: 'virtual-vogue-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        measurements: state.measurements,
        favorites: state.favorites,
        history: state.history,
        stats: state.stats,
      }),
    }
  )
);
