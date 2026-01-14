# 👗 Virtual Vogue - App de Prueba Virtual de Ropa

Aplicación móvil de e-commerce de moda con funcionalidad de prueba virtual mediante realidad aumentada simulada.

![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)

## ✨ Características

- 🛍️ **Catálogo de productos** con búsqueda y filtros avanzados
- 📱 **Prueba virtual AR** con overlays de ropa sobre la cámara
- 🎯 **Recomendaciones de tallas** basadas en medidas corporales
- 🛒 **Carrito de compras** completo con códigos promocionales
- 👤 **Perfil de usuario** con medidas guardadas
- 💖 **Favoritos** y historial de productos
- 🌙 **Diseño dark mode** con glassmorphism

## 📱 Pantallas

| Home          | Catálogo | Probador AR    | Carrito      | Perfil   |
| ------------- | -------- | -------------- | ------------ | -------- |
| Hero gradient | Búsqueda | Camera preview | Swipe delete | Stats    |
| Categorías    | Filtros  | Overlay drag   | Promo codes  | Medidas  |
| Featured      | Grid     | Captura foto   | Checkout     | Settings |

## 🛠️ Stack Tecnológico

- **Framework**: Expo SDK 54 + React Native 0.81
- **Navegación**: Expo Router (file-based routing)
- **Animaciones**: React Native Reanimated 4
- **Estado**: Zustand 5
- **Cámara**: expo-camera
- **UI**: expo-blur, expo-linear-gradient, expo-image
- **Haptics**: expo-haptics

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd tienda_AR

# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun run start
```

## 📲 Ejecución

```bash
# Web
bun run web

# Android (con Expo Go instalado)
bun run android

# iOS (solo macOS)
bun run ios
```

## 🎨 Sistema de Diseño

El proyecto usa un tema dark mode premium con:

- **Colores primarios**: Violet (#7C3AED) y Pink (#EC4899)
- **Fondo**: Negro profundo (#0A0A0A)
- **Efectos**: Glassmorphism con blur
- **Animaciones**: Entering/exiting transitions, spring physics

## 📁 Estructura del Proyecto

```
tienda_AR/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab screens
│   ├── product/[id].tsx   # Dynamic product detail
│   └── calibration.tsx    # Body measurements
├── src/
│   ├── components/ui/     # Animated UI components
│   ├── store/             # Zustand stores
│   ├── theme/             # Design tokens
│   ├── types/             # TypeScript interfaces
│   └── data/              # Mock products
└── assets/                # Images, fonts
```

## 🔐 Códigos Promocionales (Demo)

| Código    | Descuento |
| --------- | --------- |
| VIRTUAL10 | 10%       |
| VOGUE20   | 20%       |
| FIRSTBUY  | 15%       |
| ARMAGIC   | 25%       |

## 🗄️ Backend (Próximamente)

El proyecto está preparado para integrar **Supabase** como backend:

- PostgreSQL para productos y usuarios
- Auth con email y OAuth
- Storage para imágenes de productos
- Real-time para carrito sincronizado

## 📄 Licencia

MIT License
