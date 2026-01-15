---
name: zustand
description: Guía experta para state management con Zustand 5 en React Native.
---

# 🐻 Zustand Skill

Utiliza esta skill cuando necesites trabajar con estado global, stores o persistencia de datos.

## 🎯 Cuándo usar esta skill

- Al crear nuevos stores (carrito, usuario, productos)
- Al implementar persistencia con AsyncStorage
- Al escribir acciones asíncronas (fetch a Supabase)
- Al optimizar re-renders con selectors
- Al testing de stores

## 📁 Estructura de Stores

```
src/store/
├── index.ts           # Export barrel
├── useCartStore.ts    # Store del carrito
├── useProductStore.ts # Store de productos
└── useUserStore.ts    # Store del usuario
```

## 🚀 Patrones Esenciales

### 1. Store Básico con Tipos

```tsx
// src/store/useCartStore.ts
import { create } from "zustand";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  // Acciones
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  // Derivados
  get totalItems(): number;
  get totalPrice(): number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  clearCart: () => set({ items: [] }),

  get totalItems() {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },

  get totalPrice() {
    return get().items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  },
}));
```

### 2. Persistencia con AsyncStorage

```tsx
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserState {
  id: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setUser: (user: { id: string; email: string }) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      email: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          id: user.id,
          email: user.email,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          id: null,
          email: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 3. Acciones Asíncronas (Supabase)

```tsx
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }

    set({ products: data ?? [], loading: false });
  },
}));
```

### 4. Selectors Optimizados

```tsx
// ❌ Mal: re-render en cualquier cambio del store
const { items, addItem } = useCartStore();

// ✅ Bien: solo re-render cuando items cambia
const items = useCartStore((state) => state.items);
const addItem = useCartStore((state) => state.addItem);

// ✅ Selector derivado
const totalPrice = useCartStore((state) =>
  state.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
);
```

### 5. Export Barrel

```tsx
// src/store/index.ts
export { useCartStore } from "./useCartStore";
export { useProductStore } from "./useProductStore";
export { useUserStore } from "./useUserStore";
```

## ⚠️ Errores Comunes

| Error                | Solución                                                          |
| -------------------- | ----------------------------------------------------------------- |
| Estado no persiste   | Verifica que uses `persist` middleware con AsyncStorage           |
| Re-renders excesivos | Usa selectors específicos, no desestructures todo el store        |
| `set` no actualiza   | Recuerda que `set` requiere un objeto parcial o función           |
| Tipos no infieren    | Usa `create<StateType>()()` con doble paréntesis para middlewares |

## 💡 Tips Pro

- Mantén stores pequeños y enfocados (Single Responsibility)
- Usa `get()` dentro de acciones para acceder al estado actual
- Para lógica compleja, considera slices pattern
- Siempre exporta desde `src/store/index.ts` para imports limpios
- Evita colocar lógica de UI en el store
