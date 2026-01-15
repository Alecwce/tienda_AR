---
description: Guía experta para implementar Expo SQLite con estrategia offline-first
version: 1.0.0
tags: [database, sqlite, expo, offline, sync]
---

# Expo SQLite Skill

Guía completa para implementar una base de datos SQLite local con sincronización desde Supabase para estrategia offline-first.

## 📚 Contexto

**Expo SQLite** permite tener una base de datos relacional completa en el dispositivo:

- ✅ **Offline-first**: Funciona sin internet
- ✅ **SQL completo**: JOINs, índices, triggers, etc.
- ✅ **Rápido**: Queries locales ultra-rápidas
- ✅ **Persistente**: Los datos sobreviven al cerrar la app
- ✅ **Sincronización**: Se puede sincronizar con backend (Supabase)

## 🚀 Instalación

```bash
expo install expo-sqlite
```

## 🏗️ Estructura Recomendada

### 1. Crear servicio de base de datos: `src/lib/database.ts`

```typescript
import * as SQLite from "expo-sqlite";

/**
 * Abrir/crear base de datos
 */
export const db = SQLite.openDatabaseSync("tienda_ar.db");

/**
 * Inicializar esquema
 */
export async function initDatabase() {
  try {
    // Crear tablas
    await db.execAsync(`
      -- Productos
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT,
        price REAL NOT NULL,
        category TEXT,
        subcategory TEXT,
        images TEXT, -- JSON array
        description TEXT,
        stock INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME,
        is_deleted BOOLEAN DEFAULT 0
      );

      -- Índices para búsquedas rápidas
      CREATE INDEX IF NOT EXISTS idx_products_category 
        ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_featured 
        ON products(featured) WHERE featured = 1;
      CREATE INDEX IF NOT EXISTS idx_products_name 
        ON products(name);

      -- Favoritos del usuario
      CREATE TABLE IF NOT EXISTS favorites (
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      -- Historial de búsquedas
      CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        results_count INTEGER DEFAULT 0
      );

      -- Mediciones corporales
      CREATE TABLE IF NOT EXISTS measurements (
        user_id TEXT PRIMARY KEY,
        chest REAL,
        waist REAL,
        hips REAL,
        height REAL,
        measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        confidence_score REAL
      );

      -- Metadata de sincronización
      CREATE TABLE IF NOT EXISTS sync_metadata (
        table_name TEXT PRIMARY KEY,
        last_sync DATETIME,
        total_records INTEGER DEFAULT 0
      );
    `);

    console.log("✅ Database initialized");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}
```

### 2. Crear hooks para acceso a datos: `src/hooks/useOfflineProducts.ts`

```typescript
import { useEffect, useState } from "react";
import { db } from "@/src/lib/database";
import type { Product } from "@/src/types";
import { useNetworkStatus } from "./useNetworkStatus";
import { syncProductsFromSupabase } from "@/src/services/productSync";

export function useOfflineProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    loadProducts();

    // Sync en background si hay internet
    if (isOnline) {
      syncProductsFromSupabase().catch(console.error);
    }
  }, [category, isOnline]);

  async function loadProducts() {
    try {
      setLoading(true);

      const query = category
        ? `SELECT * FROM products WHERE category = ? AND is_deleted = 0 ORDER BY name`
        : `SELECT * FROM products WHERE is_deleted = 0 ORDER BY name`;

      const params = category ? [category] : [];
      const result = await db.getAllAsync<Product>(query, params);

      // Parse JSON fields
      const parsed = result.map((p) => ({
        ...p,
        images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
      }));

      setProducts(parsed);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, refresh: loadProducts };
}
```

### 3. Servicio de sincronización: `src/services/productSync.ts`

```typescript
import { db } from "@/src/lib/database";
import { supabase } from "@/src/lib/supabase";
import type { Product } from "@/src/types";

/**
 * Sincronizar productos desde Supabase a SQLite
 */
export async function syncProductsFromSupabase() {
  try {
    // 1. Obtener última sync
    const lastSync = await db.getFirstAsync<{ last_sync: string }>(
      `SELECT last_sync FROM sync_metadata WHERE table_name = 'products'`
    );

    // 2. Fetch productos nuevos/actualizados desde Supabase
    let query = supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false });

    if (lastSync?.last_sync) {
      query = query.gt("updated_at", lastSync.last_sync);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Supabase sync error:", error);
      return;
    }

    if (!products || products.length === 0) {
      console.log("✅ Already up to date");
      return;
    }

    // 3. Upsert en SQLite
    const statement = await db.prepareAsync(`
      INSERT OR REPLACE INTO products (
        id, name, brand, price, category, subcategory,
        images, description, stock, featured, 
        created_at, updated_at, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    for (const product of products) {
      await statement.executeAsync([
        product.id,
        product.name,
        product.brand,
        product.price,
        product.category,
        product.subcategory,
        JSON.stringify(product.images),
        product.description,
        product.stock,
        product.featured ? 1 : 0,
        product.created_at,
        product.updated_at,
      ]);
    }

    await statement.finalizeAsync();

    // 4. Actualizar metadata
    await db.runAsync(
      `INSERT OR REPLACE INTO sync_metadata (table_name, last_sync, total_records)
       VALUES ('products', CURRENT_TIMESTAMP, 
         (SELECT COUNT(*) FROM products WHERE is_deleted = 0))
      `
    );

    console.log(`✅ Synced ${products.length} products`);
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}
```

### 4. Hook de búsqueda con FTS (Full-Text Search)

```typescript
// src/hooks/use useSearchProducts.ts

import { useState, useEffect } from "react";
import { db } from "@/src/lib/database";
import type { Product } from "@/src/types";

export function useSearchProducts(query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    searchProducts(query);
  }, [query]);

  async function searchProducts(searchQuery: string) {
    try {
      setLoading(true);

      // SQL con LIKE para búsqueda simple
      const sql = `
        SELECT * FROM products 
        WHERE (
          name LIKE ? OR 
          brand LIKE ? OR 
          description LIKE ? OR
          category LIKE ?
        )
        AND is_deleted = 0
        LIMIT 50
      `;

      const pattern = `%${searchQuery}%`;
      const products = await db.getAllAsync<Product>(sql, [
        pattern,
        pattern,
        pattern,
        pattern,
      ]);

      // Parse JSON
      const parsed = products.map((p) => ({
        ...p,
        images: typeof p.images === "string" ? JSON.parse(p.images) : p.images,
      }));

      setResults(parsed);

      // Guardar en historial
      await db.runAsync(
        `INSERT INTO search_history (query, results_count) VALUES (?, ?)`,
        [searchQuery, parsed.length]
      );
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }

  return { results, loading };
}
```

## 🎯 Casos de Uso Avanzados

### Paginación

```typescript
export function useProductsPaginated(pageSize = 20) {
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);

  async function loadMore() {
    const offset = page * pageSize;

    const result = await db.getAllAsync<Product>(
      `SELECT * FROM products 
       WHERE is_deleted = 0 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    setProducts((prev) => [...prev, ...result]);
    setHasMore(result.length === pageSize);
    setPage((p) => p + 1);
  }

  return { products, loadMore, hasMore };
}
```

### Transacciones

```typescript
async function addToFavoritesAndUpdateStats(userId: string, productId: string) {
  await db.withTransactionAsync(async () => {
    // 1. Añadir a favoritos
    await db.runAsync(
      `INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)`,
      [userId, productId]
    );

    // 2. Actualizar stats (ejemplo)
    await db.runAsync(
      `UPDATE products SET view_count = view_count + 1 WHERE id = ?`,
      [productId]
    );
  });
}
```

### Migrations

```typescript
// src/lib/migrations.ts

export const migrations = [
  {
    version: 1,
    up: async (db: SQLite.SQLiteDatabase) => {
      await db.execAsync(`
        CREATE TABLE products (...);
        CREATE TABLE favorites (...);
      `);
    },
  },
  {
    version: 2,
    up: async (db: SQLite.SQLiteDatabase) => {
      await db.execAsync(`
        ALTER TABLE products ADD COLUMN discount_price REAL;
        CREATE INDEX idx_products_discount ON products(discount_price);
      `);
    },
  },
];

export async function runMigrations() {
  const currentVersion = await db.getFirstAsync<{ version: number }>(
    `PRAGMA user_version`
  );

  for (const migration of migrations) {
    if (migration.version > (currentVersion?.version || 0)) {
      await migration.up(db);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
      console.log(`✅ Migration ${migration.version} applied`);
    }
  }
}
```

## 📱 Integración con UI

### Screen con datos offline

```typescript
// app/(tabs)/catalog.tsx

import { useOfflineProducts } from "@/src/hooks/useOfflineProducts";
import { ActivityIndicator, FlatList } from "react-native";

export default function CatalogScreen() {
  const { products, loading, refresh } = useOfflineProducts();

  if (loading && products.length === 0) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
      refreshing={loading}
      onRefresh={refresh}
    />
  );
}
```

## ⚠️ Consideraciones

### Performance

- **Índices**: Crea índices en columnas que usas en WHERE/ORDER BY
- **LIMIT**: Siempre usa LIMIT en queries que pueden devolver muchos rows
- **Prepared Statements**: Usa `prepareAsync()` para queries repetitivas
- **Transacciones**: Agrupa múltiples INSERTs en una transacción

### Sincronización

- **Incremental Sync**: Solo sincroniza cambios desde última sync
- **Conflict Resolution**: Define estrategia (server wins, client wins, manual)
- **Background Sync**: Usa `expo-background-fetch` para sync periódico
- **Delta Sync**: Envía solo cambios locales al servidor

### Debug

```typescript
// Log de queries (solo DEV)
if (__DEV__) {
  db.execAsync = new Proxy(db.execAsync, {
    apply(target, thisArg, args) {
      console.log("[SQL]", args[0]);
      return Reflect.apply(target, thisArg, args);
    },
  });
}
```

## 📋 Checklist de Implementación

- [ ] Instalar `expo-sqlite`
- [ ] Crear `src/lib/database.ts` con schema
- [ ] Implementar `initDatabase()` en app startup
- [ ] Crear hooks de acceso a datos (`useOfflineProducts`, etc.)
- [ ] Implementar servicio de sincronización
- [ ] Agregar índices para queries frecuentes
- [ ] Implementar sistema de migrations
- [ ] Manejar errores de database
- [ ] Testear offline/online transitions
- [ ] Implementar background sync (opcional)

## 🔗 Referencias

- [Expo SQLite Docs](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQL Syntax Reference](https://www.sqlite.org/lang.html)
- [Best Practices](https://www.sqlite.org/bestpractise.html)
