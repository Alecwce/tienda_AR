// app/+error.tsx - Error Boundary UI

import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ErrorScreen({ error, retry }: { error: Error; retry?: () => void }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        
        <Text style={styles.title}>Algo salió mal</Text>
        <Text style={styles.message}>
          {error.message || 'Ha ocurrido un error inesperado'}
        </Text>

        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>{error.stack}</Text>
          </View>
        )}

        <View style={styles.actions}>
          {retry && (
            <Pressable style={styles.button} onPress={retry}>
              <Text style={styles.buttonText}>Reintentar</Text>
            </Pressable>
          )}
          
          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              Ir al inicio
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  debugContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xl,
    maxWidth: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  debugText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontFamily: 'monospace',
  },
  actions: {
    gap: theme.spacing.md,
    width: '100%',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: theme.colors.text,
  },
});
