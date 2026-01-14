// src/components/ui/GlassCard.tsx - Ultra Premium Glass
import { theme } from '@/src/theme';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight' | 'dark';
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  intensity = 30,
}) => {
  const isWeb = Platform.OS === 'web';
  
  // Refined intensity with default values
  const blurIntensity = isWeb ? 10 : intensity;

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={[
        styles.container,
        variant === 'highlight' && styles.highlightBorder,
        variant === 'dark' && styles.darkBackground,
        style,
      ]}
    >
      <BlurView
        intensity={blurIntensity}
        tint={variant === 'dark' ? 'dark' : 'default'}
        style={[StyleSheet.absoluteFill, styles.blur]}
      />
      {/* Surface layer for texture/depth */}
      <View style={[StyleSheet.absoluteFill, styles.surface]} />
      
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.02)', // Baseline subtle fill
    ...theme.shadows.soft,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  surface: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  highlightBorder: {
    borderColor: theme.colors.glassHighlight,
    borderWidth: 1.5,
  },
  darkBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    padding: theme.spacing.md,
    zIndex: 1,
  },
});
