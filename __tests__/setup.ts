// __tests__/setup.ts - Test setup and mocks

import { vi } from 'vitest';

// Dummy env vars for tests
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'dummy-key';

// Mock MMKV - usa el manual mock en __mocks__/react-native-mmkv.ts
vi.mock('react-native-mmkv');

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
  })),
}));

// Mock expo-image
vi.mock('expo-image', () => ({
  Image: {
    prefetch: vi.fn((url: string) => Promise.resolve(true)),
  },
}));

// Mock react-native components that need DOM
vi.mock('react-native', async () => {
  const actual = await vi.importActual<typeof import('react-native')>('react-native');
  return {
    ...actual,
    Platform: {
      OS: 'ios',
      select: (obj: any) => obj.ios || obj.default,
    },
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
  };
});

// Global test utilities
// Mock global __DEV__ if not already defined
if (typeof (global as any).__DEV__ === 'undefined') {
  (global as any).__DEV__ = true;
}
