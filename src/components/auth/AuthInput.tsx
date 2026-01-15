import { theme } from '@/src/theme';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

interface AuthInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Feather.glyphMap;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ 
  label, 
  icon, 
  error, 
  style, 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const progress = useSharedValue(0);
  const [secureTextEntry, setSecureTextEntry] = useState(props.secureTextEntry);

  const handleFocus = () => {
    setIsFocused(true);
    progress.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    progress.value = withTiming(0, { duration: 200 });
  };

  const containerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.auth?.border || theme.colors.border, theme.colors.text] // Glows white/primary on focus
    );

    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.auth?.surface || theme.colors.surface, theme.colors.auth?.background || theme.colors.background]
    );

    return {
      borderColor,
      backgroundColor,
    };
  });

  return (
    <View className="w-full mb-4">
      {label && (
        <Text style={{ color: theme.colors.auth?.text }} className="text-sm font-medium mb-1.5 ml-1">
          {label}
        </Text>
      )}
      
      <Animated.View 
        style={[containerStyle, { borderWidth: 1, borderRadius: theme.radius.md }]}
        className="w-full relative flex-row items-center h-14 px-4 overflow-hidden"
      >
        {/* Glow Effects (Simulated) */}
        {isFocused && (
             <View 
                className="absolute top-0 bottom-0 left-0 w-0.5 bg-white opacity-50"
             />
        )}

        {icon && (
          <Feather 
            name={icon} 
            size={20} 
            color={isFocused ? theme.colors.text : theme.colors.auth?.secondary} 
            style={{ marginRight: 12 }}
          />
        )}

        <TextInput
          className="flex-1 h-full text-base font-medium"
          style={{ color: theme.colors.auth?.text }}
          placeholderTextColor={theme.colors.auth?.secondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          {...props}
        />

        {props.secureTextEntry !== undefined && (
          <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
            <Feather 
              name={secureTextEntry ? 'eye' : 'eye-off'} 
              size={20} 
              color={theme.colors.auth?.secondary} 
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
};
