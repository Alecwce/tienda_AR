// src/lib/validations/auth.ts - Zod schemas para validación de auth

import { z } from 'zod';

/**
 * Schema de validación para login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Por favor ingresa un correo electrónico válido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
});

/**
 * Schema de validación para registro
 */
export const registerSchema = loginSchema.extend({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .trim()
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
});

/**
 * Tipos inferidos de los schemas
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
