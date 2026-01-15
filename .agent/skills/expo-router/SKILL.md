---
name: expo-router
description: Guía experta para navegación con Expo Router v6 en aplicaciones Expo/React Native.
---

# 🧭 Expo Router Skill

Utiliza esta skill cuando necesites trabajar con navegación, rutas, layouts o deep linking.

## 🎯 Cuándo usar esta skill

- Al crear nuevas pantallas o rutas
- Al configurar layouts (tabs, stacks, drawers)
- Al implementar navegación programática
- Al trabajar con deep links o linking universal
- Al proteger rutas con autenticación

## 📁 Estructura de Rutas

```
app/
├── _layout.tsx           # Layout raíz (Stack principal)
├── (tabs)/               # Grupo: navegación con tabs
│   ├── _layout.tsx       # Configuración de tabs
│   ├── index.tsx         # Tab: Home
│   ├── cart.tsx          # Tab: Carrito
│   └── profile.tsx       # Tab: Perfil
├── (auth)/               # Grupo: flujo de autenticación
│   ├── _layout.tsx       # Layout sin tabs
│   ├── login.tsx
│   └── register.tsx
├── product/
│   └── [id].tsx          # Ruta dinámica: /product/123
└── +not-found.tsx        # Fallback 404
```

## 🚀 Patrones Esenciales

### 1. Layout con Tabs

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 2. Navegación Programática

```tsx
import { useRouter } from "expo-router";

function ProductCard({ id }: { id: string }) {
  const router = useRouter();

  const handlePress = () => {
    // Push a nueva ruta
    router.push(`/product/${id}`);

    // Reemplazar (sin back)
    // router.replace('/home');

    // Volver atrás
    // router.back();
  };

  return <Pressable onPress={handlePress}>...</Pressable>;
}
```

### 3. Rutas Dinámicas

```tsx
// app/product/[id].tsx
import { useLocalSearchParams } from "expo-router";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <Text>Producto: {id}</Text>;
}
```

### 4. Protección de Rutas (Auth Guard)

```tsx
// app/_layout.tsx
import { Redirect, Slot } from "expo-router";
import { useUserStore } from "@/store";

export default function RootLayout() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Slot />;
}
```

### 5. Link Declarativo

```tsx
import { Link } from "expo-router";

function Navigation() {
  return (
    <Link href="/product/123" asChild>
      <Pressable>
        <Text>Ver producto</Text>
      </Pressable>
    </Link>
  );
}
```

## ⚠️ Errores Comunes

| Error                      | Solución                                                          |
| -------------------------- | ----------------------------------------------------------------- |
| "Too many screens defined" | Verifica que no exportes más de un componente por archivo de ruta |
| Ruta no encontrada         | Asegúrate de que el archivo esté en `app/` con extensión `.tsx`   |
| Tabs no aparecen           | Verifica que el grupo tenga `()` y un `_layout.tsx` con `<Tabs>`  |
| Params undefined           | Usa `useLocalSearchParams` con tipado explícito                   |

## 💡 Tips Pro

- Usa grupos con `()` para organizar rutas sin afectar la URL
- Prefiere `router.push()` sobre `router.replace()` para mantener historial
- Usa `Redirect` en layouts para auth guards, no en cada pantalla
- Para modals, considera `presentation: 'modal'` en las screen options
