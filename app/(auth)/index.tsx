import { useUserStore } from '@/src/store/useUserStore';
import { theme } from '@/src/theme';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// --- Typed Props for CustomAuthInput ---
interface CustomAuthInputProps {
  label?: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ReactNode;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

// --- Custom Auth Input matching the design ---
// --- Animated Border Input (Surprising but Simple) ---
const CustomAuthInput = ({ 
  label, 
  placeholder, 
  secureTextEntry, 
  value, 
  onChangeText,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: CustomAuthInputProps) => {
  const isFocused = useSharedValue(0);
  const [secure, setSecure] = useState(secureTextEntry);

  // Continuous shimmer animation for border
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    // Infinite breathing loop
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Base focus transition
    const borderColor = interpolateColor(
      isFocused.value,
      [0, 1],
      [theme.colors.auth?.border || '#2C333A', theme.colors.auth?.text || '#C7D1DB']
    );
    
    // Background shift
    const bg = interpolateColor(
      isFocused.value,
      [0, 1],
      [theme.colors.auth?.surface || '#161A1D', theme.colors.auth?.background || '#101214']
    );

    // Subtle glow opacity pulse when focused
    const shadowOpacity = interpolate(isFocused.value * shimmer.value, [0, 1], [0, 0.5]);

    return { 
      borderColor, 
      backgroundColor: bg,
      shadowColor: theme.colors.auth?.text,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity,
      shadowRadius: 10,
      elevation: isFocused.value ? 5 : 0
    };
  });

  return (
    <View className="mb-5 w-full">
      {label && (
        <Text style={{ color: theme.colors.auth?.text }} className="mb-2 text-sm font-medium ml-1">
          {label}
        </Text>
      )}
      <Animated.View 
        style={[animatedStyle, { borderWidth: 1, borderRadius: 12 }]}
        className="h-14 flex-row items-center px-4 relative overflow-hidden"
      >
        <TextInput
          className="flex-1 text-base font-light h-full"
          style={{ color: theme.colors.auth?.text }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.auth?.secondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          onFocus={() => (isFocused.value = withTiming(1))}
          onBlur={() => (isFocused.value = withTiming(0))}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Feather name={secure ? 'eye' : 'eye-off'} size={18} color={theme.colors.auth?.secondary} />
          </TouchableOpacity>
        )}

        {!secureTextEntry && icon && (
             <View className="ml-2">
                {icon}
             </View>
        )}
      </Animated.View>
    </View>
  );
};


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useUserStore();
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    // Validación básica de campos
    if (!email || !password || (!isLogin && !fullName)) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }
    
    // Validación de password
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
            if (error.message.includes('Email not confirmed')) {
                throw new Error('Tu correo no ha sido confirmado. Por favor revisa tu bandeja de entrada o spam.');
            }
            throw error;
        }
        router.replace('/(tabs)');
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        Alert.alert(
            '¡Cuenta Creada!', 
            'Hemos enviado un enlace de confirmación a tu correo. Debes confirmarlo antes de iniciar sesión.',
            [{ text: 'Entendido', onPress: () => setIsLogin(true) }]
        );
      }
    } catch (error: any) {
      Alert.alert('Atención', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.auth?.background }}>
      {/* Split Screen Logic specifically for Mobile? 
          The user wanted the image. On mobile, we often just create a top header or background.
          Let's do a top header image (30-40% height) with gradient fade, then the form below.
      */}
      
      <View style={{ height: height * 0.35, width: '100%', position: 'relative' }}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/7102037/pexels-photo-7102037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        {/* Overlay Gradient to blend into background */}
        <LinearGradient
            colors={['transparent', theme.colors.auth?.background || '#101214']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
        />
        <View style={{ position: 'absolute',  inset: 0, backgroundColor: 'rgba(16, 18, 20, 0.4)'}} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, marginTop: -40 }} // Pull up slightly
      >
        <ScrollView 
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.springify().damping(15)}>
            
            {/* Header Text - Premium Minimalist */}
            <View className="mb-12 mt-4">
              <Text style={{ color: theme.colors.auth?.heading }} className="text-5xl font-thin mb-2 tracking-tighter uppercase">
                {isLogin ? 'Acceder' : 'Registro'}
              </Text>
              <Text style={{ color: theme.colors.auth?.secondary }} className="text-sm font-light tracking-widest uppercase opacity-60">
                {isLogin ? 'Bienvenido de vuelta' : 'Nueva Cuenta Elite'}
              </Text>
            </View>

            {/* Form - Clean & Spaced */}
            <View className="gap-6">
                {!isLogin && (
                    <CustomAuthInput
                        placeholder="NOMBRE COMPLETO"
                        value={fullName}
                        onChangeText={setFullName}
                        icon={<Feather name="user" size={18} color={theme.colors.auth?.secondary} />}
                    />
                )}
                <CustomAuthInput
                    placeholder="CORREO ELECTRÓNICO"
                    value={email}
                    onChangeText={setEmail}
                    icon={<Feather name="mail" size={18} color={theme.colors.auth?.secondary} />}
                />
                <CustomAuthInput
                    placeholder="CONTRASEÑA"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity className="mt-6 mb-10">
                <Text style={{ color: theme.colors.auth?.text }} className="text-right text-xs font-light tracking-wider opacity-60">
                    ¿OLVIDASTE TU CLAVE?
                </Text>
            </TouchableOpacity>

            {/* Main Action Button - Premium */}
            <TouchableOpacity
                onPress={handleAuth}
                disabled={loading}
                className="overflow-hidden rounded-none h-16 items-center justify-center relative shadow-2xl"
                style={{ 
                    backgroundColor: theme.colors.auth?.text, // High contrast button (Light on Dark)
                }}
            >
                 {loading ? (
                     <ActivityIndicator color={theme.colors.auth?.background} />
                 ) : (
                     <View className="flex-row items-center justify-between w-full px-8">
                        <Text style={{ color: theme.colors.auth?.background }} className="text-base font-bold tracking-[4px] uppercase">
                            {isLogin ? 'INGRESAR' : 'REGISTRARSE'}
                        </Text>
                        <Feather name="arrow-right" size={20} color={theme.colors.auth?.background} />
                     </View>
                 )}
            </TouchableOpacity>

            {/* Toggle Login/Register - Minimal */}
            <View className="flex-row justify-center mt-12 items-center opacity-80">
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="py-2 px-4">
                    <Text style={{ color: theme.colors.auth?.secondary }} className="font-light text-xs tracking-[2px] uppercase text-center">
                        {isLogin ? "Crear una cuenta nueva" : "Volver a Iniciar Sesión"}
                    </Text>
                </TouchableOpacity>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
