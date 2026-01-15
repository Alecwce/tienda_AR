// src/store/useProductStore.ts - Product state management with Zustand
import { supabase } from '@/src/lib/supabase';
import type { FilterOptions, Product, ProductCategory, SortOption } from '@/src/types';
import { create } from 'zustand';

interface ProductState {
  // Data
  products: Product[];
  featuredProducts: Product[];
  categories: ProductCategory[];
  isLoading: boolean;
  error: string | null;

  // Filters & Search
  searchQuery: string;
  filters: FilterOptions;
  sortBy: SortOption;

  // Computed
  filteredProducts: Product[];

  // Actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  setSortBy: (sort: SortOption) => void;
  loadProducts: (retryCount?: number) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
}

const defaultFilters: FilterOptions = {
  category: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  sizes: undefined,
  brands: undefined,
  hasAR: undefined,
  isNew: undefined,
};

const filterProducts = (
  products: Product[],
  filters: FilterOptions,
  searchQuery: string,
  sortBy: SortOption
): Product[] => {
  let result = [...products];

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  // Category filter
  if (filters.category) {
    result = result.filter((p) => p.category === filters.category);
  }

  // Price filter
  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  // Size filter
  if (filters.sizes?.length) {
    result = result.filter((p) => p.sizes.some((s) => filters.sizes!.includes(s)));
  }

  // Brand filter
  if (filters.brands?.length) {
    result = result.filter((p) => filters.brands!.includes(p.brand));
  }

  // AR filter
  if (filters.hasAR !== undefined) {
    result = result.filter((p) => p.hasAR === filters.hasAR);
  }

  // New items filter
  if (filters.isNew !== undefined) {
    result = result.filter((p) => p.isNew === filters.isNew);
  }

  // Sorting
  switch (sortBy) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'popular':
    default:
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
  }

  return result;
};

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  featuredProducts: [],
  categories: ['vestidos', 'tops', 'pantalones', 'faldas', 'abrigos', 'accesorios', 'calzado'],
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: defaultFilters,
  sortBy: 'popular',
  filteredProducts: [],

  // Actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    const state = get();
    set({
      filteredProducts: filterProducts(state.products, state.filters, query, state.sortBy),
    });
  },

  setFilters: (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    set({ filters });
    const state = get();
    set({
      filteredProducts: filterProducts(state.products, filters, state.searchQuery, state.sortBy),
    });
  },

  clearFilters: () => {
    set({ filters: defaultFilters, searchQuery: '' });
    const state = get();
    set({
      filteredProducts: filterProducts(state.products, defaultFilters, '', state.sortBy),
    });
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    const state = get();
    set({
      filteredProducts: filterProducts(state.products, state.filters, state.searchQuery, sortBy),
    });
  },

  loadProducts: async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      if (data) {
        const products: Product[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          price: Number(item.price),
          originalPrice: item.original_price ? Number(item.original_price) : undefined,
          discount: item.original_price
            ? Math.round(((Number(item.original_price) - Number(item.price)) / Number(item.original_price)) * 100)
            : undefined,
          description: item.description || '',
          category: item.category as ProductCategory,
          images: item.images || [],
          // Map DB optional fields to Frontend Types
          arOverlayUrl: item.ar_overlay_url || item.model_3d_url || undefined,
          hasAR: item.has_ar || false,
          isNew: item.is_new || false,
          isFeatured: item.is_featured || false,
          rating: Number(item.rating) || 0,
          reviewCount: item.review_count || 0,
          stock: item.stock || 0,
          sizes: item.sizes || [],
          colors: item.colors || [],
          tags: item.tags || [],
          createdAt: item.created_at,
        }));

        const featured = products.filter((p) => p.isFeatured);

        set({
          products,
          featuredProducts: featured,
          filteredProducts: filterProducts(products, get().filters, get().searchQuery, get().sortBy),
          isLoading: false,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading products:', error);
      }
      
      // Retry con exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = 1000 * Math.pow(2, retryCount); // 1s, 2s, 4s
        if (__DEV__) {
          console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        return get().loadProducts(retryCount + 1);
      }
      
      set({
        error: error instanceof Error ? error.message : 'Error cargando productos',
        isLoading: false,
      });
    }
  },

  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },
}));
