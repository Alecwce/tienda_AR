---
description: Guía experta para migración y uso de MMKV como storage ultra-rápido en React Native
version: 1.0.0
tags: [storage, mmkv, performance, zustand]
---

# MMKV Storage Skill

Guía completa para migrar de AsyncStorage a MMKV (react-native-mmkv) para storage ultra-rápido y sincrónico en React Native.

## 📚 Contexto

**MMKV** es una librería de storage key-value desarrollada por Marc Rousavy que ofrece:

- ✅ **30x más rápido** que AsyncStorage
- ✅ **Sincrónico** (no necesitas `await`)
- ✅ **Cifrado nativo** opcional
- ✅ **Type-safe** con TypeScript
- ✅ **Multi-instancia** (puedes tener varios almacenes separados)

## 🚀 Instalación

```bash
bun add react-native-mmkv
```

No requiere configuración adicional de pods o gradle.

## 🏗️ Estructura Recomendada

### 1. Crear archivo de configuración: `src/lib/mmkv.ts`

```typescript
import { MMKV } from "react-native-mmkv";

/**
 * Storage principal para datos generales
 */
export const storage = new MMKV({
  id: "app-storage",
});

/**
 * Storage cifrado para datos sensibles
 */
export const secureStorage = new MMKV({
  id: "app-secure",
  encryptionKey: "your-encryption-key", // En prod: usar SecureStore
});

/**
 * Adapter para Zustand persist
 */
export const zustandStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};

/**
 * Adapter para Supabase (async para compatibilidad)
 */
export const supabaseStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return secureStorage.getString(key) ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    secureStorage.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    secureStorage.delete(key);
  },
};
```

### 2. Migrar Zustand Stores

**Antes (AsyncStorage):**

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set) => ({
      /* ... */
    }),
    {
      name: "my-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Después (MMKV):**

```typescript
import { zustandStorage } from "@/src/lib/mmkv";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    (set) => ({
      /* ... */
    }),
    {
      name: "my-store",
      storage: zustandStorage,
    }
  )
);
```

### 3. Migrar Supabase Client

```typescript
import { createClient } from "@supabase/supabase-js";
import { supabaseStorage } from "./mmkv";

export const supabase = createClient(url, key, {
  auth: {
    storage: supabaseStorage, // ← Usa MMKV cifrado
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

## 🎯 Casos de Uso

### Storage de Preferencias (Sincrónico)

```typescript
import { storage } from "@/src/lib/mmkv";

// Guardar
storage.set("theme", "dark");
storage.set("fontSize", 16);
storage.set("notificationsEnabled", true);

// Leer
const theme = storage.getString("theme"); // 'dark' | null
const fontSize = storage.getNumber("fontSize"); // 16 | undefined
const enabled = storage.getBoolean("notificationsEnabled"); // true | false

// Eliminar
storage.delete("theme");

// Verificar existencia
if (storage.contains("theme")) {
  // ...
}
```

### Listeners (React Hooks)

```typescript
import { useMMKVString } from "react-native-mmkv";

function MyComponent() {
  const [theme, setTheme] = useMMKVString("theme");

  return <Button onPress={() => setTheme("dark")}>Current: {theme}</Button>;
}
```

### Migración de Datos Existentes

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "./mmkv";

async function migrateFromAsyncStorage() {
  try {
    const keys = await AsyncStorage.getAllKeys();

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        storage.set(key, value);
      }
    }

    // Opcional: limpiar AsyncStorage
    // await AsyncStorage.clear();

    console.log(`✅ Migrated ${keys.length} keys to MMKV`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}
```

## 🧪 Testing con MMKV

### Setup de Tests (Vitest)

Crear `__tests__/setup.ts`:

```typescript
import { vi } from "vitest";

const { MockMMKV } = vi.hoisted(() => {
  class MockMMKV {
    private storage = new Map<string, string>();

    set(key: string, value: string | number | boolean) {
      this.storage.set(key, String(value));
    }

    getString(key: string) {
      return this.storage.get(key) ?? null;
    }

    getNumber(key: string) {
      const value = this.storage.get(key);
      return value ? Number(value) : undefined;
    }

    getBoolean(key: string) {
      return this.storage.get(key) === "true";
    }

    delete(key: string) {
      this.storage.delete(key);
    }

    getAllKeys() {
      return Array.from(this.storage.keys());
    }

    clearAll() {
      this.storage.clear();
    }

    contains(key: string) {
      return this.storage.has(key);
    }
  }

  return { MockMMKV };
});

vi.mock("react-native-mmkv", () => ({
  MMKV: MockMMKV,
}));
```

## ⚠️ Consideraciones

### Seguridad

- **Encryption Key**: En producción, no hardcodees la clave. Usa `expo-secure-store` o KeyChain.
- **Datos Sensibles**: Siempre usa `secureStorage` para tokens, passwords, etc.

```typescript
import * as SecureStore from "expo-secure-store";

// Generar/Obtener encryption key
async function getEncryptionKey(): Promise<string> {
  let key = await SecureStore.getItemAsync("mmkv-encryption-key");

  if (!key) {
    key = generateRandomKey(); // Tu función de generación
    await SecureStore.setItemAsync("mmkv-encryption-key", key);
  }

  return key;
}

// Usar en MMKV
const encryptionKey = await getEncryptionKey();
export const secureStorage = new MMKV({
  id: "secure",
  encryptionKey,
});
```

### Límites de Tamaño

- **Óptimo**: < 1MB por key
- **Máximo**: ~16MB (varía por dispositivo)
- **Para archivos grandes**: Usa el filesystem (`expo-file-system`)

### Debug y Utilidades

```typescript
export const mmkvUtils = {
  // Ver todas las keys
  getAllKeys: () => storage.getAllKeys(),

  // Tamaño aproximado
  getSize: () => {
    const keys = storage.getAllKeys();
    let size = 0;
    keys.forEach((key) => {
      const value = storage.getString(key);
      if (value) size += value.length;
    });
    return size;
  },

  // Export para backup
  exportAll: () => {
    const data: Record<string, any> = {};
    storage.getAllKeys().forEach((key) => {
      data[key] = storage.getString(key);
    });
    return JSON.stringify(data);
  },

  // Log en DEV
  logAll: () => {
    if (__DEV__) {
      console.log("📦 MMKV Contents:");
      storage.getAllKeys().forEach((key) => {
        console.log(`  ${key}:`, storage.getString(key));
      });
    }
  },
};
```

## 📋 Checklist de Migración

- [ ] Instalar `react-native-mmkv`
- [ ] Crear `src/lib/mmkv.ts` con configuración
- [ ] Migrar stores de Zustand
- [ ] Migrar Supabase client
- [ ] Actualizar tests con mock
- [ ] Migrar datos existentes de AsyncStorage
- [ ] Remover dependencia `@react-native-async-storage/async-storage` (si ya no se usa)
- [ ] Verificar que todo funcione en iOS y Android

## 🔗 Referencias

- [GitHub - react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- [Documentación Oficial](https://github.com/mrousavy/react-native-mmkv/blob/main/README.md)
- [Benchmarks vs AsyncStorage](https://github.com/mrousavy/react-native-mmkv#benchmark)
