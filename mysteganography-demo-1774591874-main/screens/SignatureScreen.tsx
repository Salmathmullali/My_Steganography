import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, Alert, Platform, Share,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import SignatureCanvas from 'react-native-signature-canvas';
import { signImage } from '../lib/api';
import { SignResult } from '../types';
import { colors, radius, shadows } from '../constants/design';

export default function SignatureScreen() {
  const [artworkUri, setArtworkUri] = useState<string | null>(null);
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [result, setResult] = useState<SignResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const signatureRef = useRef<any>(null);

  const pickArtwork = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please grant photo library access.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1,
    });
    if (!res.canceled && res.assets[0]) { setArtworkUri(res.assets[0].uri); setResult(null); }
  };

  const handleSignArt = async () => {
    if (!artworkUri) { Alert.alert('No Artwork', 'Import an artwork image first.'); return; }
    if (!signatureBase64) { Alert.alert('No Signature', 'Draw your signature first.'); return; }
    setLoading(true);
    const res = await signImage(artworkUri, signatureBase64);
    setLoading(false);
    if (res.error) Alert.alert('Signing Failed', res.error);
    else setResult(res);
  };

  const handleSave = async () => {
    if (!result?.signed_url) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Grant media library access.'); return; }
    await MediaLibrary.createAssetAsync(result.signed_url).catch(() => null);
    Alert.alert('Saved!', 'Signed artwork saved to camera roll. 🎉');
  };

  const handleShare = async () => {
    if (!result?.image_id) return;
    const link = `https://bldvsglqzptpnasinmyi.supabase.co/verify/${result.image_id}`;
    await Share.share({ message: `Verify this artwork: ${link}` });
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Decorative blobs */}
        <View style={[s.blob, s.blobA]} />
        <View style={[s.blob, s.blobB]} />

        {/* Section hero badge */}
        <View style={s.heroBadge}>
          <Text style={s.heroBadgeText}>✦ CREATE</Text>
        </View>
        <Text style={s.headline}>SIGN YOUR{'\n'}ART</Text>
        <Text style={s.sub}>Embed an invisible digital DNA.</Text>

        {/* Step 1 — Signature */}
        <View style={[s.card, { transform: [{ rotate: '-0.5deg' }] }]}>
          <View style={s.stepBadge}><Text style={s.stepNum}>①</Text></View>
          <Text style={s.cardTitle}>DRAW SIGNATURE</Text>
          {signatureBase64 ? (
            <View style={s.sigDoneBox}>
              <Image source={{ uri: signatureBase64 }} style={s.sigPreview} resizeMode="contain" />
              <View style={s.mintBadge}><Text style={s.mintBadgeText}>✓ CAPTURED</Text></View>
              <TouchableOpacity onPress={() => { setSignatureBase64(null); setShowCanvas(true); }}>
                <Text style={s.redrawTxt}>↩ Redraw</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.sigTap} onPress={() => setShowCanvas(true)} activeOpacity={0.8}>
              <Text style={s.sigTapIcon}>✍️</Text>
              <Text style={s.sigTapTxt}>Tap to draw your signature</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Step 2 — Artwork */}
        <View style={[s.card, { transform: [{ rotate: '0.3deg' }] }]}>
          <View style={s.stepBadge}><Text style={s.stepNum}>②</Text></View>
          <Text style={s.cardTitle}>IMPORT ARTWORK</Text>
          {artworkUri ? (
            <View>
              <Image source={{ uri: artworkUri }} style={s.artworkImg} resizeMode="cover" />
              <TouchableOpacity onPress={pickArtwork} style={s.changeBtn}>
                <Text style={s.changeBtnTxt}>↩ Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.importZone} onPress={pickArtwork} activeOpacity={0.8}>
              <Text style={s.importIcon}>🖼️</Text>
              <Text style={s.importTxt}>Import Art</Text>
              <Text style={s.importSub}>JPEG · PNG · WEBP · Max 10MB</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sign CTA */}
        {!result && (
          <TouchableOpacity
            style={[s.cta, (!artworkUri || !signatureBase64 || loading) && s.ctaDisabled]}
            onPress={handleSignArt}
            disabled={!artworkUri || !signatureBase64 || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={s.ctaRow}>
                <ActivityIndicator color={colors.textDark} size="small" />
                <Text style={[s.ctaTxt, { marginLeft: 10 }]}>Embedding signature…</Text>
              </View>
            ) : (
              <Text style={s.ctaTxt}>🔏 SIGN MY ART</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Result */}
        {result && !result.error && (
          <View style={[s.resultCard, s.mintGlow]}>
            <View style={s.resultHeader}>
              <Text style={s.resultTitle}>ART SIGNED!</Text>
              <View style={s.dnaBadge}><Text style={s.dnaTxt}>🧬 DNA ✓</Text></View>
            </View>
            <View style={s.previewRow}>
              <View style={s.previewCol}>
                <Text style={s.previewLabel}>ORIGINAL</Text>
                {artworkUri && <Image source={{ uri: artworkUri }} style={s.previewImg} resizeMode="cover" />}
              </View>
              <Text style={s.arrow}>→</Text>
              <View style={s.previewCol}>
                <Text style={[s.previewLabel, { color: colors.mint }]}>SIGNED</Text>
                {result.signed_url
                  ? <Image source={{ uri: result.signed_url }} style={s.previewImg} resizeMode="cover" />
                  : <View style={[s.previewImg, s.noPreview]}><Text style={{ color: colors.textMuted }}>Stored ✓</Text></View>
                }
              </View>
            </View>
            <Text style={s.hashLabel}>SIGNATURE HASH</Text>
            <Text style={s.hashTxt} numberOfLines={1} ellipsizeMode="middle">{result.signature_hash}</Text>
            <View style={s.actionRow}>
              <TouchableOpacity style={s.actionBtn} onPress={handleSave}>
                <Text style={s.actionTxt}>💾 Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, s.actionBtnAccent]} onPress={handleShare}>
                <Text style={[s.actionTxt, { color: colors.textDark }]}>🔗 Share Verify</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => { setResult(null); setArtworkUri(null); setSignatureBase64(null); }} style={s.resetBtn}>
              <Text style={s.resetTxt}>Sign Another →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Signature Canvas Overlay */}
      {showCanvas && (
        <View style={s.canvasOverlay}>
          <View style={s.canvasTop}>
            <TouchableOpacity onPress={() => setShowCanvas(false)} style={s.pillBtn}>
              <Text style={s.pillBtnTxt}>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={s.canvasTitle}>DRAW SIGNATURE</Text>
            <TouchableOpacity onPress={() => signatureRef.current?.clearSignature()} style={[s.pillBtn, { backgroundColor: '#FF6B5B22' }]}>
              <Text style={[s.pillBtnTxt, { color: colors.coral }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          <SignatureCanvas
            ref={signatureRef}
            onOK={(sig) => { setSignatureBase64(sig); setShowCanvas(false); }}
            onEmpty={() => Alert.alert('Empty', 'Please draw before confirming.')}
            descriptionText=""
            clearText="Clear"
            confirmText="✓ Confirm"
            webStyle={`
              .m-signature-pad { background: #F5F0E8; border-radius: 0px; box-shadow: none; margin: 0; width: 100%; }
              .m-signature-pad--body { border: none; }
              .m-signature-pad--footer { display: flex; justify-content: space-between; padding: 16px; background: #13152B; }
              .m-signature-pad--footer .button.clear { background: #FF6B5B; color: #0D0E1A; border-radius: 999px; padding: 12px 24px; font-weight: 800; }
              .m-signature-pad--footer .button.save { background: #3ECFB2; color: #0D0E1A; border-radius: 999px; padding: 12px 24px; font-weight: 800; }
            `}
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 120 },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.08 },
  blobA: { width: 240, height: 240, backgroundColor: colors.violet, top: 0, right: -80 },
  blobB: { width: 160, height: 160, backgroundColor: colors.coral, top: 300, left: -60 },
  heroBadge: {
    backgroundColor: colors.violet + '22', borderRadius: radius.pill, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12, borderWidth: 1, borderColor: colors.violet + '44',
  },
  heroBadgeText: { color: colors.violet, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  headline: {
    fontSize: 46, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: -2, lineHeight: 48, marginBottom: 8,
  },
  sub: { fontSize: 16, color: colors.textSecondary, marginBottom: 28 },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: 20,
    marginBottom: 16, borderWidth: 1.5, borderColor: colors.border, ...shadows.card,
  },
  stepBadge: {
    position: 'absolute', top: -14, left: 20,
    backgroundColor: colors.amber, borderRadius: radius.pill,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontSize: 14, fontWeight: '900', color: colors.textDark },
  cardTitle: {
    fontSize: 13, fontWeight: '900', color: colors.textMuted,
    letterSpacing: 1.5, marginTop: 8, marginBottom: 14,
  },
  sigTap: {
    height: 110, backgroundColor: colors.bg, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.borderLight, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  sigTapIcon: { fontSize: 30, marginBottom: 8 },
  sigTapTxt: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  sigDoneBox: { alignItems: 'center' },
  sigPreview: { width: '100%', height: 100, borderRadius: radius.sm, backgroundColor: '#F5F0E8' },
  mintBadge: {
    marginTop: 10, backgroundColor: colors.mint + '22', borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: colors.mint + '44',
  },
  mintBadgeText: { color: colors.mint, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  redrawTxt: { color: colors.violet, fontSize: 13, marginTop: 8, fontWeight: '700' },
  importZone: {
    borderWidth: 2, borderColor: colors.borderLight, borderStyle: 'dashed',
    borderRadius: radius.md, padding: 32, alignItems: 'center',
  },
  importIcon: { fontSize: 36, marginBottom: 10 },
  importTxt: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  importSub: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  artworkImg: { width: '100%', height: 200, borderRadius: radius.sm },
  changeBtn: { marginTop: 10, alignSelf: 'center' },
  changeBtnTxt: { color: colors.violet, fontSize: 14, fontWeight: '700' },
  cta: {
    backgroundColor: colors.violet, borderRadius: radius.pill,
    paddingVertical: 20, alignItems: 'center', marginVertical: 8,
    ...shadows.violet,
  },
  ctaDisabled: { opacity: 0.35 },
  ctaRow: { flexDirection: 'row', alignItems: 'center' },
  ctaTxt: { color: colors.textPrimary, fontSize: 17, fontWeight: '900', letterSpacing: 1 },
  resultCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 22,
    borderWidth: 1.5, borderColor: colors.mint + '44', marginBottom: 20,
  },
  mintGlow: {
    shadowColor: colors.mint, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 12,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '900', color: colors.mint, letterSpacing: -0.5 },
  dnaBadge: {
    backgroundColor: colors.mint, borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  dnaTxt: { color: colors.textDark, fontSize: 11, fontWeight: '900' },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  previewCol: { flex: 1 },
  previewLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  previewImg: { width: '100%', height: 120, borderRadius: radius.sm },
  noPreview: { backgroundColor: colors.bgSection, alignItems: 'center', justifyContent: 'center' },
  arrow: { color: colors.mint, fontSize: 20, fontWeight: '900' },
  hashLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  hashTxt: {
    color: colors.violet, fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 18,
  },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionBtn: {
    flex: 1, backgroundColor: colors.bgSection, borderRadius: radius.pill,
    paddingVertical: 13, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  actionBtnAccent: { backgroundColor: colors.mint, borderColor: colors.mint, flex: 2 },
  actionTxt: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  resetBtn: { alignItems: 'center', paddingVertical: 8 },
  resetTxt: { color: colors.violet, fontSize: 15, fontWeight: '700' },
  canvasOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg, zIndex: 100 },
  canvasTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: Platform.OS === 'ios' ? 56 : 16,
    backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  canvasTitle: { fontSize: 15, fontWeight: '900', color: colors.textPrimary, letterSpacing: 0.5 },
  pillBtn: {
    backgroundColor: colors.bgSection, borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border,
  },
  pillBtnTxt: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
});
