// src/components/ui/SearchInput.tsx - Animated search input with debounce
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Buscar productos...',
  debounceMs = 300,
  autoFocus = false,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const isFocused = useSharedValue(0);
  const scale = useSharedValue(1);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeText(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChangeText]);

  // Sync with external value
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: isFocused.value
      ? theme.colors.primary
      : theme.colors.glassBorder,
    transform: [{ scale: scale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + isFocused.value * 0.5,
  }));

  const handleFocus = () => {
    isFocused.value = withTiming(1, { duration: theme.animation.fast });
    scale.value = withSpring(1.02, theme.animation.spring);
    Haptics.selectionAsync();
  };

  const handleBlur = () => {
    isFocused.value = withTiming(0, { duration: theme.animation.fast });
    scale.value = withSpring(1, theme.animation.spring);
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalValue('');
    onChangeText('');
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, containerAnimatedStyle]}
    >
      <Animated.View style={iconAnimatedStyle}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
      </Animated.View>

      <TextInput
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        autoFocus={autoFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
        selectionColor={theme.colors.primary}
        returnKeyType="search"
      />

      {localValue.length > 0 && (
        <Animated.View entering={FadeIn.duration(150)}>
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
});
