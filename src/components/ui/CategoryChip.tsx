// src/components/ui/CategoryChip.tsx - Animated filter chip
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoryChip({ label, selected, onPress, icon }: CategoryChipProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: theme.animation.normal });
  }, [selected]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.surface, theme.colors.primary]
    );

    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.glassBorder, theme.colors.primary]
    );

    return {
      backgroundColor,
      borderColor,
      transform: [{ scale: scale.value }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.textSecondary, theme.colors.text]
    );

    return { color };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, theme.animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.animation.spring);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.container, containerAnimatedStyle]}
    >
      {icon}
      <Animated.Text style={[styles.label, textAnimatedStyle]}>{label}</Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
