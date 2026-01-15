// app/(tabs)/try-on.tsx - Premium Refined Version with Smart Features
import { useProductStore } from '@/src/store';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
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
import { 
  GestureHandlerRootView, 
  PanGestureHandler, 
  PinchGestureHandler, 
  RotationGestureHandler, 
  State 
} from 'react-native-gesture-handler';
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TryOnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const { products } = useProductStore();
  
  // State for Photo Studio Mode
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const arProducts = useMemo(() => products.filter(p => p.hasAR), [products]);
  const [selectedProduct, setSelectedProduct] = useState(
    productId ? arProducts.find(p => p.id === productId) : arProducts[0]
  );
  
  // Variant Selector State
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Overlay Controls
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(0);
  const overlayOpacity = useSharedValue(0.8);

  // Refs for simultaneous gestures
  const panRef = useRef(null);
  const pinchRef = useRef(null);
  const rotationRef = useRef(null);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` }
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

  const onRotateGesture = (event: any) => {
    rotation.value = event.nativeEvent.rotation;
  };

  const handleCapture = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (capturedImage) {
      // If already captured, reset to live mode
      setCapturedImage(null);
      return;
    }

    if (cameraRef.current) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true // Faster capture
        });
        if (photo) {
            setCapturedImage(photo.uri);
        }
      } catch (e) {
        console.error("Failed to take picture", e);
      } finally {
        setIsProcessing(false);
      }
    }
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
        {capturedImage ? (
           // Photo Studio Mode
           <Image 
             source={{ uri: capturedImage }} 
             style={StyleSheet.absoluteFill} 
             contentFit="cover"
           />
        ) : (
          // Live Camera Mode
          Platform.OS !== 'web' ? (
            <CameraView 
                ref={cameraRef}
                style={StyleSheet.absoluteFill} 
                facing="front" 
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800' }} 
                style={StyleSheet.absoluteFill} 
                contentFit="cover"
              />
              <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
            </View>
          )
        )}

        {/* Smart Silhouette Guide (Only in Live Mode) */}
        {!capturedImage && (
            <View style={styles.silhouetteContainer} pointerEvents="none">
                <Image 
                    source={require('@/assets/images/icon.png')} // Fallback if no specific silhouette asset
                    style={[styles.silhouette, { opacity: 0.1, tintColor: '#fff' }]}
                    contentFit="contain"
                />
                <Text style={styles.guideText}>Alinea tu cuerpo aquí</Text>
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
            <View style={[styles.pulseDot, capturedImage && { backgroundColor: '#4ADE80' }]} />
            <Text style={styles.arStatusText}>
                {capturedImage ? 'ESTUDIO FOTO' : 'AR LIVE'}
            </Text>
          </View>
          <Pressable style={styles.iconBtn} onPress={() => {
              // Reset transformations
              translateX.value = withSpring(0);
              translateY.value = withSpring(0);
              scale.value = withSpring(0.8);
              rotation.value = withSpring(0);
          }}>
            <BlurView intensity={40} tint="dark" style={styles.iconBlur}>
              <Ionicons name="refresh" size={20} color="#FFF" />
            </BlurView>
          </Pressable>
        </View>

        {/* AR Overlay Area with Advanced Gestures */}
        <View style={styles.arArea}>
          {selectedProduct && (
            <PanGestureHandler ref={panRef} onGestureEvent={onPanGesture} simultaneousHandlers={[pinchRef, rotationRef]}>
              <Animated.View>
                <RotationGestureHandler ref={rotationRef} onGestureEvent={onRotateGesture} simultaneousHandlers={[panRef, pinchRef]}>
                    <Animated.View>
                        <PinchGestureHandler ref={pinchRef} onGestureEvent={onPinchGesture} simultaneousHandlers={[panRef, rotationRef]}>
                        <Animated.View style={[{ width: 300, height: 400 }, overlayAnimatedStyle]}>
                            <Image
                                source={{ uri: selectedProduct.images[0] }}
                                style={[
                                    styles.garmentOverlay, 
                                    // Apply subtle tint based on selected color if available
                                    selectedProduct.colors && selectedProduct.colors[selectedColorIndex] 
                                    ? { tintColor: selectedProduct.colors[selectedColorIndex].hex === '#FFFFFF' ? undefined : selectedProduct.colors[selectedColorIndex].hex + 'AA' } // Semi-transparent tint
                                    : {}
                                ]}
                                contentFit="contain"
                            />
                        </Animated.View>
                        </PinchGestureHandler>
                    </Animated.View>
                </RotationGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          )}
        </View>

        {/* Bottom Panel */}
        <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 20 }]}>
          
          {/* Color/Variant Selector */}
          {selectedProduct?.colors && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.colorSelectorContainer}
                style={{ marginBottom: 16 }}
              >
                  {selectedProduct.colors.map((color, index) => (
                      <Pressable
                        key={index}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedColorIndex(index);
                        }}
                        style={[
                            styles.colorDotOutline,
                            selectedColorIndex === index && { borderColor: theme.colors.primary }
                        ]}
                      >
                          <View style={[styles.colorDot, { backgroundColor: color.hex }]} />
                      </Pressable>
                  ))}
              </ScrollView>
          )}

          <View style={styles.selectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
              {arProducts.map((p) => (
                <Pressable 
                  key={p.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedProduct(p);
                    setSelectedColorIndex(0); // Reset color on product change
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
                colors={capturedImage ? ['#FF453A', '#FF9F0A'] : theme.colors.gradient.primary}
                style={styles.captureGradient}
              />
              <View style={styles.captureInner}>
                 {isProcessing && <ActivityIndicator color="#FFF" />}
                 {capturedImage && !isProcessing && <Ionicons name="close" size={30} color="#FFF" />}
              </View>
            </Pressable>

            <Pressable style={styles.sideBtn}>
              <Ionicons name="share-social-outline" size={24} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* UI Overlay Tips */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.gestureHint}>
          <BlurView intensity={30} tint="dark" style={styles.hintBlur}>
            <Ionicons name="hand-left-outline" size={14} color="#AAA" />
            <Text style={styles.hintText}>
                {capturedImage ? 'Ajusta la prenda sobre tu foto' : 'Congela la imagen para mayor precisión'}
            </Text>
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
  silhouetteContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  silhouette: {
    width: '80%',
    height: '60%',
  },
  guideText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 20,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
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
    opacity: 0.95,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)', // Subtle gradient background could be better
  },
  colorSelectorContainer: {
    paddingHorizontal: 24,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
  },
  colorDotOutline: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
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