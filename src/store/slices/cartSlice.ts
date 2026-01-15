// src/store/slices/cartSlice.ts - Cart slice usando slices pattern

import type { CartItem, Product, Size } from '@/src/types';
import type { StateCreator } from 'zustand';

export interface CartSlice {
  // State
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;
  subtotal: number;
  discount: number;
  total: number;

  // Actions
  addItem: (product: Product, size: Size, color: string, quantity?: number) => boolean;
  removeItem: (productId: string, size: Size, color: string) => void;
  updateQuantity: (productId: string, size: Size, color: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
}

const VALID_PROMO_CODES: Record<string, number> = {
  WELCOME10: 0.1,
  SUMMER20: 0.2,
  VIP30: 0.3,
};

const calculateTotals = (items: CartItem[], promoDiscount: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = subtotal * promoDiscount;
  const total = subtotal - discount;
  return { subtotal, discount, total };
};

export const createCartSlice: StateCreator<CartSlice> = (set, get) => ({
  items: [],
  promoCode: null,
  promoDiscount: 0,
  subtotal: 0,
  discount: 0,
  total: 0,

  addItem: (product, size, color, quantity = 1) => {
    if (product.stock !== undefined && product.stock < quantity) {
      return false;
    }

    const items = [...get().items];
    const existingIndex = items.findIndex(
      (item) => item.product.id === product.id && item.size === size && item.color === color
    );

    if (existingIndex >= 0) {
      const newQuantity = items[existingIndex].quantity + quantity;
      if (product.stock !== undefined && newQuantity > product.stock) {
        return false;
      }
      items[existingIndex].quantity = newQuantity;
    } else {
      items.push({ product, size, color, quantity });
    }

    const totals = calculateTotals(items, get().promoDiscount);
    set({ items, ...totals });
    return true;
  },

  removeItem: (productId, size, color) => {
    const items = get().items.filter(
      (item) => !(item.product.id === productId && item.size === size && item.color === color)
    );
    const totals = calculateTotals(items, get().promoDiscount);
    set({ items, ...totals });
  },

  updateQuantity: (productId, size, color, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, size, color);
      return;
    }
    const items = get().items.map((item) =>
      item.product.id === productId && item.size === size && item.color === color
        ? { ...item, quantity }
        : item
    );
    const totals = calculateTotals(items, get().promoDiscount);
    set({ items, ...totals });
  },

  clearCart: () => {
    set({
      items: [],
      promoCode: null,
      promoDiscount: 0,
      subtotal: 0,
      discount: 0,
      total: 0,
    });
  },

  applyPromoCode: (code) => {
    const discount = VALID_PROMO_CODES[code.toUpperCase()];
    if (!discount) return false;

    set({ promoCode: code.toUpperCase(), promoDiscount: discount });
    const totals = calculateTotals(get().items, discount);
    set(totals);
    return true;
  },
});
