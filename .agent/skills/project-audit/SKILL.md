---
name: project-audit
description: Guía experta para auditar y mejorar el proyecto en seguridad, calidad, UI/UX, performance y buenas prácticas.
---

# 🔍 Project Audit Skill

Utiliza esta skill para analizar y mejorar el proyecto de manera integral.

## 🎯 Cuándo usar esta skill

- Al comenzar una nueva feature importante
- Antes de un release o deploy
- Cuando el código se siente "sucio" o hay tech debt
- Para revisiones periódicas de calidad
- Al onboardear un nuevo dev al proyecto

---

## 🛡️ 1. Seguridad

### Checklist Crítico

- [ ] **Variables de entorno**: Nunca exponer `service_role` keys en el frontend
- [ ] **RLS habilitado**: Cada tabla nueva DEBE tener Row Level Security
- [ ] **Validación de inputs**: Usar Zod para TODO input de usuario
- [ ] **Sanitización**: No confiar en datos del cliente
- [ ] **Auth tokens**: Almacenar solo en SecureStore, no AsyncStorage para datos sensibles

### Comandos de Auditoría

```bash
# Buscar posibles leaks de secrets
grep -r "supabase" --include="*.ts" --include="*.tsx" | grep -v ".env"

# Verificar que no hay API keys hardcodeadas
grep -rE "(sk_|pk_|key_|secret)" --include="*.ts" --include="*.tsx"
```

### Política RLS Template

```sql
-- Ejemplo: Solo el dueño puede ver sus datos
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Ejemplo: Solo admins pueden insertar
CREATE POLICY "Admins can insert" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## ✅ 2. Calidad de Código

### TypeScript Strict

```json
// tsconfig.json recomendado
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Anti-Patterns a Evitar

| ❌ Mal                  | ✅ Bien                         |
| ----------------------- | ------------------------------- |
| `any`                   | Tipos explícitos o `unknown`    |
| `// @ts-ignore`         | Arreglar el tipo real           |
| `console.log` (en prod) | Logger estructurado o eliminar  |
| `useEffect` para fetch  | Server Actions / TanStack Query |
| Código comentado        | Eliminarlo (Git lo guarda)      |
| Magic numbers           | Constantes nombradas            |

### Estructura de Componentes

```tsx
// ✅ Estructura recomendada
import { View, Text } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import type { ProductProps } from "@/types";

interface Props {
  product: ProductProps;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: Props) {
  const { colors } = useTheme();

  // 1. Hooks primero
  // 2. Handlers
  // 3. Derived state
  // 4. Return JSX

  return (
    <View style={{ backgroundColor: colors.surface }}>
      <Text>{product.name}</Text>
    </View>
  );
}
```

---

## 🎨 3. UI/UX

### Accesibilidad (a11y)

```tsx
// ✅ Siempre incluir labels de accesibilidad
<Pressable
  onPress={handlePress}
  accessibilityLabel="Agregar al carrito"
  accessibilityRole="button"
  accessibilityHint="Añade este producto a tu carrito de compras"
>
  <Text>Agregar</Text>
</Pressable>

// ✅ Imágenes con alt text
<Image
  source={{ uri: product.image }}
  accessibilityLabel={product.name}
/>
```

### Checklist UI/UX

- [ ] **Touch targets**: Mínimo 44x44 puntos para elementos tocables
- [ ] **Feedback visual**: Estados hover/pressed en todos los botones
- [ ] **Loading states**: Skeletons o spinners durante cargas
- [ ] **Empty states**: Mensajes claros cuando no hay datos
- [ ] **Error states**: Feedback visual y opciones de retry
- [ ] **Dark mode**: Testear ambos modos
- [ ] **Safe areas**: Respetar notch y home indicator

### Consistencia Visual

```tsx
// ❌ Mal: hardcodear valores
<View style={{ padding: 16, borderRadius: 8 }}>

// ✅ Bien: usar tokens del tema
import { theme } from '@/theme';
<View style={{ padding: theme.spacing.md, borderRadius: theme.borderRadius.md }}>
```

---

## ⚡ 4. Performance

### Optimizaciones React Native

```tsx
// ✅ Memoizar callbacks costosos
const handlePress = useCallback(() => {
  // lógica
}, [dependency]);

// ✅ FlatList con keyExtractor y getItemLayout
<FlatList
  data={products}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  renderItem={renderItem}
/>;

// ✅ Usar expo-image en lugar de Image
import { Image } from "expo-image";
<Image
  source={{ uri: product.image }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>;
```

### Checklist Performance

- [ ] **Images**: Usar `expo-image` con cache
- [ ] **Lists**: FlatList con `keyExtractor` y `getItemLayout`
- [ ] **Animations**: Reanimated en lugar de Animated
- [ ] **Bundle size**: Verificar imports innecesarios
- [ ] **Re-renders**: Usar React DevTools Profiler
- [ ] **Zustand selectors**: Selectors específicos, no destructurar todo

---

## 📝 5. Git & Commits (Español)

### Conventional Commits en Español

```
<tipo>[alcance opcional]: <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commit

| Tipo       | Uso                                       |
| ---------- | ----------------------------------------- |
| `feat`     | Nueva funcionalidad                       |
| `fix`      | Corrección de bug                         |
| `docs`     | Solo documentación                        |
| `style`    | Formato (no afecta lógica)                |
| `refactor` | Refactorización sin cambiar funcionalidad |
| `perf`     | Mejora de performance                     |
| `test`     | Añadir o corregir tests                   |
| `chore`    | Mantenimiento (deps, config)              |

### Ejemplos

```bash
# ✅ Buenos commits en español
git commit -m "feat(carrito): agregar funcionalidad para eliminar items"
git commit -m "fix(auth): corregir validación de email vacío"
git commit -m "refactor(store): simplificar lógica del useCartStore"
git commit -m "docs: actualizar README con instrucciones de setup"
git commit -m "chore: actualizar dependencias de Expo"

# ❌ Malos commits
git commit -m "fix"
git commit -m "cambios"
git commit -m "wip"
```

### Template de Commit

```bash
# Configurar template global
git config --global commit.template ~/.gitmessage

# ~/.gitmessage
# <tipo>(<alcance>): <descripción corta en imperativo>
#
# [Explicación más detallada si es necesario]
#
# - Por qué se hizo este cambio
# - Qué problema resuelve
# - Efectos secundarios conocidos
#
# Closes #<número de issue>
```

---

## 🧪 6. Testing

### Estructura de Tests

```
__tests__/
├── components/
│   └── ProductCard.test.tsx
├── store/
│   └── useCartStore.test.ts
└── utils/
    └── formatPrice.test.ts
```

### Test Básico con Vitest

```tsx
// __tests__/store/useCartStore.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/store/useCartStore";

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("should add item to cart", () => {
    const { addItem } = useCartStore.getState();
    addItem({ id: "1", name: "Test", price: 100, quantity: 1 });

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("Test");
  });

  it("should increment quantity for existing item", () => {
    const { addItem } = useCartStore.getState();
    addItem({ id: "1", name: "Test", price: 100, quantity: 1 });
    addItem({ id: "1", name: "Test", price: 100, quantity: 1 });

    const { items } = useCartStore.getState();
    expect(items[0].quantity).toBe(2);
  });
});
```

---

## 📋 7. Checklist de Auditoría Completa

### Pre-Release

```markdown
## 🔒 Seguridad

- [ ] RLS habilitado en todas las tablas
- [ ] No hay secrets en el código
- [ ] Inputs validados con Zod

## 🧹 Calidad

- [ ] TypeScript compila sin errores
- [ ] No hay `any` implícitos
- [ ] No hay console.log en producción
- [ ] Código comentado eliminado

## 🎨 UI/UX

- [ ] Accesibilidad en elementos interactivos
- [ ] Estados de loading implementados
- [ ] Estados de error implementados
- [ ] Dark mode funcional
- [ ] Safe areas respetadas

## ⚡ Performance

- [ ] Imágenes con expo-image
- [ ] FlatLists optimizadas
- [ ] Sin re-renders innecesarios

## 📝 Git

- [ ] Commits siguen conventional commits
- [ ] Branch names descriptivos
- [ ] PR description completa
```

---

## 💡 Tips Pro

1. **Automatiza**: Configura husky + lint-staged para checks pre-commit
2. **CI/CD**: GitHub Actions para correr tests y linting
3. **Code Review**: Siempre pedir review antes de merge
4. **Documentación**: Mantener README y AGENTS.md actualizados
5. **Retrospectiva**: Revisar tech debt cada sprint
