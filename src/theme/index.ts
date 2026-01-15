// src/theme/index.ts - Design System Premium "Elite"
import { Platform } from 'react-native';

// Brand Colors
const brand = {
  primary: '#8B5CF6',
  secondary: '#D946EF',
  accent: '#F59E0B',
};

export const darkColors = {
  ...brand,
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  background: '#000000',
  surface: '#0A0A0A',
  surfaceElevated: '#121212',
  
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textDimmed: '#52525B',

  border: '#27272A',
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.12)',

  gradient: {
    primary: ['#8B5CF6', '#D946EF', '#F43F5E'] as const,
    sunset: ['#F59E0B', '#F43F5E', '#D946EF'] as const,
    ocean: ['#3B82F6', '#2DD4BF', '#06B6D4'] as const,
    dark: ['#121212', '#000000'] as const,
    glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)'] as const,
  },
  
  glow: {
    primary: 'rgba(139, 92, 246, 0.5)',
    secondary: 'rgba(217, 70, 239, 0.5)',
    accent: 'rgba(245, 158, 11, 0.5)',
  },
  
  // Specific Auth Theme (User Provided Exact Hexes)
  auth: {
    background: '#101214',      // --color-bg
    surface: '#161A1D',         // --color-surface
    muted: '#1D2125',           // --color-muted-surface
    border: '#2C333A',          // --color-border
    text: '#C7D1DB',            // --color-text-primary
    secondary: '#596773',       // --color-text-secondary
    heading: '#DEE4EA',         // --color-heading
    bg2: '#C7D1DB',             // --color-bg-2
  }
};

export const lightColors = {
  ...brand,
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',

  background: '#FFFFFF',
  surface: '#F8FAFC', // Slate 50
  surfaceElevated: '#FFFFFF',
  
  text: '#09090B', // Zinc 950
  textSecondary: '#52525B', // Zinc 600
  textMuted: '#71717A', // Zinc 500
  textDimmed: '#A1A1AA', // Zinc 400

  border: '#E2E8F0', // Slate 200
  glass: 'rgba(0, 0, 0, 0.03)',
  glassBorder: 'rgba(0, 0, 0, 0.06)',
  glassHighlight: 'rgba(0, 0, 0, 0.08)',

  gradient: {
    primary: ['#8B5CF6', '#D946EF', '#F43F5E'] as const, // Lighter gradient
    sunset: ['#F59E0B', '#F43F5E', '#D946EF'] as const,
    ocean: ['#3B82F6', '#06B6D4', '#2DD4BF'] as const,
    dark: ['#F8FAFC', '#FFFFFF', '#F1F5F9'] as const,
    glass: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'] as const,
  },

  glow: {
    primary: 'rgba(139, 92, 246, 0.2)',
    secondary: 'rgba(217, 70, 239, 0.2)',
    accent: 'rgba(245, 158, 11, 0.2)',
  }
};

export const theme = {
  colors: darkColors, // Default fallback

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    '2xl': 36,
    full: 999,
  },

  typography: {
    fontFamily: {
      regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
      medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
      bold: Platform.select({ ios: 'System', android: 'sans-serif-bold' }),
      mono: Platform.select({ ios: 'Courier', android: 'monospace' }),
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
      '4xl': 40,
      '5xl': 48,
    },
    fontWeight: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      black: '900' as const,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
      widest: 2,
    }
  },

  animation: {
    spring: {
      damping: 15,
      stiffness: 120,
      mass: 1,
    },
    gentle: {
      damping: 20,
      stiffness: 100,
    },
    bouncy: {
      damping: 10,
      stiffness: 150,
    }
  },

  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 8,
    },
    glow: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 15,
      elevation: 10,
    }),
  }
};

export type Theme = typeof theme;
