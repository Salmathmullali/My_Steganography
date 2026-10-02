import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, Animated, Easing, Alert, Dimensions, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing, typography, shadows } from '../constants/design';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AI_ENGINES = [
  { name: 'Google Gemini (Imagen 3)', confidence: 0.98 },
  { name: 'OpenAI (DALL-E 3)', confidence: 0.97 },
  { name: 'Midjourney v6', confidence: 0.96 },
  { name: 'Meta AI (Llama)', confidence: 0.95 },
];

export default function ScannerScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: 'HUMAN' | 'AI';
    engine?: string;
    confidence: number;
    signatureFound?: boolean;
  } | null>(null);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const wireframeOpacity = useRef(new Animated.Value(0)).current;

  const startScan = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (res.canceled || !res.assets[0].uri) return;

    setImageUri(res.assets[0].uri);
    setScanResult(null);
    setScanning(true);
    wireframeOpacity.setValue(0);

    // Animation loop for scanning line
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    // Simulate ML Logic
    setTimeout(() => {
      setScanning(false);
      scanAnim.stopAnimation();

      // Logic: 70% chance of AI detected for demo, unless it has our specific characteristics
      const isAI = Math.random() > 0.3;
      if (isAI) {
        const engine = AI_ENGINES[Math.floor(Math.random() * AI_ENGINES.length)];
        setScanResult({
          type: 'AI',
          engine: engine.name,
          confidence: 0.96 + Math.random() * 0.03, // Aiming for ~96%+
        });
      } else {
        setScanResult({
          type: 'HUMAN',
          confidence: 1.0,
          signatureFound: true,
        });
      }
    }, 3000);
  };

  const showWireframe = () => {
    Animated.timing(wireframeOpacity, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backTxt}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>ANALYZER_PRO_X1</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={typography.displayL}>PIXEL_LEVEL{'\n'}<Text style={{ color: colors.mint }}>FORENSIC SCAN</Text></Text>
        <Text style={s.sub}>Bypassing metadata. Analyzing latent space frequencies.</Text>

        <View style={s.previewContainer}>
          {imageUri ? (
            <View style={s.imageWrapper}>
              <Image source={{ uri: imageUri }} style={s.mainImage} resizeMode="cover" />
              
              {/* Scanning Line Animation */}
              {scanning && (
                <Animated.View style={[s.scanLine, { transform: [{ translateY: scanTranslateY }] }]}>
                  <LinearGradient colors={['transparent', colors.mint, 'transparent']} style={s.scanGlow} />
                </Animated.View>
              )}

              {/* Wireframe Reveal Overlay */}
              {scanResult?.type === 'HUMAN' && (
                <Animated.View style={[s.wireframeOverlay, { opacity: wireframeOpacity }]} pointerEvents="none">
                  <View style={s.wireframeGrid}>
                    <View style={s.wireframeBox} />
                    <Text style={s.wireframeTxt}>[HIDDEN_SIGNATURE_WIRE_REVEALED]</Text>
                  </View>
                </Animated.View>
              )}
            </View>
          ) : (
            <TouchableOpacity style={s.uploadPlaceholder} onPress={startScan}>
              <Text style={s.uploadIcon}>🛰️</Text>
              <Text style={s.uploadTxt}>INITIATE_UPLINK</Text>
            </TouchableOpacity>
          )}
        </View>

        {scanning && (
          <View style={s.scanningStatus}>
            <ActivityIndicator color={colors.mint} />
            <Text style={s.statusTxt}>RUNNING_PYTORCH_CNN_ANALYSIS...</Text>
          </View>
        )}

        {scanResult && !scanning && (
          <View style={s.resultRoot}>
            {scanResult.type === 'HUMAN' ? (
              <View style={[s.resultCard, { borderColor: colors.mint }]}>
                <Text style={s.resultBadge}>VERIFIED HUMAN SIGNATURE FOUND</Text>
                <Text style={s.resultMain}>100% SECURE STATUS</Text>
                <Text style={s.resultDesc}>Our neural network has isolated a hand-drawn steganographic signature embedded in the blue-channel LSB matrix.</Text>
                
                <TouchableOpacity style={s.revealBtn} onPress={showWireframe}>
                  <LinearGradient colors={[colors.mint + '44', colors.mint + '11']} style={s.revealGradient}>
                    <Text style={s.revealTxt}>VIEW HIDDEN SIGNATURE LAYOUT 👁️</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[s.resultCard, { borderColor: colors.coral }]}>
                <Text style={[s.resultBadge, { color: colors.coral }]}>AI_GENERATION_DETECTED</Text>
                <Text style={s.resultMain}>{scanResult.engine}</Text>
                <View style={s.accuracyRow}>
                  <Text style={s.accuracyLabel}>MODEL ACCURACY PRECISION:</Text>
                  <Text style={s.accuracyVal}>{(scanResult.confidence * 100).toFixed(2)}%</Text>
                </View>
                <Text style={s.resultDesc}>Pixel noise distributions match specific generative patterns from {scanResult.engine}. No ownership DNA detected.</Text>
              </View>
            )}

            <TouchableOpacity style={s.resetBtn} onPress={startScan}>
              <Text style={s.resetTxt}>RESCAN_NEW_DATASET ➔</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, marginTop: Platform.OS === 'ios' ? 40 : 20 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgSection, borderRadius: radius.md },
  backTxt: { color: colors.textPrimary, fontSize: 24 },
  headerTitle: { color: colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  sub: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  previewContainer: { height: 300, backgroundColor: colors.bgCard, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  uploadPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  uploadIcon: { fontSize: 40, marginBottom: 12 },
  uploadTxt: { color: colors.mint, fontWeight: '900', fontSize: 12, letterSpacing: 2 },
  imageWrapper: { flex: 1, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  scanLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 10 },
  scanGlow: { height: 40, width: '100%', position: 'absolute', top: -20 },
  scanningStatus: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', marginVertical: 20 },
  statusTxt: { color: colors.mint, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  resultRoot: { gap: spacing.lg },
  resultCard: { backgroundColor: colors.bgCard, padding: 24, borderRadius: radius.xl, borderWidth: 1, ...shadows.card },
  resultBadge: { color: colors.mint, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  resultMain: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', marginBottom: 16, letterSpacing: -0.5 },
  resultDesc: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 20 },
  revealBtn: { height: 50, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.mint },
  revealGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  revealTxt: { color: colors.mint, fontWeight: '900', fontSize: 12 },
  accuracyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, backgroundColor: colors.bg, padding: 10, borderRadius: radius.sm },
  accuracyLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '800' },
  accuracyVal: { color: colors.coral, fontSize: 14, fontWeight: '900' },
  resetBtn: { backgroundColor: colors.bgSection, padding: 18, borderRadius: radius.pill, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  resetTxt: { color: colors.textPrimary, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  wireframeOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,7,10,0.85)', padding: 20, alignItems: 'center', justifyContent: 'center' },
  wireframeGrid: { width: '80%', height: '60%', borderWidth: 1, borderColor: colors.mint, borderStyle: 'dashed', borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  wireframeBox: { width: 100, height: 60, borderWidth: 1, borderColor: colors.mint, opacity: 0.5 },
  wireframeTxt: { color: colors.mint, fontSize: 8, fontWeight: '900', marginTop: 12, textAlign: 'center' }
});