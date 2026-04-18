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
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
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
    setScanning(true);
    pulse();

    // Stage 1 progress
    setStage(1);
    const scanRes = await scanImage(uri);
    setStage(2);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    setResult(scanRes);
    setScanning(false);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Blobs */}
      <View style={[s.blob, s.blobA]} />
      <View style={[s.blob, s.blobB]} />

      {/* Hero */}
      <View style={s.heroBadge}>
        <Text style={s.heroBadgeTxt}>✦ SCAN</Text>
      </View>
      <Text style={s.headline}>DETECT AI{'\n'}ART</Text>
      <Text style={s.sub}>Uncover hidden truths in any image.</Text>

      {/* Upload Zone */}
      <TouchableOpacity style={[s.uploadZone, imageUri ? s.uploadZoneActive : null]} onPress={pickAndScan} activeOpacity={0.85}>
        {imageUri ? (
          <View>
            <Image source={{ uri: imageUri }} style={s.uploadedImg} resizeMode="cover" />
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
            <Text style={s.uploadSub}>Tap to select from library</Text>
            <View style={s.uploadPill}>
              <Text style={s.uploadPillTxt}>JPEG · PNG · WEBP · Max 10MB</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Stage progress */}
      {scanning && (
        <View style={s.stagesContainer}>
          {/* Stage 1 Card */}
          <Animated.View style={[s.stageCard, stage === 1 && { transform: [{ scale: pulseAnim }] }]}>
            <View style={[s.stageDot, { backgroundColor: stage >= 2 ? colors.mint : colors.amber }]} />
            <View style={s.stageContent}>
              <Text style={s.stageName}>METADATA CHECK</Text>
              <Text style={s.stageDesc}>
                {stage >= 2 ? '✓ EXIF, XMP, C2PA scan complete' : 'Scanning metadata & signatures…'}
              </Text>
            </View>
            {stage >= 2 && <Text style={s.stageCheck}>✓</Text>}
            {stage < 2 && <ActivityIndicator color={colors.amber} size="small" />}
          </Animated.View>

          {/* Stage 2 Card */}
          <Animated.View style={[s.stageCard, stage === 2 && { transform: [{ scale: pulseAnim }] }]}>
            <View style={[s.stageDot, { backgroundColor: stage === 2 ? colors.coral : colors.border }]} />
            <View style={s.stageContent}>
              <Text style={s.stageName}>AI DEEP SCAN</Text>
              <Text style={s.stageDesc}>
                {stage === 2 ? 'Running GPT-4o Vision analysis…' : 'Waiting…'}
              </Text>
            </View>
            {stage === 2 && <ActivityIndicator color={colors.coral} size="small" />}
          </Animated.View>
        </View>
      )}

      {/* Results */}
      {result && !scanning && (
        <View style={s.resultsContainer}>
          {/* Trust Score */}
          <View style={[s.card, shadows.card]}>
            <Text style={s.cardHeadline}>TRUST SCORE</Text>
            <TrustScoreBadge
              score={result.trust_score}
              label={result.label}
              likelySource={result.likely_source}
            />
          </View>

          {/* Signals row */}
          <View style={s.signalRow}>
            <View style={[s.signalChip, result.our_signature.found && s.signalChipActive]}>
              <Text style={s.signalIcon}>🧬</Text>
              <Text style={s.signalTxt}>DNA SIG</Text>
              <Text style={[s.signalStatus, { color: result.our_signature.found ? colors.mint : colors.textMuted }]}>
                {result.our_signature.found ? 'FOUND' : 'NONE'}
              </Text>
            </View>
            <View style={[s.signalChip, result.c2pa.found && s.signalChipWarn]}>
              <Text style={s.signalIcon}>📜</Text>
              <Text style={s.signalTxt}>C2PA</Text>
              <Text style={[s.signalStatus, { color: result.c2pa.found ? colors.coral : colors.textMuted }]}>
                {result.c2pa.found ? 'FOUND' : 'NONE'}
              </Text>
            </View>
            <View style={[s.signalChip, !!result.ai_software_tag && s.signalChipDanger]}>
              <Text style={s.signalIcon}>🤖</Text>
              <Text style={s.signalTxt}>AI TAG</Text>
              <Text style={[s.signalStatus, { color: result.ai_software_tag ? colors.coral : colors.textMuted }]}>
                {result.ai_software_tag ? 'FOUND' : 'NONE'}
              </Text>
            </View>
          </View>

          {/* Matched artist */}
          {result.our_signature.found && result.our_signature.matched_artist && (
            <View style={s.artistCard}>
              <Text style={s.artistLabel}>VERIFIED ARTIST</Text>
              <Text style={s.artistName}>{result.our_signature.matched_artist}</Text>
            </View>
          )}

          {/* OpenAI key banner */}
          {result.needs_openai_key && (
            <TouchableOpacity style={s.keyBanner} onPress={() => navigation?.navigate('Settings')}>
              <Text style={s.keyBannerIcon}>🔑</Text>
              <View style={s.keyBannerText}>
                <Text style={s.keyBannerTitle}>Add OpenAI Key for Deep Analysis</Text>
                <Text style={s.keyBannerSub}>Tap to go to Settings →</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Detailed report */}
          {result.ai_analysis && (
            <View style={s.card}>
              <TouchableOpacity onPress={() => setExpanded(!expanded)} style={s.expandBtn}>
                <Text style={s.cardHeadline}>DETAILED REPORT</Text>
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
                      <Text style={s.confLabel}>HUMAN</Text>
                      <Text style={[s.confNum, { color: colors.mint }]}>{result.ai_analysis.confidence_human}%</Text>
                    </View>
                    <View style={s.confDivider} />
                    <View style={s.confItem}>
                      <Text style={s.confLabel}>AI</Text>
                      <Text style={[s.confNum, { color: colors.coral }]}>{result.ai_analysis.confidence_ai}%</Text>
                    </View>
                    <View style={s.confDivider} />
                    <View style={s.confItem}>
                      <Text style={s.confLabel}>SOURCE</Text>
                      <Text style={s.confSrc} numberOfLines={1}>{result.ai_analysis.likely_source}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity style={s.rescanBtn} onPress={pickAndScan}>
            <Text style={s.rescanTxt}>Scan Another Image →</Text>
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
    fontSize: 46, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: -2, lineHeight: 48, marginBottom: 8,
  },
  sub: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  uploadZone: {
    borderWidth: 2, borderColor: colors.borderLight, borderStyle: 'dashed',
    borderRadius: radius.lg, overflow: 'hidden', marginBottom: 20,
    backgroundColor: colors.bgCard,
    transform: [{ rotate: '-0.3deg' }],
  },
  uploadZoneActive: { borderStyle: 'solid', borderColor: colors.coral },
  uploadedImg: { width: '100%', height: 220 },
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
    backgroundColor: colors.mint + '18', borderRadius: radius.md, padding: 18,
    borderWidth: 1.5, borderColor: colors.mint + '44',
  },
  artistLabel: { fontSize: 11, fontWeight: '900', color: colors.mint, letterSpacing: 1.5, marginBottom: 4 },
  artistName: { fontSize: 22, fontWeight: '900', color: colors.textPrimary },
  keyBanner: {
    backgroundColor: colors.amber + '18', borderRadius: radius.md, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: colors.amber + '44',
  },
  keyBannerIcon: { fontSize: 24 },
  keyBannerText: { flex: 1 },
  keyBannerTitle: { color: colors.amber, fontSize: 14, fontWeight: '800' },
  keyBannerSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
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
  confSrc: { fontSize: 11, color: colors.textSecondary, fontWeight: '700', textAlign: 'center' },
  confDivider: { width: 1, backgroundColor: colors.border },
  rescanBtn: {
    alignSelf: 'center', backgroundColor: colors.bgCard, borderRadius: radius.pill,
    paddingHorizontal: 24, paddingVertical: 14,
    borderWidth: 1.5, borderColor: colors.border,
  },
  rescanTxt: { color: colors.violet, fontSize: 15, fontWeight: '800' },
});
