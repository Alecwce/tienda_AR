// src/store/useCartStore.ts - Cart state management with Zustand
import type { CartItem, Product, Size } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number; // Porcentaje (0-100)

  // Computed
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;

  // Actions
  addItem: (product: Product, size: Size, color: string, quantity?: number) => boolean;
  removeItem: (productId: string, size: Size, color: string) => void;
  updateQuantity: (productId: string, size: Size, color: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
}

const calculateTotals = (items: CartItem[], promoDiscount: number) => {
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = subtotal * (promoDiscount / 100);
  return {
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal,
    discount,
    total: subtotal - discount,
  };
};

// Códigos promocionales válidos (en producción vendrían del backend)
const VALID_PROMO_CODES: Record<string, number> = {
  VIRTUAL10: 10,
  VOGUE20: 20,
  FIRSTBUY: 15,
  ARMAGIC: 25,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      total: 0,

      addItem: (product, size, color, quantity = 1) => {
        // Validar stock disponible
        if (product.stock !== undefined && product.stock < quantity) {
          return false; // No hay suficiente stock
        }

        const items = [...get().items];
        const existingIndex = items.findIndex(
          (item) =>
            item.product.id === product.id && item.size === size && item.color === color
        );

        // Validar que no exceda el stock con items existentes
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
          (item) =>
            !(item.product.id === productId && item.size === size && item.color === color)
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
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          total: 0,
        });
      },

      applyPromoCode: (code) => {
        const upperCode = code.toUpperCase().trim();
        const discount = VALID_PROMO_CODES[upperCode];

        if (discount) {
          const totals = calculateTotals(get().items, discount);
          set({ promoCode: upperCode, promoDiscount: discount, ...totals });
          return true;
        }
        return false;
      },

      removePromoCode: () => {
        const totals = calculateTotals(get().items, 0);
        set({ promoCode: null, promoDiscount: 0, ...totals });
      },
    }),
    {
      name: 'virtual-vogue-cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
      }),
    }
  )
);
