// app/(tabs)/catalog.tsx - Premium Refined Version
import {
    CategoryChip,
    GlassCard,
    ProductCard,
    SearchInput,
} from '@/src/components/ui';
import { useProductStore } from '@/src/store';
import { useTheme } from '@/src/theme/ThemeContext';
// Re-import theme for layout usage
import { theme } from '@/src/theme';
import type { Product, ProductCategory } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 48) / 2;
const ITEM_HEIGHT = COLUMN_WIDTH * 1.35; // Approx height with padding

const CATEGORY_OPTIONS: { id: ProductCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'vestidos', label: 'Vestidos' },
  { id: 'tops', label: 'Tops' },
  { id: 'pantalones', label: 'Pantalones' },
  { id: 'faldas', label: 'Faldas' },
  { id: 'abrigos', label: 'Abrigos' },
  { id: 'accesorios', label: 'Accesorios' },
];

export default function CatalogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const [refreshing, setRefreshing] = useState(false);

  const {
    filteredProducts,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    loadProducts,
  } = useProductStore();
  
  const { colors } = useTheme();
  
  // Memoize styles to avoid recreation on every render
  const styles = useMemo(() => createStyles(colors), [colors]);

  React.useEffect(() => {
    if (params.category) {
      setFilters({ category: params.category as ProductCategory });
    }
  }, [params.category]);

  const selectedCategory = filters.category || 'all';

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [loadProducts]);

  const handleCategorySelect = useCallback((categoryId: ProductCategory | 'all') => {
    if (categoryId === 'all') {
      setFilters({ category: undefined });
    } else {
      setFilters({ category: categoryId });
    }
  }, [setFilters]);

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * Math.floor(index / 2), // 2 columns
      index,
    }),
    []
  );

  const renderProduct = useCallback(({ item, index }: { item: Product; index: number }) => (
    <ProductCard
      product={item}
      index={index}
      onPress={() => router.push(`/product/${item.id}`)}
    />
  ), [router]);

  const ListHeader = useMemo(() => (
    <View style={styles.headerContent}>
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.searchSection}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar marcas, estilos..."
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(600)}>
        <FlatList
          horizontal
          data={CATEGORY_OPTIONS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <CategoryChip
              label={item.label}
              selected={selectedCategory === item.id}
              onPress={() => handleCategorySelect(item.id)}
            />
          )}
        />
      </Animated.View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          <Text style={styles.countBold}>{filteredProducts.length}</Text> resultados
        </Text>
        <Pressable 
          style={styles.filterBtn}
          onPress={() => setFilters({ hasAR: !filters.hasAR })}
        >
          <Ionicons 
            name="options-outline" 
            size={18} 
            color={filters.hasAR ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.filterBtnText, filters.hasAR && styles.filterBtnTextActive]}>
            {filters.hasAR ? 'Solo AR On' : 'Filtros'}
          </Text>
        </Pressable>
      </View>
    </View>
  ), [searchQuery, selectedCategory, filteredProducts.length, filters.hasAR, handleCategorySelect, setSearchQuery, setFilters, styles, colors]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>Catálogo</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        getItemLayout={getItemLayout}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <Animated.View entering={FadeIn.delay(400)} style={styles.emptyState}>
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="search-outline" size={48} color={colors.textDimmed} />
              <Text style={styles.emptyTitle}>Sin coincidencias</Text>
              <Text style={styles.emptyText}>Prueba con otros términos o filtros.</Text>
            </GlassCard>
          </Animated.View>
        }
      />
    </View>
  );
}

// Style Generator Function
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerContent: {
    paddingBottom: 8,
  },
  searchSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: theme.spacing.md,
    gap: 8,
    paddingBottom: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  countBold: {
    color: colors.text,
    fontWeight: 'bold',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterBtnTextActive: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 140,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    width: '100%',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
