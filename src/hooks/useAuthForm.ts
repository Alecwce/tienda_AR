// src/hooks/useAuthForm.ts - Custom hook para lógica de autenticación

import { loginSchema, registerSchema } from '@/src/lib/validations/auth';
import { useUserStore } from '@/src/store/useUserStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const router = useRouter();
  const { signIn, signUp } = useUserStore();

  const handleAuth = async () => {
    setLoading(true);
    try {
      // Validación con Zod
      if (isLogin) {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const firstError = result.error.issues[0];
          Alert.alert('Error de validación', firstError.message);
          setLoading(false);
          return;
        }
      } else {
        const result = registerSchema.safeParse({ email, password, fullName });
        if (!result.success) {
          const firstError = result.error.issues[0];
          Alert.alert('Error de validación', firstError.message);
          setLoading(false);
          return;
        }
      }

      // Autenticación
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Tu correo no ha sido confirmado. Por favor revisa tu bandeja de entrada o spam.');
          }
          throw error;
        }
        router.replace('/(tabs)');
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        Alert.alert(
          '¡Cuenta Creada!',
          'Hemos enviado un enlace de confirmación a tu correo. Debes confirmarlo antes de iniciar sesión.',
          [{ text: 'Entendido', onPress: () => setIsLogin(true) }]
        );
      }
    } catch (error: any) {
      Alert.alert('Atención', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => setIsLogin(!isLogin);

  return {
    // State
    email,
    password,
    fullName,
    loading,
    isLogin,
    // Actions
    setEmail,
    setPassword,
    setFullName,
    handleAuth,
    toggleMode,
  };
}
