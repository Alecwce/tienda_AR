---
name: react-native-theme
description: Guía experta para sistema de temas, dark mode y tokens de diseño en React Native.
---

# 🎨 React Native Theme Skill

Utiliza esta skill cuando necesites trabajar con colores, tipografía, espaciado o dark mode.

## 🎯 Cuándo usar esta skill

- Al crear o modificar componentes con estilos
- Al implementar dark/light mode
- Al definir nuevos tokens de color o tipografía
- Al mantener consistencia visual con el estilo "Vogue Editorial"

## 📁 Estructura de Temas

```
src/theme/
├── index.ts           # Tokens (colors, fonts, spacing)
└── ThemeContext.tsx   # Provider y hook useTheme
```

## 🚀 Patrones Esenciales

### 1. ThemeContext y Provider

```tsx
// src/theme/ThemeContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#1A1A1A",
  textSecondary: "#666666",
  primary: "#000000",
  accent: "#8B7355",
  border: "#E5E5E5",
  error: "#DC2626",
};

const darkColors: typeof lightColors = {
  background: "#0A0A0A",
  surface: "#1A1A1A",
  text: "#FFFFFF",
  textSecondary: "#A0A0A0",
  primary: "#FFFFFF",
  accent: "#C4A77D",
  border: "#333333",
  error: "#EF4444",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors = mode === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

### 2. Tokens de Diseño

```tsx
// src/theme/index.ts
export const theme = {
  colors: {
    // Neutrals
    black: "#000000",
    white: "#FFFFFF",
    gray: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#E5E5E5",
      300: "#D4D4D4",
      400: "#A3A3A3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
    },
    // Brand
    accent: "#8B7355",
    accentLight: "#C4A77D",
  },

  fonts: {
    regular: "System",
    medium: "System",
    bold: "System",
    // Para custom fonts:
    // serif: 'PlayfairDisplay-Regular',
    // serifBold: 'PlayfairDisplay-Bold',
  },

  fontSizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
  },

  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};

export type Theme = typeof theme;
```

### 3. Uso en Componentes

```tsx
// src/components/ui/Button.tsx
import { Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { theme } from "@/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ title, onPress, variant = "primary" }: ButtonProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    button: {
      backgroundColor: variant === "primary" ? colors.primary : "transparent",
      borderWidth: variant === "secondary" ? 1 : 0,
      borderColor: colors.border,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
    },
    text: {
      color: variant === "primary" ? colors.background : colors.text,
      fontSize: theme.fontSizes.md,
      fontWeight: "600",
      textAlign: "center",
    },
  });

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}
```

### 4. Estilos Dinámicos con createStyles

```tsx
import { StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { useMemo } from "react";

// Pattern para estilos que dependen del tema
function useStyles() {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: colors.background,
          flex: 1,
        },
        title: {
          color: colors.text,
        },
      }),
    [colors]
  );
}
```

## 🎯 Estilo "Vogue Editorial"

Este proyecto sigue una estética minimalista y elegante:

| Elemento    | Guideline                                            |
| ----------- | ---------------------------------------------------- |
| Colores     | Paleta neutra: negro, blanco, grises, toques dorados |
| Tipografía  | Sans-serif limpia, headlines grandes, body legible   |
| Espaciado   | Generoso, aire alrededor de elementos                |
| Imágenes    | Full-bleed, alta calidad, estilo editorial           |
| Animaciones | Sutiles, elegantes, sin ser distractoras             |

## ⚠️ Errores Comunes

| Error                 | Solución                                                  |
| --------------------- | --------------------------------------------------------- |
| Colores hardcodeados  | SIEMPRE usa `useTheme()` o tokens del tema                |
| `#FFF` en el código   | Reemplaza por `colors.background` o `theme.colors.white`  |
| Estilos inline        | Usa `StyleSheet.create` para performance                  |
| Dark mode no funciona | Verifica que el componente esté dentro de `ThemeProvider` |

## 💡 Tips Pro

- Nunca uses hex codes directamente, siempre tokens
- Usa `theme.spacing` para consistencia en paddings/margins
- Para animaciones de tema, considera `Reanimated` para transiciones suaves
- Mantén el número de colores del tema mínimo para coherencia visual
- Testea siempre en ambos modos (light/dark)
