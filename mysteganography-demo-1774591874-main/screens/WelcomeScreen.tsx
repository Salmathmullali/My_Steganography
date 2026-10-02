import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { colors, typography, spacing, radius, shadows } from '../constants/design';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const CARD_DATA = [
  { id: 'Scan', title: 'SCAN\nIMAGE', icon: '🔍', color: colors.mint, desc: 'Detect AI & Hidden Pixels' },
  { id: 'Signature', title: 'SIGN\nIMAGE', icon: '🔏', color: colors.violet, desc: 'Embed Invisible DNA' },
  { id: 'DrawArt', title: 'DRAW\nART', icon: '🎨', color: colors.coral, desc: 'Create Custom Assets' },
  { id: 'Camera', title: 'LIVE\nCAMERA', icon: '📸', color: colors.amber, desc: 'Capture & Seal Frame' },
];

export default function WelcomeScreen({ navigation }: any) {
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = use共享Value(30);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslateY.value = withSpring(0);
    cardOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    cardTranslateY.value = withDelay(400, withSpring(0));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  return (
    <View style={s.container}>
      <View style={s.bgDecor}>
        <View style={[s.blob, s.blobA]} />
        <View style={[s.blob, s.blobB]} />
      </View>

      <Animated.View style={[s.header, headerStyle]}>
        <View style={s.logoRow}>
          <Text style={s.logoEmoji}>🧬</Text>
          <Text style={s.logoText}>MY_STEGANOGRAPHY</Text>
        </View>
        <Text style={typography.displayXL}>THE FUTURE OF{'\n'}<Text style={{ color: colors.mint }}>ART AUTHENTICITY</Text></Text>
        <Text style={s.tagline}>Advanced cryptographic layer for the generative AI era.</Text>
      </Animated.View>

      <Animated.View style={[s.cardGrid, cardsStyle]}>
        {CARD_DATA.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[s.card, { borderColor: item.color + '33' }]}
            onPress={() => navigation.navigate(item.id)}
            activeOpacity={0.7}
          >
            <View style={[s.iconBox, { backgroundColor: item.color + '15' }]}>
              <Text style={s.cardIcon}>{item.icon}</Text>
            </View>
            <View>
              <Text style={[s.cardTitle, { color: item.color }]}>{item.title}</Text>
              <Text style={s.cardDesc}>{item.desc}</Text>
            </View>
            <View style={[s.glow, { backgroundColor: item.color }]} />
          </TouchableOpacity>
        ))}
      </Animated.View>

      <TouchableOpacity 
        style={s.settingsBtn} 
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={s.settingsTxt}>⚙️ SYSTEM_CONFIG</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.bg, 
    padding: spacing.lg,
    justifyContent: 'center'
  },
  bgDecor: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  blobA: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: colors.violet,
    top: -width * 0.4,
    right: -width * 0.4,
  },
  blobB: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: colors.mint,
    bottom: -width * 0.2,
    left: -width * 0.2,
  },
  header: {
    marginBottom: spacing.xl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  logoEmoji: {
    fontSize: 24,
  },
  logoText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    ...typography.body,
    marginTop: spacing.sm,
    maxWidth: '80%',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    height: 180,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...shadows.card,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 20,
  },
  cardDesc: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  glow: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.1,
  },
  settingsBtn: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.bgSection,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsTxt: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  }
});
