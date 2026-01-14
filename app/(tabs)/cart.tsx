// app/(tabs)/cart.tsx - Premium Refined Version
import { AnimatedButton, GlassCard } from '@/src/components/ui';
import { useCartStore } from '@/src/store';
import { theme } from '@/src/theme';
import type { CartItem } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
    FadeInDown,
    Layout,
    SlideOutLeft
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [promoInput, setPromoInput] = React.useState('');

  const {
    items,
    itemCount,
    subtotal,
    discount,
    total,
    promoCode,
    promoDiscount,
    updateQuantity,
    removeItem,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useCartStore();

  const handleCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      '🌟 Pedido Exitoso',
      'Tu selección exclusiva está en camino. Recibirás una confirmación VIP en tu email.',
      [{ text: 'Entendido', onPress: () => clearCart() }]
    );
  };

  const renderCartItem = useCallback(
    ({ item, index }: { item: CartItem; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 60).springify()}
        exiting={SlideOutLeft}
        layout={Layout.springify()}
      >
        <Swipeable
          renderRightActions={() => (
            <Pressable
              style={styles.deleteAction}
              onPress={() => removeItem(item.product.id, item.size, item.color)}
            >
              <Ionicons name="trash-outline" size={24} color="#FFF" />
            </Pressable>
          )}
        >
          <View style={styles.cartItem}>
            <Image
              source={{ uri: item.product.images[0] }}
              style={styles.itemImage}
              contentFit="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemBrand}>{item.product.brand}</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
              <View style={styles.itemMeta}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaText}>{item.size}</Text>
                </View>
                <View style={[styles.colorDot, { backgroundColor: item.product.colors.find(c => c.name === item.color)?.hex || '#CCC' }]} />
              </View>
              <Text style={styles.itemPrice}>S/ {item.product.price.toFixed(2)}</Text>
            </View>

            <View style={styles.quantityContainer}>
              <Pressable 
                style={styles.qBtn} 
                onPress={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
              >
                <Ionicons name="remove" size={16} color={theme.colors.textSecondary} />
              </Pressable>
              <Text style={styles.qText}>{item.quantity}</Text>
              <Pressable 
                style={styles.qBtn}
                onPress={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
              >
                <Ionicons name="add" size={16} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>
        </Swipeable>
      </Animated.View>
    ),
    [removeItem, updateQuantity]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Bolsa <Text style={styles.titleThin}>Compra</Text></Text>
        <BlurView intensity={20} tint="dark" style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount} items</Text>
        </BlurView>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-handle-outline" size={80} color={theme.colors.textDimmed} />
          <Text style={styles.emptyTitle}>Tu bolsa está vacía</Text>
          <Text style={styles.emptySub}>Explora las últimas tendencias y llena tu mundo de estilo.</Text>
          <AnimatedButton
            title="Explorar Ahora"
            onPress={() => router.push('/catalog')}
            variant="primary"
            style={{ marginTop: 24, paddingHorizontal: 40 }}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => `${item.product.id}-${item.size}-${item.color}`}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={styles.footer}>
                <GlassCard style={styles.promoCard}>
                  <Text style={styles.footerLabel}>CÓDIGO DE CORTESÍA</Text>
                  <View style={styles.promoInputRow}>
                    <TextInput
                      style={styles.promoInput}
                      placeholder="Ingresa tu código"
                      placeholderTextColor={theme.colors.textDimmed}
                      value={promoInput}
                      onChangeText={setPromoInput}
                      autoCapitalize="characters"
                    />
                    <Pressable 
                      style={styles.applyBtn}
                      onPress={() => {
                        if (applyPromoCode(promoInput)) {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          setPromoInput('');
                        } else {
                          Alert.alert('Código inválido', 'Por favor verifica tu código de descuento.');
                        }
                      }}
                    >
                      <Text style={styles.applyText}>Aplicar</Text>
                    </Pressable>
                  </View>
                  {promoCode && (
                    <View style={styles.promoApplied}>
                      <Text style={styles.promoCodeText}>{promoCode} Activado</Text>
                      <Pressable onPress={removePromoCode}>
                        <Ionicons name="close-circle" size={18} color={theme.colors.secondary} />
                      </Pressable>
                    </View>
                  )}
                </GlassCard>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>S/ {subtotal.toFixed(2)}</Text>
                  </View>
                  {discount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.discountLabel}>Cortesía</Text>
                      <Text style={styles.discountValue}>-S/ {discount.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Envío Express</Text>
                    <Text style={styles.freeText}>GRATIS</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL</Text>
                    <Text style={styles.totalValue}>S/ {total.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            }
          />
          <View style={[styles.checkoutContainer, { paddingBottom: insets.bottom + 20 }]}>
            <AnimatedButton
              title="Finalizar Pedido"
              onPress={handleCheckout}
              size="lg"
              fullWidth
              icon={<Ionicons name="chevron-forward" size={18} color="#FFF" />}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -1,
  },
  titleThin: {
    fontWeight: '200',
    color: theme.colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  badgeText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 200,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemImage: {
    width: 80,
    height: 100,
    borderRadius: theme.radius.lg,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  itemBrand: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  itemName: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  metaBadge: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  itemPrice: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '800',
    marginTop: 4,
  },
  quantityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    paddingHorizontal: 4,
    gap: 4,
  },
  qBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteAction: {
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: theme.radius.xl,
    marginLeft: 10,
    marginBottom: 12,
  },
  footer: {
    marginTop: 20,
    gap: 16,
  },
  promoCard: {
    padding: 16,
  },
  footerLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    color: theme.colors.text,
    fontSize: 14,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  applyBtn: {
    backgroundColor: theme.colors.text,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
  },
  applyText: {
    color: theme.colors.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  promoApplied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  promoCodeText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  discountLabel: {
    color: theme.colors.secondary,
    fontSize: 14,
  },
  discountValue: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  freeText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: '900',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 16,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 20,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
});
