// app/(tabs)/profile.tsx - Premium Refined Version
import { GlassCard } from '@/src/components/ui';
import { useUserStore } from '@/src/store';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, measurements, stats } = useUserStore();

  const menuSections = [
    {
      title: 'CUENTA EXCLUSIVA',
      items: [
        { icon: 'bag-handle-outline', label: 'Historial de Compras', value: stats.totalOrders.toString() },
        { icon: 'heart-outline', label: 'Mis Favoritos', value: favorites.length.toString() },
        { icon: 'map-outline', label: 'Direcciones Guardadas', value: '2' },
      ]
    },
    {
      title: 'PREFERENCIAS',
      items: [
        { icon: 'notifications-outline', label: 'Notificaciones VIP' },
        { icon: 'shield-checkmark-outline', label: 'Privacidad y Seguridad' },
        { icon: 'language-outline', label: 'Idioma', value: 'Español' },
      ]
    }
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={theme.colors.gradient.primary}
            style={styles.avatarGradient}
          />
          <View style={styles.avatarBorder}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.vipBadge}>
            <Ionicons name="sparkles" size={10} color="#000" />
            <Text style={styles.vipText}>VIP</Text>
          </View>
        </View>
        <Text style={styles.name}>Alexandra Wegner</Text>
        <Text style={styles.email}>alexandra@vogue.elite</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.totalOrders}</Text>
            <Text style={styles.statLab}>PEDIDOS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{favorites.length}</Text>
            <Text style={styles.statLab}>DESEOS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats.arTriesCount}</Text>
            <Text style={styles.statLab}>PRUEBAS AR</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>PERFIL BIOMÉTRICO</Text>
        <Pressable onPress={() => router.push('/calibration')}>
          <GlassCard variant="highlight" style={styles.measurementsCard}>
            <View style={styles.measureCardContent}>
              <View style={styles.measureIcon}>
                <Ionicons name="body-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.measureInfo}>
                <Text style={styles.measureTitle}>
                  {measurements ? 'Medidas Actualizadas' : 'Configurar Biometría'}
                </Text>
                <Text style={styles.measureSub}>
                  {measurements 
                    ? `Basado en ${measurements.height}cm altura y ${measurements.weight}kg`
                    : 'Obtén el ajuste perfecto con nuestro escaneo virtual.'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textDimmed} />
            </View>
          </GlassCard>
        </Pressable>

        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => (
                <Pressable 
                  key={i} 
                  style={[styles.menuItem, i === section.items.length - 1 && styles.noBorder]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    if (item.label === 'Mis Favoritos') router.push('/catalog');
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconBox}>
                      <Ionicons name={item.icon as any} size={20} color={theme.colors.textSecondary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textDimmed} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Pressable style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Cerrar Sesión Elite</Text>
        </Pressable>
        <Text style={styles.version}>Virtual Vogue Premium v2.0.1</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 30,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 104,
    height: 104,
    borderRadius: 52,
    position: 'absolute',
    top: -2,
    left: -2,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.background,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  vipBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.background,
    gap: 4,
  },
  vipText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
  },
  statLab: {
    fontSize: 9,
    fontWeight: '900',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  content: {
    padding: theme.spacing.md,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.textDimmed,
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 20,
  },
  measurementsCard: {
    padding: 12,
  },
  measureCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  measureInfo: {
    flex: 1,
    marginLeft: 16,
  },
  measureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  measureSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  menuSection: {
    marginTop: 10,
  },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  logoutBtn: {
    marginTop: 32,
    alignItems: 'center',
    padding: 16,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    color: theme.colors.error,
    fontWeight: 'bold',
    fontSize: 14,
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 10,
    color: theme.colors.textDimmed,
    letterSpacing: 1,
  },
});
