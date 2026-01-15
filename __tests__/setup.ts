// __tests__/setup.ts - Test setup and mocks

import { vi } from 'vitest';

//  Mock MMKV Storage - debe estar hoisted
const { MockMMKV } = vi.hoisted(() => {
  class MockMMKV {
    private storage = new Map<string, string>();
    
    set(key: string, value: string | number | boolean) {
      this.storage.set(key, String(value));
    }
    
    getString(key: string) {
      return this.storage.get(key) ?? null;
    }
    
    getNumber(key: string) {
      const value = this.storage.get(key);
      return value ? Number(value) : undefined;
    }
    
    getBoolean(key: string) {
      return this.storage.get(key) === 'true';
    }
    
    delete(key: string) {
      this.storage.delete(key);
    }
    
    getAllKeys() {
      return Array.from(this.storage.keys());
    }
    
    clearAll() {
      this.storage.clear();
    }
    
    contains(key: string) {
      return this.storage.has(key);
    }
  }
  
  return { MockMMKV };
});

vi.mock('react-native-mmkv', () => ({
  MMKV: MockMMKV,
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
declare global {
  var __DEV__: boolean;
}

global.__DEV__ = true;
