---
name: supabase-workflow
description: Guía experta para integrar, gestionar y migrar Supabase en el proyecto.
---

# ⚡ Supabase Skill

Utiliza esta skill cuando necesites realizar operaciones de backend, base de datos, autenticación o storage con Supabase.

## 🎯 Cuándo usar esta skill

- Al configurar el cliente de Supabase (`lib/supabase.ts`).
- Al diseñar o modificar el esquema de base de datos (Tablas, Enums, Relaciones).
- Al escribir Migraciones SQL.
- Al generar tipos de TypeScript a partir del esquema (`database.types.ts`).
- Al implementar Row Level Security (RLS).

## 🚀 Flujo de Trabajo

### 1. Inicialización & Configuración

- Usa `src/lib/supabase.ts` para instanciar el cliente.
- Asegúrate de que las variables de entorno (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) estén configuradas.

### 2. Base de Datos & Migraciones

- **NO** crees tablas manualmente en el dashboard si puedes evitarlo. Prefiere migraciones documentadas.
- Convención de nombres:
  - Tablas: `snake_case` y plural (ej: `users`, `product_variants`).
  - Columnas: `snake_case` (ej: `created_at`, `is_active`).
  - Claves foráneas: `recurso_id` (ej: `user_id`, `order_id`).

### 3. TypeScript & Supabase

- Genera tipos automáticos:
  ```bash
  supabase gen types typescript --project-id <tu-project-id> > src/types/supabase.ts
  ```
- Usa los tipos generados en tus queries:
  ```typescript
  const { data, error } = await supabase.from("products").select("*");
  // data será inferido correctamente
  ```

### 4. Seguridad (RLS)

- **SIEMPRE** habilita RLS en cada tabla nueva:
  ```sql
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  ```
- Crea políticas específicas (SELECT público, INSERT/UPDATE solo admin o dueño).

### 5. Storage

- Estructura buckets lógicos: `avatars`, `products`, `ar-assets`.
- Usa nombres de archivo únicos (UUIDs) para evitar colisiones.

## 💡 Tips Pro

- Usa `upsert` para manejar creación/edición en una sola operación.
- Para búsquedas complejas, considera crear índices o usar `textSearch`.
- Si la lógica es pesada, muévela a una **Edge Function** o un **Database Trigger**, no satures el cliente móvil.
