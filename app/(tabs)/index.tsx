// app/(tabs)/index.tsx - Premium Refined Version
import {
    AnimatedButton,
    GlassCard,
    ProductCard,
} from '@/src/components/ui';
import { useProductStore, useUserStore } from '@/src/store';
import { theme } from '@/src/theme';
import { useTheme } from '@/src/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
    Dimensions,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    FadeInRight,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'vestidos', name: 'Vestidos', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400' },
  { id: 'tops', name: 'Tops', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400' },
  { id: 'pantalones', name: 'Pantalones', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
  { id: 'faldas', name: 'Faldas', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400' },
  { id: 'abrigos', name: 'Abrigos', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { featuredProducts } = useProductStore();
  const { measurements } = useUserStore();
  const { colors, isDark } = useTheme();

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const floatValue = useSharedValue(0);

  React.useEffect(() => {
    floatValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500 }),
        withTiming(0, { duration: 2500 })
      ),
      -1,
      true
    );
  }, []);

  // Prefetch de imágenes de productos featured
  React.useEffect(() => {
    if (featuredProducts.length > 0) {
      // Prefetch primeras 6 imágenes de productos featured
      const imagesToPrefetch = featuredProducts
        .slice(0, 6)
        .map(p => p.images[0])
        .filter(Boolean);

      imagesToPrefetch.forEach(imageUrl => {
        Image.prefetch(imageUrl).catch(err => {
          if (__DEV__) console.log('Image prefetch failed:', err);
        });
      });
    }
  }, [featuredProducts]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatValue.value, [0, 1], [0, -10]) }],
  }));

  const handleProductPress = useCallback((id: string) => {
    router.push(`/product/${id}`);
  }, [router]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header / Hero Section - Editorial Look */}
        <Animated.View entering={FadeInUp.duration(800)} style={styles.heroWrapper}>
          <LinearGradient
            colors={theme.colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroContainer, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.heroTextContent}>
              <Animated.View entering={FadeInUp.delay(200)}>
                <Text style={styles.heroLabel}>NUEVA COLECCIÓN 2026</Text>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(400)}>
                <Text style={styles.heroTitle}>Virtual{'\n'}Vogue</Text>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(600)}>
                <Text style={styles.heroSubtitle}>
                  Redefiniendo el probador digital con precisión élite.
                </Text>
              </Animated.View>
              
              <Animated.View entering={FadeInUp.delay(800)} style={styles.heroActions}>
                <AnimatedButton
                  title="Ver Catálogo"
                  onPress={() => router.push('/catalog')}
                  size="md"
                  variant="primary"
                />
              </Animated.View>
            </View>

            {/* Floating Fashion Element */}
            <Animated.View style={[styles.floatingElement, floatingStyle]}>
              <BlurView intensity={20} style={styles.floatingBlur}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1539008835154-33321daaf3b3?w=500' }}
                  style={styles.floatingImage}
                  contentFit="cover"
                />
              </BlurView>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Categories Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tendencias</Text>
          <Pressable onPress={() => router.push('/catalog')}>
            <Text style={styles.seeAll}>Ver todo</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat, index) => (
            <Animated.View key={cat.id} entering={FadeInRight.delay(index * 100)}>
              <Pressable 
                style={styles.categoryCard}
                onPress={() => router.push({ pathname: '/catalog', params: { category: cat.id } })}
              >
                <Image source={{ uri: cat.image }} style={styles.categoryImage} />
                <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={styles.categoryOverlay}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </BlurView>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Calibration CTA - Premium Version */}
        {!measurements && (
          <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
            <GlassCard variant="highlight" style={styles.calibrationCard}>
              <View style={styles.calibrationContent}>
                <View style={styles.calibrationIcon}>
                  <Ionicons name="body" size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.calibrationText}>
                  <Text style={styles.calibrationTitle}>Calibra tu Talla AI</Text>
                  <Text style={styles.calibrationSub}>
                    Precisión del 98% en recomendaciones corporales.
                  </Text>
                </View>
              </View>
              <AnimatedButton
                title="Configurar Ahora"
                onPress={() => router.push('/calibration')}
                variant="glass"
                size="sm"
                fullWidth
                style={{ marginTop: theme.spacing.md }}
              />
            </GlassCard>
          </Animated.View>
        )}

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Selección Editorial</Text>
        </View>

        <View style={styles.productsGrid}>
          {featuredProducts.slice(0, 4).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onPress={() => handleProductPress(product.id)}
            />
          ))}
        </View>

        {/* Try-On Banner */}
        <Pressable 
          style={styles.arBanner}
          onPress={() => router.push('/try-on')}
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1445205170230-053b830c6050?w=800' }}
            style={styles.arBannerContent}
            imageStyle={{ borderRadius: theme.radius.xl }}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
              style={[StyleSheet.absoluteFill, { borderRadius: theme.radius.xl }]}
            />
            <View style={styles.arBannerText}>
              <View style={styles.arTag}>
                <Ionicons name="scan" size={14} color="#FFF" />
                <Text style={styles.arTagText}>REALIDAD AUMENTADA</Text>
              </View>
              <Text style={styles.arTitle}>Prueba el futuro</Text>
              <Text style={styles.arDescription}>
                Visualiza cómo te queda antes de dar el primer paso.
              </Text>
            </View>
          </ImageBackground>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function interpolate(value: number, input: number[], output: number[]) {
  "worklet";
  const [minIn, maxIn] = input;
  const [minOut, maxOut] = output;
  return minOut + (maxOut - minOut) * (value - minIn) / (maxIn - minIn);
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroWrapper: {
    marginBottom: theme.spacing.lg,
  },
  heroContainer: {
    height: 480,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: theme.radius['2xl'],
    borderBottomRightRadius: theme.radius['2xl'],
    overflow: 'hidden',
  },
  heroTextContent: {
    flex: 1,
    paddingRight: 20,
    zIndex: 10,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
    opacity: 0.8,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 54,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 56,
    letterSpacing: -2,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 12,
    lineHeight: 24,
  },
  heroActions: {
    marginTop: 24,
    width: 160,
  },
  floatingElement: {
    width: 160,
    height: 240,
    zIndex: 5,
  },
  floatingBlur: {
    flex: 1,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  floatingImage: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  seeAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingLeft: theme.spacing.md,
    gap: 12,
  },
  categoryCard: {
    width: 120,
    height: 160,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryImage: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    alignItems: 'center',
  },
  categoryName: {
    color: '#FFF', // Keep white as it is on image overlay
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  calibrationCard: {
    padding: 20,
  },
  calibrationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  calibrationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calibrationText: {
    flex: 1,
  },
  calibrationTitle: {
    color: colors.text, // Adapted for GlassCard content
    fontSize: 18,
    fontWeight: '800',
  },
  calibrationSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'space-between',
  },
  arBanner: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xl,
    marginBottom: 40,
    height: 200,
  },
  arBannerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  arTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  arTagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  arTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  arDescription: {
    color: '#EEE',
    fontSize: 14,
    marginTop: 4,
  },
  arBannerText: {
    zIndex: 1,
  }
});
