// src/components/ui/ProductCard.tsx - Premium Editorial Version
import { useUserStore } from '@/src/store';
import { theme } from '@/src/theme';
import { useTheme } from '@/src/theme/ThemeContext';
import type { Product } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';

import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  index?: number;
  variant?: 'compact' | 'featured' | 'editorial';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 48) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  index = 0,
  variant = 'compact',
}) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { toggleFavorite, isFavorite } = useUserStore();
  const favorited = isFavorite(product.id);
  
  const scale = useSharedValue(1);
  const imageScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, theme.animation.spring);
    imageScale.value = withSpring(1.05, theme.animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.animation.spring);
    imageScale.value = withSpring(1, theme.animation.spring);
  };

  const handleToggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(product.id);
  };

  const isEditorial = variant === 'editorial';
  const isFeatured = variant === 'featured';

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).springify().damping(15)}
      style={[
        styles.wrapper,
        isFeatured && styles.featuredWrapper,
        isEditorial && styles.editorialWrapper,
      ]}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.container, animatedStyle]}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Animated.View style={[StyleSheet.absoluteFill, imageAnimatedStyle]}>
            <Image
              source={{ uri: product.images[0] }}
              style={styles.image}
              contentFit="cover"
              transition={400}
            />
          </Animated.View>

          {/* Image Overlay - Subtle gradient for text visibility */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {product.hasAR && (
              <View style={[styles.arBadge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <Ionicons name="scan" size={14} color="#FFF" />
              </View>
            )}
            {product.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>

          {/* Favorite Button */}
          <Pressable style={styles.favoriteBtn} onPress={handleToggleFavorite}>
            <View style={[styles.favoriteBlur, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={18}
                color={favorited ? colors.secondary : '#FFF'}
              />
            </View>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name} numberOfLines={isFeatured ? 2 : 1}>
            {product.name}
          </Text>
          
          <View style={styles.footer}>
            <Text style={styles.price}>S/ {product.price.toFixed(2)}</Text>
            {product.discount && (
              <Text style={styles.discount}>-{product.discount}%</Text>
            )}
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  wrapper: {
    width: COLUMN_WIDTH,
    marginBottom: theme.spacing.md,
  },
  featuredWrapper: {
    width: '100%',
  },
  editorialWrapper: {
    width: '100%',
    height: 350,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.85,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  arBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  newBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  favoriteBlur: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  brand: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
  },
  discount: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
  },
});
