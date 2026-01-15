import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from './index';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: typeof darkColors;
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

  const loadTheme = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode) setMode(savedMode as ThemeMode);
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  };

  const updateMode = async (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      await AsyncStorage.setItem('themeMode', newMode);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : (lightColors as unknown as typeof darkColors);

  return (
    <ThemeContext.Provider value={{ mode, setMode: updateMode, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
