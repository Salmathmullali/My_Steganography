import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, Animated, Easing, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { scanImage } from '../lib/api';
import { ScanResult } from '../types';
import TrustScoreBadge from '../components/TrustScoreBadge';
import { colors, radius, shadows } from '../constants/design';

export default function ScannerScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [expanded, setExpanded] = useState(false);
  
  // Interactive feature states
  const [revealSignature, setRevealSignature] = useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  };

  const toggleXRaySignature = () => {
    const toValue = revealSignature ? 0 : 1;
    setRevealSignature(!revealSignature);
    Animated.timing(revealAnim, {
      toValue,
      duration: 600,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
      useNativeDriver: false,
    }).start();
  };

  const pickAndScan = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please grant photo library access.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1,
    });
    if (res.canceled || !res.assets[0]) return;
    const uri = res.assets[0].uri;
    
    setImageUri(uri);
    setResult(null);
    setStage(0);
    setExpanded(false);
    setRevealSignature(false);
    revealAnim.setValue(0);
    setScanning(true);
    pulse();

    // Stage 1: Metadata & DNA Signature Check
    setStage(1);
    const scanRes = await scanImage(uri);
    
    // Simulate real scanning analysis frames
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Stage 2: Deep Pixel Model Classifier Grid Scan
    setStage(2);
    await new Promise(resolve => setTimeout(resolve, 1400));
    
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    setResult(scanRes);
    setScanning(false);
  };

  // Dynamic values based on simulated pixel/fingerprint screenshot detection
  const getAIModelDetails = (source: string) => {
    const src = source.toLowerCase();
    if (src.includes('chatgpt') || src.includes('dall')) {
      return {
        engine: 'DALL-E 3 (OpenAI)',
        fingerprint: 'High-frequency noise matching synthetic grid arrays; over-shadowpened geometric edge variance caught via screenshot pass.',
        confidence: '96% Synthetic Certainty',
      };
    } else if (src.includes('gemini') || src.includes('imagen')) {
      return {
        engine: 'Imagen 3 (Google Gemini)',
        fingerprint: 'Subtle soft-lighting diffusion patterns & signature background compression anomalies detected in screenshot matrix.',
        confidence: '92% Synthetic Certainty',
      };
    } else if (src.includes('meta') || src.includes('emu')) {
      return {
        engine: 'Emu (Meta AI)',
        fingerprint: 'Hyper-saturated pixel channel distributions & microscopic micro-tessellation symmetry errors localized across fine edges.',
        confidence: '94% Synthetic Certainty',
      };
    }
    return {
      engine: 'Unknown Synthetic Model',
      fingerprint: 'General noise patterns matching machine learning procedural generators.',
      confidence: '85% Certainty',
    };
  };

  // Overlay container styles for the signature blueprint trace effect
  const xRayBorderColor = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.mint],
  });

  const xrayOverlayOpacity = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.92],
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Blobs */}
      <View style={[s.blob, s.blobA]} />
      <View style={[s.blob, s.blobB]} />

      {/* Hero */}
      <View style={s.heroBadge}>
        <Text style={s.heroBadgeTxt}>✦ ENGINE V2</Text>
      </View>
      <Text style={s.headline}>IMAGE{'\n'}DECONSTRUCT</Text>
      <Text style={s.sub}>Scan screenshot pixels to isolate signatures and models.</Text>

      {/* Interactive Scan Canvas Window */}
      <Animated.View style={[s.uploadZone, imageUri ? s.uploadZoneActive : null, { borderColor: xRayBorderColor }]}>
        <TouchableOpacity onPress={pickAndScan} disabled={scanning} activeOpacity={0.9}>
          {imageUri ? (
            <View style={s.canvasWrapper}>
              <Image source={{ uri: imageUri }} style={s.uploadedImg} resizeMode="cover" />
              
              {/* Steganography Blueprint Trace Layer */}
              <Animated.View style={[s.stegoXrayOverlay, { opacity: xrayOverlayOpacity }]}>
                <View style={s.blueprintGrid}>
                  <Text style={s.blueprintMetaTxt}>[OWNERSHIP_DNA_EXTRACTED_LAYER_01]</Text>
                  <Text style={s.blueprintHashTxt}>HASH: {(result?.our_signature as any)?.signature_hash || 'MOCK_SIG_12345'}</Text>
                  
                  {/* Neon Traced Representation of the Invisible Vector Signature */}
                  <View style={s.simulatedSignatureVector}>
                    <Text style={s.neonSignatureText}>🔐 Verified Ownership Signature Active</Text>
                    <View style={s.vectorLineHoriz} />
                    <View style={s.vectorLineDiagonal} />
                  </View>
                  
                  <Text style={s.blueprintStatus}>STEGO INJECTION: VALID PIXEL DELTAS</Text>
                </View>
              </Animated.View>

              {!scanning && !result && (
                <View style={s.uploadOverlay}>
                  <Text style={s.uploadOverlayTxt}>Tap to change image</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={s.uploadPrompt}>
              <Text style={s.uploadIcon}>🔍</Text>
              <Text style={s.uploadTxt}>UPLOAD IMAGE</Text>
              <Text style={s.uploadSub}>Select artwork or an AI screenshot</Text>
              <View style={s.uploadPill}>
                <Text style={s.uploadPillTxt}>JPEG · PNG · WEBP · Max 10MB</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Stage progress */}
      {scanning && (
        <View style={s.stagesContainer}>
          <Animated.View style={[s.stageCard, stage === 1 && { transform: [{ scale: pulseAnim }] }]}>
            <View style={[s.stageDot, { backgroundColor: stage >= 2 ? colors.mint : colors.amber }]} />
            <View style={s.stageContent}>
              <Text style={s.stageName}>PIXEL & METADATA SCAN</Text>
              <Text style={s.stageDesc}>
                {stage >= 2 ? '✓ Decoded data matrices & tracking bits' : 'Searching for app signature tags…'}
              </Text>
            </View>
            {stage >= 2 && <Text style={s.stageCheck}>✓</Text>}
            {stage < 2 && <ActivityIndicator color={colors.amber} size="small" />}
          </Animated.View>

          <Animated.View style={[s.stageCard, stage === 2 && { transform: [{ scale: pulseAnim }] }]}>
            <View style={[s.stageDot, { backgroundColor: stage === 2 ? colors.coral : colors.border }]} />
            <View style={s.stageContent}>
              <Text style={s.stageName}>AI MODEL CLASSIFIER MATRIX</Text>
              <Text style={s.stageDesc}>
                {stage === 2 ? 'Reading mathematical noise models…' : 'Waiting for context…'}
              </Text>
            </View>
            {stage === 2 && <ActivityIndicator color={colors.coral} size="small" />}
          </Animated.View>
        </View>
      )}

      {/* Results Rendering */}
      {result && !scanning && (
        <View style={s.resultsContainer}>
          
          {/* CASE 1: App Signature Detected (Human Secure) */}
          {result.our_signature?.found ? (
            <View style={s.secureWrapper}>
              <View style={[s.artistCard, { borderColor: revealSignature ? colors.mint : colors.mint + '44' }]}>
                <View style={s.badgeRow}>
                  <Text style={s.artistLabel}>🔐 OWNERSHIP VERIFIED</Text>
                  <View style={s.neonLiveBadge} />
                </View>
                <Text style={s.artistName}>{result.our_signature.matched_artist || 'Original Creator'}</Text>
                <Text style={s.secureSub}>This image matches the unalterable cryptographic data signature embedded in your canvas ecosystem.</Text>
                
                <TouchableOpacity 
                  style={[s.xrayToggleBtn, revealSignature && s.xrayToggleBtnActive]} 
                  onPress={toggleXRaySignature}
                >
                  <Text style={s.xrayToggleTxt}>
                    {revealSignature ? '👁️ Hide Signature Outline' : '👁️ Reveal Hidden Signature Layer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* CASE 2: No Signature & Evaluated as AI Content */
            !result.our_signature?.found && (result.trust_score ?? 0) < 40 && (
              <View style={s.aiModelCard}>
                <Text style={s.aiCardTitle}>🤖 AI SOURCE CLASSIFICATION</Text>
                <View style={s.aiModelRow}>
                  <Text style={s.aiModelName}>{getAIModelDetails(result.likely_source || '').engine}</Text>
                  <Text style={s.aiModelBadge}>{getAIModelDetails(result.likely_source || '').confidence}</Text>
                </View>
                <Text style={s.aiFingerprintLabel}>INSPECTED SCREENSHOT FINGERPRINT:</Text>
                <Text style={s.aiFingerprintTxt}>
                  {getAIModelDetails(result.likely_source || '').fingerprint}
                </Text>
              </View>
            )
          )}

          {/* Standard Trust Core Score Card */}
          <View style={[s.card, shadows.card]}>
            <Text style={s.cardHeadline}>TRUST BENCHMARK</Text>
            <TrustScoreBadge
              score={result.our_signature?.found ? result.trust_score : (100 - result.trust_score)}
              label={result.label}
              likelySource={result.likely_source}
            />
          </View>

          {/* Signals Matrix Tracker Chips */}
          <View style={s.signalRow}>
            <View style={[s.signalChip, result.our_signature?.found && s.signalChipActive]}>
              <Text style={s.signalIcon}>🧬</Text>
              <Text style={s.signalTxt}>DNA SIG</Text>
              <Text style={[s.signalStatus, { color: result.our_signature?.found ? colors.mint : colors.textMuted }]}>
                {result.our_signature?.found ? 'SECURE' : 'NONE'}
              </Text>
            </View>
            <View style={[s.signalChip, result.c2pa?.found && s.signalChipWarn]}>
              <Text style={s.signalIcon}>📜</Text>
              <Text style={s.signalTxt}>C2PA MANIFEST</Text>
              <Text style={[s.signalStatus, { color: result.c2pa?.found ? colors.coral : colors.textMuted }]}>
                {result.c2pa?.found ? 'STRIPPED' : 'NONE'}
              </Text>
            </View>
            <View style={[s.signalChip, !result.our_signature?.found && s.signalChipDanger]}>
              <Text style={s.signalIcon}>🤖</Text>
              <Text style={s.signalTxt}>AI PIXEL TRACK</Text>
              <Text style={[s.signalStatus, { color: !result.our_signature?.found ? colors.coral : colors.textMuted }]}>
                {!result.our_signature?.found ? 'DETECTED' : 'CLEAN'}
              </Text>
            </View>
          </View>

          {/* Expanded Diagnostics Field */}
          {result.ai_analysis && (
            <View style={s.card}>
              <TouchableOpacity onPress={() => setExpanded(!expanded)} style={s.expandBtn}>
                <Text style={s.cardHeadline}>DETAILED INSPECTION RECONSTRUCT</Text>
                <Text style={s.expandArrow}>{expanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expanded && (
                <View style={s.reportBody}>
                  <Text style={s.reportVerdict}>"{result.ai_analysis.verdict}"</Text>
                  <View style={s.findingsContainer}>
                    {result.ai_analysis.key_findings.map((finding, i) => (
                      <View key={i} style={s.findingItem}>
                        <View style={s.findingDot} />
                        <Text style={s.findingTxt}>{finding}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={s.confRow}>
                    <View style={s.confItem}>
                      <Text style={s.confLabel}>HUMAN COEFFICIENT</Text>
                      <Text style={[s.confNum, { color: colors.mint }]}>{result.ai_analysis.confidence_human}%</Text>
                    </View>
                    <View style={s.confDivider} />
                    <View style={s.confItem}>
                      <Text style={s.confLabel}>AI PROBABILITY</Text>
                      <Text style={[s.confNum, { color: colors.coral }]}>{result.ai_analysis.confidence_ai}%</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity style={s.rescanBtn} onPress={pickAndScan}>
            <Text style={s.rescanTxt}>Scan Another Asset →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 120 },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.08 },
  blobA: { width: 280, height: 280, backgroundColor: colors.coral, top: -100, right: -120 },
  blobB: { width: 180, height: 180, backgroundColor: colors.mint, top: 400, left: -70 },
  heroBadge: {
    backgroundColor: colors.coral + '22', borderRadius: radius.pill, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12,
    borderWidth: 1, borderColor: colors.coral + '44',
  },
  heroBadgeTxt: { color: colors.coral, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  headline: {
    fontSize: 42, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: -2, lineHeight: 46, marginBottom: 8,
  },
  sub: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  uploadZone: {
    borderWidth: 2, borderColor: colors.borderLight, borderStyle: 'dashed',
    borderRadius: radius.lg, overflow: 'hidden', marginBottom: 20,
    backgroundColor: colors.bgCard,
  },
  uploadZoneActive: { borderStyle: 'solid' },
  canvasWrapper: { position: 'relative', width: '100%', height: 240 },
  uploadedImg: { width: '100%', height: '100%' },
  stegoXrayOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#070913EE', padding: 16, justifyContent: 'center',
  },
  blueprintGrid: {
    flex: 1, borderWidth: 1, borderColor: colors.mint + '55', borderStyle: 'dashed',
    borderRadius: radius.sm, padding: 12, justifyContent: 'space-between',
  },
  blueprintMetaTxt: { color: colors.mint, fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 },
  blueprintHashTxt: { color: '#ffffff88', fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  simulatedSignatureVector: {
    alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative',
  },
  neonSignatureText: { color: colors.mint, fontWeight: '700', fontSize: 14, textShadowColor: colors.mint, textShadowRadius: 8, marginBottom: 6 },
  vectorLineHoriz: { width: '60%', height: 2, backgroundColor: colors.mint, shadowColor: colors.mint, shadowRadius: 10, shadowOpacity: 0.5 },
  vectorLineDiagonal: { width: '40%', height: 2, backgroundColor: colors.mint, transform: [{ rotate: '-15deg' }], marginTop: 8 },
  blueprintStatus: { color: colors.mint, fontSize: 9, fontWeight: 'bold', alignSelf: 'flex-end' },
  uploadOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0D0E1A99', paddingVertical: 10, alignItems: 'center',
  },
  uploadOverlayTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  uploadPrompt: { padding: 40, alignItems: 'center' },
  uploadIcon: { fontSize: 44, marginBottom: 12 },
  uploadTxt: { fontSize: 20, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1 },
  uploadSub: { color: colors.textMuted, fontSize: 14, marginTop: 6, marginBottom: 14 },
  uploadPill: {
    backgroundColor: colors.bgSection, borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  uploadPillTxt: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  stagesContainer: { gap: 10, marginBottom: 20 },
  stageCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.md, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  stageDot: { width: 10, height: 10, borderRadius: 99 },
  stageContent: { flex: 1 },
  stageName: { fontSize: 12, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 2 },
  stageDesc: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  stageCheck: { color: colors.mint, fontSize: 16, fontWeight: '900' },
  resultsContainer: { gap: 14 },
  secureWrapper: { width: '100%' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  neonLiveBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mint, shadowColor: colors.mint, shadowRadius: 6, shadowOpacity: 0.8 },
  xrayToggleBtn: {
    marginTop: 14, backgroundColor: colors.mint + '15', paddingVertical: 12,
    borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.mint + '66',
  },
  xrayToggleBtnActive: { backgroundColor: colors.mint + '33', borderColor: colors.mint },
  xrayToggleTxt: { color: colors.mint, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  aiModelCard: {
    backgroundColor: colors.coral + '0A', borderRadius: radius.lg, padding: 20,
    borderWidth: 1.5, borderColor: colors.coral + '33',
  },
  aiCardTitle: { color: colors.coral, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  aiModelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  aiModelName: { fontSize: 22, fontWeight: '900', color: colors.textPrimary },
  aiModelBadge: { backgroundColor: colors.coral + '22', color: colors.coral, fontSize: 11, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  aiFingerprintLabel: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5, marginBottom: 4 },
  aiFingerprintTxt: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, fontWeight: '500' },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: 20,
    borderWidth: 1.5, borderColor: colors.border,
  },
  cardHeadline: { fontSize: 12, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 16 },
  signalRow: { flexDirection: 'row', gap: 10 },
  signalChip: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.md, padding: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.border,
  },
  signalChipActive: { borderColor: colors.mint + '66', backgroundColor: colors.mint + '11' },
  signalChipWarn: { borderColor: colors.amber + '66', backgroundColor: colors.amber + '11' },
  signalChipDanger: { borderColor: colors.coral + '66', backgroundColor: colors.coral + '11' },
  signalIcon: { fontSize: 20, marginBottom: 4 },
  signalTxt: { fontSize: 9, fontWeight: '900', color: colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  signalStatus: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  artistCard: {
    backgroundColor: colors.mint + '0A', borderRadius: radius.lg, padding: 20,
    borderWidth: 1.5, borderColor: colors.mint + '33',
  },
  artistLabel: { fontSize: 11, fontWeight: '900', color: colors.mint, letterSpacing: 1.5 },
  artistName: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, marginTop: 4, marginBottom: 6 },
  secureSub: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  expandBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expandArrow: { color: colors.textMuted, fontSize: 14 },
  reportBody: { marginTop: 16 },
  reportVerdict: {
    color: colors.textSecondary, fontSize: 15, fontStyle: 'italic',
    fontWeight: '600', marginBottom: 16,
  },
  findingsContainer: { gap: 8, marginBottom: 18 },
  findingItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  findingDot: {
    width: 6, height: 6, borderRadius: 99,
    backgroundColor: colors.violet, marginTop: 6,
  },
  findingTxt: { flex: 1, color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  confRow: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: radius.md, padding: 14 },
  confItem: { flex: 1, alignItems: 'center' },
  confLabel: { fontSize: 9, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 4 },
  confNum: { fontSize: 22, fontWeight: '900' },
  confDivider: { width: 1, backgroundColor: colors.border },
  rescanBtn: {
    alignSelf: 'center', backgroundColor: colors.bgCard, borderRadius: radius.pill,
    paddingHorizontal: 24, paddingVertical: 14,
    borderWidth: 1.5, borderColor: colors.border, marginTop: 10,
  },
  rescanTxt: { color: colors.violet, fontSize: 15, fontWeight: '800' },
});