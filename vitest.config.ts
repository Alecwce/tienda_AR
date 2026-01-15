import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    exclude: ['node_modules', '.expo'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      'react-native-mmkv': resolve(__dirname, './__mocks__/react-native-mmkv.ts'),
    },
  },
});
