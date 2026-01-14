// src/types/user.ts - User types for Virtual Vogue

import type { UserMeasurements } from './product';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  measurements?: UserMeasurements;
  favorites: string[]; // Product IDs
  history: string[];   // Product IDs (recently viewed)
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteCount: number;
  arTriesCount: number;
}
