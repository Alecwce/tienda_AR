// src/store/slices/userSlice.ts - User slice usando slices pattern

import { supabase } from '@/src/lib/supabase';
import type { User, UserMeasurements, UserStats } from '@/src/types';
import type { Session } from '@supabase/supabase-js';
import type { StateCreator } from 'zustand';

export interface UserSlice {
  // State
  session: Session | null;
  user: User | null;
  measurements: UserMeasurements | null;
  favorites: string[];
  history: string[];
  stats: UserStats | null;
  isLoading: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  toggleFavorite: (productId: string) => void;
  addToHistory: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  updateMeasurements: (measurements: UserMeasurements) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  session: null,
  user: null,
  measurements: null,
  favorites: [],
  history: [],
  stats: null,
  isLoading: false,

  setSession: async (session) => {
    set({ session });
    // Load user profile if session exists
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
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
          },
        });
      }
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ isLoading: false });
    return { error: error ? new Error(error.message) : null };
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    set({ isLoading: false });
    return { error: error ? new Error(error.message) : null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      measurements: null,
      favorites: [],
      history: [],
      stats: null,
    });
  },

  toggleFavorite: (productId) => {
    const { favorites } = get();
    const isFav = favorites.includes(productId);
    set({
      favorites: isFav
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId],
    });
  },

  addToHistory: (productId) => {
    const { history } = get();
    const filtered = history.filter((id) => id !== productId);
    set({ history: [productId, ...filtered].slice(0, 20) });
  },

  isFavorite: (productId) => get().favorites.includes(productId),

  updateMeasurements: (measurements) => set({ measurements }),
});
