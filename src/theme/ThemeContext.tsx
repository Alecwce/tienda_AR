import { storage } from '@/src/lib/mmkv';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from './index';

type ThemeMode = 'light' | 'dark' | 'system';

// Tipo unión de ambos esquemas de color
export type ThemeColors = typeof lightColors | typeof darkColors;

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
  colors: darkColors,
  isDark: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = () => {
    try {
      const savedMode = storage.getString('themeMode');
      if (savedMode) setMode(savedMode as ThemeMode);
    } catch (e) {
      if (__DEV__) console.error('Failed to load theme', e);
    }
  };

  const updateMode = (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      storage.set('themeMode', newMode);
    } catch (e) {
      if (__DEV__) console.error('Failed to save theme', e);
    }
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors: ThemeColors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, setMode: updateMode, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
