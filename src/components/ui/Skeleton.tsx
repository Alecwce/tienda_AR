// src/components/ui/Skeleton.tsx - Skeleton loaders para estados de carga

import { theme } from '@/src/theme';
import { useTheme } from '@/src/theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Skeleton base - Loading placeholder animado
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.ease }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surface,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={[
            colors.surface,
            colors.border,
            colors.surface,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/**
 * ProductCardSkeleton - Para lista de productos
 */
export function ProductCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Imagen */}
      <Skeleton width="100%" height={180} borderRadius={12} style={{ marginBottom: 12 }} />
      
      {/* Brand */}
      <Skeleton width="40%" height={10} borderRadius={4} style={{ marginBottom: 8 }} />
      
      {/* Nombre */}
      <Skeleton width="80%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
      
      {/* Precio */}
      <Skeleton width="30%" height={16} borderRadius={4} />
    </View>
  );
}

/**
 * TextSkeleton - Para textos
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <View style={{ gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
          borderRadius={4}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    width: COLUMN_WIDTH,
    padding: 12,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
});
