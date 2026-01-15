// __tests__/store/useUserStore.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock MMKV ANTES de importar el store
vi.mock('react-native-mmkv');

import { useUserStore } from '@/src/store/useUserStore';
import { Session } from '@supabase/supabase-js';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockSession: Session = {
  access_token: 'token-123',
  refresh_token: 'refresh-123',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser as any,
};

describe('useUserStore', () => {
  beforeEach(async () => {
    await useUserStore.getState().signOut();
    vi.clearAllMocks();
  });

  it('debe iniciar con estado vacío', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('debe establecer la sesión correctamente', () => {
    useUserStore.getState().setSession(mockSession);
    
    const state = useUserStore.getState();
    expect(state.session).toEqual(mockSession);
    // user se carga aparte en signIn, setSession no lo toca
    expect(state.isAuthenticated).toBe(true);
  });

  it('debe establecer el usuario correctamente', () => {
    const user = { id: '123', email: 'test@example.com', favorites: [], history: [] };
    useUserStore.getState().setUser(user as any);
    
    const state = useUserStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('debe limpiar el estado al cerrar sesión', async () => {
    useUserStore.getState().setSession(mockSession);
    await useUserStore.getState().signOut();
    
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('debe actualizar las medidas del usuario', () => {
    const measures = { 
      chest: 100, 
      waist: 80, 
      hips: 95, 
      height: 180,
      weight: 75,
      bust: 90
    };
    useUserStore.getState().setMeasurements(measures);
    
    const state = useUserStore.getState();
    expect(state.measurements).toEqual(measures);
  });
});
