# 📦 Repository Guidelines - Tienda AR (Virtual Vogue)

## Cómo Usar Esta Guía

- Empieza aquí para normas generales del proyecto.
- Cada skill tiene un archivo `SKILL.md` con patrones detallados.
- Las guías de skill tienen prioridad cuando hay conflicto con esta documentación.

---

## Project Overview

Tienda AR es una aplicación de e-commerce con realidad aumentada para probarse ropa virtualmente. Estilo "Vogue Editorial".

| Componente | Ubicación         | Tech Stack                          |
| ---------- | ----------------- | ----------------------------------- |
| Frontend   | `app/`, `src/`    | Expo 54, React Native, TypeScript   |
| Navegación | `app/`            | Expo Router v6                      |
| Estado     | `src/store/`      | Zustand 5                           |
| Backend    | `supabase/`       | Supabase (Auth, Postgres, Storage)  |
| UI         | `src/components/` | React Native, Reanimated 3          |
| Tema       | `src/theme/`      | ThemeContext, tokens personalizados |

---

## 🛠 Skills Disponibles

| Skill                | Descripción                                                   | URL                                                   |
| -------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| `supabase-workflow`  | Integrar, gestionar y migrar Supabase                         | [SKILL.md](.agent/skills/supabase-workflow/SKILL.md)  |
| `expo-router`        | Navegación con Expo Router v6 (tabs, stacks, modals)          | [SKILL.md](.agent/skills/expo-router/SKILL.md)        |
| `zustand`            | State management con Zustand 5 y persist middleware           | [SKILL.md](.agent/skills/zustand/SKILL.md)            |
| `react-native-theme` | Sistema de temas, dark mode, tokens de diseño                 | [SKILL.md](.agent/skills/react-native-theme/SKILL.md) |
| `project-audit`      | Auditoría de seguridad, calidad, UI/UX, performance y commits | [SKILL.md](.agent/skills/project-audit/SKILL.md)      |

---

## ⚡ Auto-invoke Skills

Cuando realices estas acciones, **SIEMPRE** invoca la skill correspondiente primero:

| Acción                                    | Skill                |
| ----------------------------------------- | -------------------- |
| Crear/modificar rutas o layouts           | `expo-router`        |
| Trabajar con navegación programática      | `expo-router`        |
| Crear/modificar stores de Zustand         | `zustand`            |
| Manejar estado global o carrito           | `zustand`            |
| Modificar colores, tipografía o espaciado | `react-native-theme` |
| Implementar dark/light mode               | `react-native-theme` |
| Configurar Auth, DB o Storage             | `supabase-workflow`  |
| Escribir migraciones SQL                  | `supabase-workflow`  |
| Implementar RLS o políticas               | `supabase-workflow`  |
| Revisar seguridad o calidad de código     | `project-audit`      |
| Preparar release o deploy                 | `project-audit`      |
| Optimizar performance                     | `project-audit`      |
| Mejorar UI/UX o accesibilidad             | `project-audit`      |
| Configurar testing o CI/CD                | `project-audit`      |

---

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun start

# Android
bun run android

# iOS
bun run ios

# Web
bun run web
```

---

## 📁 Estructura del Proyecto

```
tienda_AR/
├── app/                    # Rutas (Expo Router)
│   ├── (auth)/             # Grupo de autenticación
│   ├── (tabs)/             # Navegación principal con tabs
│   ├── product/            # Rutas de productos
│   └── _layout.tsx         # Layout raíz
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/             # Componentes UI base
│   │   └── auth/           # Componentes de autenticación
│   ├── store/              # Zustand stores
│   ├── theme/              # Sistema de temas
│   ├── types/              # TypeScript types
│   ├── lib/                # Utilidades (supabase client)
│   └── data/               # Datos mock
├── supabase/
│   └── migrations/         # Migraciones SQL
└── assets/                 # Recursos estáticos
```

---

## ✅ Checklist Pre-Commit

1. TypeScript compila sin errores
2. No hay `any` implícitos
3. Los componentes usan `useTheme()` para colores
4. Las rutas nuevas tienen su layout correspondiente
5. Los stores tienen tipos explícitos
