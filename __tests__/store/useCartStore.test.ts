// __tests__/store/useCartStore.test.ts - Unit tests para CartStore

import { useCartStore } from '@/src/store/useCartStore';
import type { Product, Size } from '@/src/types';
import { beforeEach, describe, expect, it } from 'vitest';

// Mock product for testing
const mockProduct: Product = {
  id: 'test-product-1',
  name: 'Test Dress',
  brand: 'Test Brand',
  price: 199.99,
  description: 'A beautiful test dress',
  category: 'vestidos',
  images: ['https://example.com/image.jpg'],
  hasAR: true,
  rating: 4.5,
  reviewCount: 10,
  stock: 5,
  sizes: ['S', 'M', 'L'],
  colors: [{ name: 'Black', hex: '#000000' }],
  tags: ['test'],
  createdAt: new Date().toISOString(),
};

const mockProduct2: Product = {
  ...mockProduct,
  id: 'test-product-2',
  name: 'Test Top',
  price: 79.99,
};

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({
      items: [],
      promoCode: null,
      promoDiscount: 0,
      subtotal: 0,
      discount: 0,
      total: 0,
    });
  });

  describe('addItem', () => {
    it('should add a new item to cart', () => {
      const result = useCartStore.getState().addItem(mockProduct, 'M' as Size, 'Black');

      expect(result).toBe(true);
      
      const updatedState = useCartStore.getState();
      expect(updatedState.items.length).toBe(1);
      expect(updatedState.items[0].product.id).toBe('test-product-1');
      expect(updatedState.items[0].quantity).toBe(1);
    });

    it('should increment quantity if same item exists', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct, 'M' as Size, 'Black');
      store.addItem(mockProduct, 'M' as Size, 'Black');

      const updatedState = useCartStore.getState();
      expect(updatedState.items.length).toBe(1);
      expect(updatedState.items[0].quantity).toBe(2);
    });

    it('should add as separate item if different size', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct, 'M' as Size, 'Black');
      store.addItem(mockProduct, 'L' as Size, 'Black');

      const updatedState = useCartStore.getState();
      expect(updatedState.items.length).toBe(2);
    });

    it('should return false if stock is insufficient', () => {
      const lowStockProduct = { ...mockProduct, stock: 1 };
      const store = useCartStore.getState();
      
      store.addItem(lowStockProduct, 'M' as Size, 'Black');
      const result = store.addItem(lowStockProduct, 'M' as Size, 'Black');

      expect(result).toBe(false);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct, 'M' as Size, 'Black');
      
      const updatedStore = useCartStore.getState();
      updatedStore.removeItem('test-product-1', 'M' as Size, 'Black');

      const finalState = useCartStore.getState();
      expect(finalState.items.length).toBe(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct, 'M' as Size, 'Black');
      
      useCartStore.getState().updateQuantity('test-product-1', 'M' as Size, 'Black', 5);

      const updatedState = useCartStore.getState();
      expect(updatedState.items[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct, 'M' as Size, 'Black');
      
      useCartStore.getState().updateQuantity('test-product-1', 'M' as Size, 'Black', 0);

      const updatedState = useCartStore.getState();
      expect(updatedState.items.length).toBe(0);
    });
  });

  describe('applyPromoCode', () => {
    it('should apply valid promo code', () => {
      // Primero agregar un item al carrito
      useCartStore.getState().addItem(mockProduct, 'M' as Size, 'Black');
      
      const result = useCartStore.getState().applyPromoCode('VIRTUAL10');

      expect(result).toBe(true);
      const updatedState = useCartStore.getState();
      expect(updatedState.promoCode).toBe('VIRTUAL10');
      expect(updatedState.promoDiscount).toBe(10); // Porcentaje, no decimal
    });

    it('should reject invalid promo code', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct, 'M' as Size, 'Black');
      
      const result = useCartStore.getState().applyPromoCode('INVALID');

      expect(result).toBe(false);
      const updatedState = useCartStore.getState();
      expect(updatedState.promoCode).toBeNull();
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const store = useCartStore.getState();
      store.addItem(mockProduct, 'M' as Size, 'Black');
      store.addItem(mockProduct2, 'L' as Size, 'Black');
      
      useCartStore.getState().clearCart();

      const updatedState = useCartStore.getState();
      expect(updatedState.items.length).toBe(0);
      expect(updatedState.subtotal).toBe(0);
      expect(updatedState.total).toBe(0);
    });
  });

  describe('calculateTotals', () => {
    it('should calculate correct subtotal', () => {
      useCartStore.getState().addItem(mockProduct, 'M' as Size, 'Black', 2); // 199.99 * 2 = 399.98

      const updatedState = useCartStore.getState();
      expect(updatedState.subtotal).toBeCloseTo(399.98, 2);
    });

    it('should apply discount correctly', () => {
      // Agregar item primero
      useCartStore.getState().addItem(mockProduct, 'M' as Size, 'Black', 1); // 199.99
      
      // Aplicar cupón
      const promoResult = useCartStore.getState().applyPromoCode('VOGUE20'); // 20% off
      expect(promoResult).toBe(true);

      const updatedState = useCartStore.getState();
      expect(updatedState.discount).toBeCloseTo(40, 0); // 199.99 * 20% ≈ 40
      expect(updatedState.total).toBeCloseTo(159.99, 0); // 199.99 - 40 ≈ 160
    });
  });
});
