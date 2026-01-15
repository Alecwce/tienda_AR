// src/store/middleware/offlineMiddleware.ts - Middleware para sync offline

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateCreator } from 'zustand';

type OfflineAction = {
  id: string;
  timestamp: number;
  action: string;
  payload: unknown;
};

const OFFLINE_QUEUE_KEY = 'virtual-vogue-offline-queue';

/**
 * Middleware para manejar acciones offline
 * Encola operaciones cuando no hay conexión y las sincroniza cuando vuelve
 */
export const offlineMiddleware = <T extends object>(): StateCreator<T> => {
  return (set, get, api) => {
    // This is a placeholder - full implementation would require:
    // 1. Queue actions when offline
    // 2. Sync when connection returns
    // 3. Handle conflicts
    return {} as T;
  };
};

/**
 * Utilidades para manejar la cola offline
 */
export async function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
  const queue = await getOfflineQueue();
  const newAction: OfflineAction = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    ...action,
  };
  queue.push(newAction);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return newAction;
}

export async function getOfflineQueue(): Promise<OfflineAction[]> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function clearOfflineQueue(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export async function processOfflineQueue(
  processor: (action: OfflineAction) => Promise<boolean>
): Promise<{ processed: number; failed: number }> {
  const queue = await getOfflineQueue();
  let processed = 0;
  let failed = 0;
  const remaining: OfflineAction[] = [];

  for (const action of queue) {
    try {
      const success = await processor(action);
      if (success) {
        processed++;
      } else {
        remaining.push(action);
        failed++;
      }
    } catch {
      remaining.push(action);
      failed++;
    }
  }

  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  return { processed, failed };
}
