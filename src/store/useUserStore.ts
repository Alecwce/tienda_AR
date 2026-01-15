import { supabase } from '@/src/lib/supabase';
import type { User, UserMeasurements, UserStats } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
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
  session: Session | null;

  // Actions
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;

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
      session: null,
      user: null,
      isAuthenticated: false,
      measurements: null,
      favorites: [],
      history: [],
      stats: defaultStats,

      setSession: (session) => {
        set({ session, isAuthenticated: !!session });
        if (session?.user) {
            // Load extra profile data if needed
        }
      },

      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (data.session) {
          get().setSession(data.session);
          
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (profile) {
             set({
                 user: {
                     id: profile.id,
                     email: profile.email || '',
                     name: profile.full_name || '',
                     avatar: profile.avatar_url,
                     favorites: [],
                     history: [],
                     createdAt: profile.created_at || new Date().toISOString(),
                 }
             });
          }
        }
        return { error };
      },

      signUp: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        // Auto sign-in logic usually handled by supabase if email confirm is off
        if (data.session) {
             get().setSession(data.session);
        }
        return { error };
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({
           session: null,
           user: null, 
           isAuthenticated: false,
           // Keep local preferences? Maybe clear sensitive data
           measurements: null,
           favorites: [],
           history: []
        });
      },

      // Legacy/Helper setter
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          favorites: user?.favorites || [],
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
