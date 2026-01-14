// app/(tabs)/try-on.tsx - Premium Refined Version
import { useProductStore } from '@/src/store';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TryOnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  
  const [permission, requestPermission] = useCameraPermissions();
  const { products } = useProductStore();
  
  const arProducts = useMemo(() => products.filter(p => p.hasAR), [products]);
  const [selectedProduct, setSelectedProduct] = useState(
    productId ? arProducts.find(p => p.id === productId) : arProducts[0]
  );

  // Overlay Controls
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const overlayOpacity = useSharedValue(0.8);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: overlayOpacity.value,
  }));

  const onPanGesture = (event: any) => {
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
  };

  const onPinchGesture = (event: any) => {
    scale.value = event.nativeEvent.scale;
  };

  const handleCapture = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Demo capture
  };

  if (!permission) return <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /></View>;
  
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={theme.colors.textDimmed} />
        <Text style={styles.permissionTitle}>Acceso Requerido</Text>
        <Text style={styles.permissionText}>Necesitamos tu cámara para que la magia del AR funcione.</Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Habilitar Cámara</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {Platform.OS !== 'web' ? (
          <CameraView style={StyleSheet.absoluteFill} facing="front" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800' }} 
              style={StyleSheet.absoluteFill} 
              contentFit="cover"
            />
            <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
          </View>
        )}

        {/* Top Controls */}
        <View style={[styles.topControls, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <BlurView intensity={40} tint="dark" style={styles.iconBlur}>
              <Ionicons name="close" size={24} color="#FFF" />
            </BlurView>
          </Pressable>
          <View style={styles.arStatus}>
            <View style={styles.pulseDot} />
            <Text style={styles.arStatusText}>AR ELITE ACTIVO</Text>
          </View>
          <Pressable style={styles.iconBtn}>
            <BlurView intensity={40} tint="dark" style={styles.iconBlur}>
              <Ionicons name="refresh" size={20} color="#FFF" />
            </BlurView>
          </Pressable>
        </View>

        {/* AR Overlay Area */}
        <View style={styles.arArea}>
          {selectedProduct && (
            <PanGestureHandler onGestureEvent={onPanGesture}>
              <Animated.View style={[{ width: 300, height: 400 }, overlayAnimatedStyle]}>
                <PinchGestureHandler onGestureEvent={onPinchGesture}>
                  <Animated.Image
                    source={{ uri: selectedProduct.images[0] }}
                    style={styles.garmentOverlay}
                    resizeMode="contain"
                  />
                </PinchGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          )}
        </View>

        {/* Bottom Panel */}
        <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.selectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
              {arProducts.map((p) => (
                <Pressable 
                  key={p.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedProduct(p);
                  }}
                  style={[styles.productThumb, selectedProduct?.id === p.id && styles.productThumbActive]}
                >
                  <Image source={{ uri: p.images[0] }} style={styles.thumbImg} />
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.sideBtn}>
              <Ionicons name="image-outline" size={24} color="#FFF" />
            </Pressable>
            
            <Pressable style={styles.captureBtn} onPress={handleCapture}>
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.captureGradient}
              />
              <View style={styles.captureInner} />
            </Pressable>

            <Pressable style={styles.sideBtn}>
              <Ionicons name="share-social-outline" size={24} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* UI Overlay Tips */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.gestureHint}>
          <BlurView intensity={30} tint="dark" style={styles.hintBlur}>
            <Ionicons name="move" size={12} color="#AAA" />
            <Text style={styles.hintText}>Usa dos dedos para escalar y uno para mover</Text>
          </BlurView>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  topControls: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
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
  arStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  arStatusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  arArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garmentOverlay: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
  },
  selectorContainer: {
    marginBottom: 24,
  },
  selectorScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  productThumb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  productThumbActive: {
    borderColor: theme.colors.primary,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 30,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  captureInner: {
    flex: 1,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: 'transparent',
  },
  sideBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gestureHint: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
  },
  hintBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  hintText: {
    color: '#AAA',
    fontSize: 11,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  permissionTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 24,
  },
  permissionText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  permissionBtn: {
    marginTop: 32,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
  },
  permissionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});


