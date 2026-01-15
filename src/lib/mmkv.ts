// src/lib/mmkv.ts - MMKV storage configuration


/**
 * Storage principal para datos generales de la app
 * (carrito, favoritos, configuración)
 */
export const storage = new MMKV({
  id: 'virtual-vogue-storage',
});

/**
 * Storage cifrado para datos sensibles
 * (tokens, session de Supabase)
 */
export const secureStorage = new MMKV({
  id: 'virtual-vogue-secure',
  // En producción, generar una clave desde SecureStore o KeyChain
  encryptionKey: 'virtual-vogue-encryption-key-2024',
});

/**
 * Adapter para usar MMKV con Zustand persist middleware
 * Compatible con StateStorage interface de Zustand
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
 * Adapter para Supabase session storage (cifrado)
 */
export const supabaseStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const value = secureStorage.getString(key);
    return value ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    secureStorage.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    secureStorage.delete(key);
  },
};

/**
 * Utilidades de debug
 */
export const mmkvUtils = {
  // Listar todas las keys
  getAllKeys: () => storage.getAllKeys(),
  
  // Limpiar todo el storage (útil para logout)
  clearAll: () => storage.clearAll(),
  
  // Ver tamaño del storage en bytes
  getSize: () => {
    const keys = storage.getAllKeys();
    let totalSize = 0;
    keys.forEach((key: string) => {
      const value = storage.getString(key);
      if (value) totalSize += value.length;
    });
    return totalSize;
  },
  
  // Debug: imprimir todo
  logAll: () => {
    if (__DEV__) {
      const keys = storage.getAllKeys();
      console.log('📦 MMKV Storage Contents:');
      keys.forEach((key: string) => {
        console.log(`  ${key}:`, storage.getString(key));
      });
    }
  },
};
