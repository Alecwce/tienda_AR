// src/utils/animation.ts - Utilidades para animaciones con Reanimated

/**
 * Interpolación lineal para valores numéricos
 * Compatible con Reanimated worklets
 */
export function interpolate(
  value: number,
  inputRange: number[],
  outputRange: number[]
): number {
  'worklet';
  
  const [minIn, maxIn] = inputRange;
  const [minOut, maxOut] = outputRange;
  
  return minOut + (maxOut - minOut) * ((value - minIn) / (maxIn - minIn));
}

/**
 * Clamp: Limitar un valor entre un mínimo y máximo
 */
export function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}
