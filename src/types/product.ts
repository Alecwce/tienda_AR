// src/types/product.ts - Product types for Virtual Vogue

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: ProductCategory;
  brand: string;
  sizes: Size[];
  colors: ProductColor[];
  images: string[];
  arOverlayUrl?: string; // URL for AR overlay image
  hasAR: boolean;
  rating: number;
  reviewCount: number;
  stock?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  tags: string[];
  createdAt: string;
}

export type ProductCategory =
  | 'vestidos'
  | 'tops'
  | 'pantalones'
  | 'faldas'
  | 'abrigos'
  | 'accesorios'
  | 'calzado';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface CartItem {
  product: Product;
  size: Size;
  color: string;
  quantity: number;
}

export interface UserMeasurements {
  height: number;      // cm
  weight: number;      // kg
  bust: number;        // cm
  waist: number;       // cm
  hips: number;        // cm
  shoulderWidth?: number; // cm
  armLength?: number;  // cm
}

export interface SizeRecommendation {
  size: Size;
  confidence: number;  // 0-100
  notes: string;
}

export interface FilterOptions {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  sizes?: Size[];
  brands?: string[];
  hasAR?: boolean;
  isNew?: boolean;
}

export type SortOption = 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
