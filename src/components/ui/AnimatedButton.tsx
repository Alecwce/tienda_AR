// src/components/ui/AnimatedButton.tsx - Premium Refined Version
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'right',
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const shineTranslateX = useSharedValue(-150);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: withTiming(opacity.value, { duration: 200 }),
  }));

  const shineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shineTranslateX.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.96, theme.animation.spring);
    shineTranslateX.value = withTiming(150, { duration: 600 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, theme.animation.spring);
    shineTranslateX.value = -150;
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          gradient: theme.colors.gradient.primary,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
          gradient: theme.colors.gradient.sunset,
        };
      case 'glass':
        return {
          container: styles.glassContainer,
          text: styles.primaryText,
          gradient: null,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
          gradient: null,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
          gradient: null,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          gradient: theme.colors.gradient.primary,
        };
    }
  };

  const { container, text, gradient } = getVariantStyles();

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.baseContainer,
        styles[size],
        fullWidth && styles.fullWidth,
        container,
        disabled && styles.disabledContainer,
        containerAnimatedStyle,
        style,
      ]}
    >
      {gradient && !disabled ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          {/* Shine effect */}
          <Animated.View style={[styles.shine, shineAnimatedStyle]}>
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </LinearGradient>
      ) : null}
      
      <View style={styles.content}>
        {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
        <Text style={[styles.baseText, text, disabled && styles.disabledText, textStyle]}>
          {title}
        </Text>
        {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  baseText: {
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  fullWidth: {
    width: '100%',
  },
  // Sizes
  sm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: theme.radius.xl,
  },
  // Variants
  primaryContainer: {
    ...theme.shadows.glow(theme.colors.primary),
  },
  primaryText: {
    color: theme.colors.text,
  },
  secondaryContainer: {
    ...theme.shadows.glow(theme.colors.accent),
  },
  secondaryText: {
    color: theme.colors.text,
  },
  glassContainer: {
    backgroundColor: theme.colors.glassHighlight,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: theme.colors.textSecondary,
  },
  disabledContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    opacity: 0.6,
  },
});
