// app/(tabs)/_layout.tsx - Tab navigation for Virtual Vogue
import { useCartStore } from '@/src/store';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  badge?: number;
}

function TabIcon({ name, focused, badge }: TabIconProps) {
  const scale = useSharedValue(focused ? 1.1 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.1 : 1, theme.animation.spring) }],
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? theme.colors.primary : theme.colors.textMuted}
      />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Animated.Text style={styles.badgeText}>
            {badge > 9 ? '9+' : badge}
          </Animated.Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function TabLayout() {
  const itemCount = useCartStore((state) => state.itemCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'grid' : 'grid-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="try-on"
        options={{
          title: 'Probador AR',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'scan' : 'scan-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? 'cart' : 'cart-outline'}
              focused={focused}
              badge={itemCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: theme.colors.secondary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
});
