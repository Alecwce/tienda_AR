// __tests__/setup.ts - Test setup and mocks

import { vi } from 'vitest';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: vi.fn(async (key: string) => null),
  setItem: vi.fn(async (key: string, value: string) => undefined),
  removeItem: vi.fn(async (key: string) => undefined),
  clear: vi.fn(async () => undefined),
  getAllKeys: vi.fn(async () => []),
  multiGet: vi.fn(async (keys: string[]) => []),
  multiSet: vi.fn(async (keyValuePairs: [string, string][]) => undefined),
  multiRemove: vi.fn(async (keys: string[]) => undefined),
};

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: mockAsyncStorage,
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
