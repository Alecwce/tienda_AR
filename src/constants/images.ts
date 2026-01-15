// src/constants/images.ts - Centralized image URLs

/**
 * URLs de imágenes centralizadas para evitar hardcoding en componentes.
 * En producción, estas deberían venir de Supabase Storage.
 */

export const IMAGES = {
  // Hero Section
  hero: {
    main: 'https://images.unsplash.com/photo-1539008835154-33321daaf3b3?w=500',
    auth: 'https://images.pexels.com/photos/7102037/pexels-photo-7102037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    arBanner: 'https://images.unsplash.com/photo-1445205170230-053b830c6050?w=800',
  },

  // Categories
  categories: {
    vestidos: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    tops: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
    pantalones: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    faldas: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
    abrigos: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
    accesorios: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400',
    calzado: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
  },

  // Placeholders
  placeholders: {
    product: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    empty: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400',
  },
} as const;

export type CategoryImageKey = keyof typeof IMAGES.categories;
