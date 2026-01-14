// app/calibration.tsx - Premium Refined Version
import { AnimatedButton, GlassCard } from '@/src/components/ui';
import { useUserStore } from '@/src/store';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CalibrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { measurements, setMeasurements } = useUserStore();

  const [height, setHeight] = useState(measurements?.height || 170);
  const [weight, setWeight] = useState(measurements?.weight || 65);
  const [bust, setBust] = useState(measurements?.bust || 90);
  const [waist, setWaist] = useState(measurements?.waist || 70);
  const [hips, setHips] = useState(measurements?.hips || 95);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMeasurements({ height, weight, bust, waist, hips });
    router.back();
  };

  const MeasurementSlider = ({ 
    label, 
    value, 
    setValue, 
    min, 
    max, 
    unit, 
    icon 
  }: any) => (
    <View style={styles.sliderSection}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderLabelGroup}>
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
          <Text style={styles.sliderLabel}>{label}</Text>
        </View>
        <Text style={styles.sliderValue}>{value} <Text style={styles.unit}>{unit}</Text></Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={setValue}
        onSlidingStart={() => Haptics.selectionAsync()}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.text}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text style={styles.title}>Biometría <Text style={styles.titleThin}>Digital</Text></Text>
          <Text style={styles.subtitle}>
            Calibra tu gemelo digital para obtener recomendaciones de talla con precisión élite.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.content}>
          <GlassCard style={styles.mainCard}>
            <MeasurementSlider 
              label="Altura" icon="resize-outline" value={height} setValue={setHeight} min={140} max={210} unit="cm" 
            />
            <MeasurementSlider 
              label="Peso" icon="speedometer-outline" value={weight} setValue={setWeight} min={40} max={150} unit="kg" 
            />
            <View style={styles.divider} />
            <MeasurementSlider 
              label="Pecho" icon="ellipse-outline" value={bust} setValue={setBust} min={70} max={130} unit="cm" 
            />
            <MeasurementSlider 
              label="Cintura" icon="remove-outline" value={waist} setValue={setWaist} min={50} max={110} unit="cm" 
            />
            <MeasurementSlider 
              label="Cadera" icon="sync-outline" value={hips} setValue={setHips} min={70} max={130} unit="cm" 
            />
          </GlassCard>

          <View style={styles.tipsSection}>
            <Text style={styles.tipsLabel}>CONSEJOS ELITE</Text>
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={16} color={theme.colors.accent} />
              <Text style={styles.tipText}>Mide tu cuerpo con ropa ligera o ropa interior.</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="analytics-outline" size={16} color={theme.colors.accent} />
              <Text style={styles.tipText}>Usa una cinta métrica flexible para mayor precisión.</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        <AnimatedButton
          title="Guardar Perfil Biométrico"
          onPress={handleSave}
          size="lg"
          fullWidth
        />
        <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Omitir por ahora</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 150,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -1.5,
  },
  titleThin: {
    fontWeight: '200',
    color: theme.colors.textSecondary,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: 10,
    lineHeight: 22,
  },
  content: {
    gap: 24,
  },
  mainCard: {
    padding: 20,
  },
  sliderSection: {
    marginBottom: 20,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
  },
  unit: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '400',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
    opacity: 0.5,
  },
  tipsSection: {
    gap: 12,
  },
  tipsLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.textDimmed,
    letterSpacing: 2,
    marginBottom: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
