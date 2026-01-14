// app/product/[id].tsx - Premium Refined Version
import { AnimatedButton, GlassCard } from '@/src/components/ui';
import { useCartStore, useProductStore, useUserStore } from '@/src/store';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { getProductById } = useProductStore();
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorite, measurements } = useUserStore();
  
  const product = getProductById(id);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0].name || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const favorited = isFavorite(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    addItem(product, selectedSize, selectedColor);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const recommendedSize = measurements ? 'M' : null; // Demo logic

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveImageIndex(Math.round(x / SCREEN_WIDTH));
            }}
            scrollEventThrottle={16}
          >
            {product.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.galleryImage} contentFit="cover" />
            ))}
          </ScrollView>
          
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']}
            style={[styles.headerGradient, { height: insets.top + 60 }]}
          />

          <View style={styles.galleryIndicators}>
            {product.images.map((_, idx) => (
              <View 
                key={idx} 
                style={[styles.dot, activeImageIndex === idx && styles.activeDot]} 
              />
            ))}
          </View>
        </View>

        {/* Back and Favorite Actions */}
        <View style={[styles.topActions, { top: insets.top + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <BlurView intensity={30} tint="dark" style={styles.iconBlur}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </BlurView>
          </Pressable>
          <Pressable onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleFavorite(product.id);
          }} style={styles.iconBtn}>
            <BlurView intensity={30} tint="dark" style={styles.iconBlur}>
              <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={24} color={favorited ? theme.colors.secondary : '#FFF'} />
            </BlurView>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.title}>{product.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>S/ {product.price.toFixed(2)}</Text>
              {product.hasAR && (
                <View style={styles.arBadge}>
                  <Ionicons name="scan" size={12} color={theme.colors.primary} />
                  <Text style={styles.arBadgeText}>SOPORTE AR</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* AI Size Recommendation */}
          {measurements && (
            <Animated.View entering={FadeInDown.delay(200)}>
              <GlassCard variant="highlight" style={styles.aiCard}>
                <Ionicons name="sparkles" size={20} color={theme.colors.accent} />
                <Text style={styles.aiText}>
                  Basado en tus medidas, te recomendamos la talla <Text style={styles.aiBold}>{recommendedSize}</Text>.
                </Text>
              </GlassCard>
            </Animated.View>
          )}

          {/* Color Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>COLORES DISPONIBLES</Text>
            <View style={styles.colorRow}>
              {product.colors.map((color) => (
                <Pressable 
                  key={color.name}
                  onPress={() => setSelectedColor(color.name)}
                  style={[styles.colorOption, selectedColor === color.name && { borderColor: theme.colors.primary }]}
                >
                  <View style={[styles.colorDot, { backgroundColor: color.hex }]} />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Size Selector */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>SELECCIONA TALLA</Text>
              <Pressable>
                <Text style={styles.guideLink}>Guía de tallas</Text>
              </Pressable>
            </View>
            <View style={styles.sizeRow}>
              {product.sizes.map((size) => (
                <Pressable 
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    styles.sizeOption, 
                    selectedSize === size && styles.sizeOptionSelected,
                    recommendedSize === size && styles.sizeOptionRecommended
                  ]}
                >
                  <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextSelected]}>
                    {size}
                  </Text>
                  {recommendedSize === size && <View style={styles.recommendDot} />}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>DETALLES DE LA PRENDA</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.actionRow}>
          {product.hasAR && (
            <Pressable 
              style={styles.arActionBtn}
              onPress={() => router.push({ pathname: '/try-on', params: { productId: product.id } })}
            >
              <LinearGradient
                colors={theme.colors.gradient.sunset as unknown as string[]}
                style={styles.arGradient}
              />
              <Ionicons name="scan" size={24} color="#FFF" />
            </Pressable>
          )}
          <AnimatedButton
            title={`Añadir a la Bolsa • S/ ${product.price}`}
            onPress={handleAddToCart}
            variant="primary"
            size="lg"
            fullWidth
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  galleryContainer: {
    width: SCREEN_WIDTH,
    height: 500,
    backgroundColor: theme.colors.surface,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 500,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  galleryIndicators: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeDot: {
    width: 20,
    backgroundColor: '#FFF',
  },
  topActions: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  iconBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },
  brand: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -1,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
  },
  arBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  arBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  aiCard: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  aiText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  aiBold: {
    color: theme.colors.accent,
    fontWeight: '900',
  },
  section: {
    marginTop: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.textMuted,
    letterSpacing: 1.5,
  },
  guideLink: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 16,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDot: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sizeOption: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  sizeOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  sizeOptionRecommended: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  sizeText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  sizeTextSelected: {
    color: theme.colors.text,
    fontWeight: '900',
  },
  recommendDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
  descriptionSection: {
    marginTop: 32,
  },
  description: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginTop: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  arActionBtn: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  arGradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
