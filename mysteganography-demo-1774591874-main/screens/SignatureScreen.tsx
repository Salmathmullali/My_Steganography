import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, Alert, Platform, Share, TextInput, Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import SignatureCanvas from 'react-native-signature-canvas';
import { colors, radius, spacing, typography, shadows } from '../constants/design';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type SignResult = {
  signed_url?: string;
  signature_hash?: string;
  image_id?: string;
  error?: string;
};

export default function SignatureScreen({ route, navigation }: any) {
  const params = route.params || {};
  const [artworkUri, setArtworkUri] = useState<string | null>(params.drawingUri || params.imageUri || null);
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [textHandle, setTextHandle] = useState('');
  const [result, setResult] = useState<SignResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const signatureRef = useRef<any>(null);

  useEffect(() => {
    if (params.drawingUri || params.imageUri) {
      setArtworkUri(params.drawingUri || params.imageUri);
    }
  }, [params]);

  const pickArtwork = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Please grant photo library access.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1,
    });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      setArtworkUri(res.assets[0].uri);
      setResult(null);
    }
  };

  const handleSignArt = async () => {
    if (!artworkUri) { Alert.alert('No Artwork', 'Import an artwork image first.'); return; }
    if (!signatureBase64 && !textHandle) { Alert.alert('No Signature', 'Provide a signature or text handle.'); return; }
    setLoading(true);
    
    // Simulate API injection logic
    setTimeout(() => {
      setLoading(false);
      setResult({
        signed_url: artworkUri, 
        signature_hash: 'SIG_HEX_' + Math.random().toString(16).slice(2, 10).toUpperCase() + '_OWNER',
        image_id: 'img_' + Math.random().toString(36).substr(2, 9),
      });
    }, 2000);
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backTxt}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>ENCODER_v3.0</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={typography.displayL}>SECURE YOUR{'\n'}<Text style={{ color: colors.violet }}>CREATIVE DNA</Text></Text>
        
        {/* Step 1: Source */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>01_SOURCE_IMAGE</Text>
          {artworkUri ? (
            <View style={s.artworkPreviewContainer}>
              <Image source={{ uri: artworkUri }} style={s.artworkImg} resizeMode="cover" />
              <TouchableOpacity onPress={pickArtwork} style={s.changeBtn}>
                <Text style={s.changeBtnTxt}>CHANGE_SOURCE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.importZone} onPress={pickArtwork}>
              <Text style={s.importIcon}>📥</Text>
              <Text style={s.importTxt}>SELECT_ASSET</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Step 2: Signature Inputs */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>02_IDENTITY_LAYERS</Text>
          
          <View style={s.inputCard}>
            <Text style={s.inputTitle}>HAND_DRAWN SIGNATURE (REQUIRED)</Text>
            {signatureBase64 ? (
              <View style={s.sigPreviewBox}>
                <Image source={{ uri: signatureBase64 }} style={s.sigPreviewImg} resizeMode="contain" />
                <TouchableOpacity onPress={() => setShowCanvas(true)} style={s.redrawBtn}>
                  <Text style={s.redrawTxt}>REDRAW_KEY</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={s.sigPlaceholder} onPress={() => setShowCanvas(true)}>
                <Text style={s.sigIcon}>✍️</Text>
                <Text style={s.sigTxt}>Tap to begin freehand signing</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={s.inputCard}>
            <Text style={s.inputTitle}>TEXT_METADATA_HANDLE</Text>
            <TextInput
              style={s.textInput}
              placeholder="e.g. @artist_name / 2024"
              placeholderTextColor={colors.textMuted}
              value={textHandle}
              onChangeText={setTextHandle}
            />
          </View>
        </View>

        {/* Real-time Placement Preview */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>03_EMBEDDING_PREVIEW</Text>
          <View style={s.previewPanel}>
            <View style={s.previewArtBox}>
              {artworkUri && <Image source={{ uri: artworkUri }} style={s.previewArtImg} opacity={0.3} />}
              <View style={s.gridOverlay}>
                {[...Array(6)].map((_, i) => <View key={i} style={s.gridLineH} />)}
                {[...Array(6)].map((_, i) => <View key={i} style={s.gridLineV} />)}
              </View>
              {/* Bounding Box Simulation */}
              <View style={s.boundingBox}>
                <Text style={s.bboxTxt}>[DATA_LAYER_SIG]</Text>
                {signatureBase64 && <Image source={{ uri: signatureBase64 }} style={s.bboxSig} resizeMode="contain" />}
              </View>
              <View style={[s.boundingBox, { top: '30%', left: '10%', width: '40%', height: '15%' }]}>
                <Text style={s.bboxTxt}>[DATA_LAYER_TEXT]</Text>
                <Text style={s.bboxHandleTxt}>{textHandle || '...'}</Text>
              </View>
            </View>
            <Text style={s.previewStatus}>STATUS: READY_FOR_INJECTION</Text>
          </View>
        </View>

        {!result && (
          <TouchableOpacity 
            style={[s.ctaBtn, (!artworkUri || !signatureBase64) && { opacity: 0.5 }]} 
            onPress={handleSignArt}
            disabled={!artworkUri || !signatureBase64 || loading}
          >
            <LinearGradient colors={[colors.violet, colors.coral]} style={s.ctaGradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaText}>EXECUTE STEGO_INJECTION ➔</Text>}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {result && (
          <View style={s.successCard}>
            <Text style={s.successTitle}>INJECTION_SUCCESSFUL</Text>
            <Text style={s.hashTxt}>SIG_HASH: {result.signature_hash}</Text>
            <TouchableOpacity style={s.finishBtn} onPress={() => navigation.navigate('Portfolio')}>
              <Text style={s.finishBtnTxt}>VIEW IN REGISTRY</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Signature Pad Modal */}
      {showCanvas && (
        <View style={s.canvasOverlay}>
          <View style={s.canvasHeader}>
            <TouchableOpacity onPress={() => setShowCanvas(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
            <Text style={s.canvasHeaderTitle}>IDENTITY_MATRIX</Text>
            <TouchableOpacity onPress={() => signatureRef.current?.clearSignature()}><Text style={s.closeBtn}>↺</Text></TouchableOpacity>
          </View>
          <SignatureCanvas
            ref={signatureRef}
            onOK={(sig) => { setSignatureBase64(sig); setShowCanvas(false); }}
            descriptionText=""
            clearText="Clear"
            confirmText="Commit"
            webStyle={`.m-signature-pad--footer {display: none;}`}
          />
          <TouchableOpacity 
            style={s.canvasCommitBtn} 
            onPress={() => signatureRef.current?.readSignature()}
          >
            <Text style={s.canvasCommitTxt}>COMMIT_BIOMETRIC_DATA</Text>
          </TouchableOpacity>
        </View>
      )}
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
  section: { marginBottom: spacing.xl },
  sectionLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: spacing.md },
  artworkPreviewContainer: { backgroundColor: colors.bgCard, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  artworkImg: { width: '100%', height: 200 },
  changeBtn: { backgroundColor: colors.bgSection, padding: 12, alignItems: 'center' },
  changeBtnTxt: { color: colors.mint, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  importZone: { height: 120, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.border, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  importIcon: { fontSize: 32, marginBottom: 8 },
  importTxt: { color: colors.textMuted, fontWeight: '900', fontSize: 12 },
  inputCard: { backgroundColor: colors.bgCard, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  inputTitle: { color: colors.textSecondary, fontSize: 10, fontWeight: '800', marginBottom: 12 },
  sigPreviewBox: { alignItems: 'center' },
  sigPreviewImg: { width: '100%', height: 80, backgroundColor: '#fff', borderRadius: radius.sm },
  redrawBtn: { marginTop: 10 },
  redrawTxt: { color: colors.violet, fontSize: 10, fontWeight: '900' },
  sigPlaceholder: { height: 80, backgroundColor: colors.bg, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: colors.border },
  sigIcon: { fontSize: 24, marginBottom: 4 },
  sigTxt: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  textInput: { backgroundColor: colors.bg, color: colors.textPrimary, padding: 14, borderRadius: radius.md, fontWeight: '600', fontSize: 14 },
  previewPanel: { backgroundColor: colors.bgCard, padding: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.mint + '33' },
  previewArtBox: { height: 200, backgroundColor: '#000', borderRadius: radius.md, overflow: 'hidden', position: 'relative' },
  previewArtImg: { ...StyleSheet.absoluteFillObject },
  gridOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-evenly', padding: 10 },
  gridLineH: { height: 1, backgroundColor: 'rgba(0,255,204,0.1)' },
  gridLineV: { width: 1, backgroundColor: 'rgba(0,255,204,0.1)', position: 'absolute', top: 0, bottom: 0 },
  boundingBox: { position: 'absolute', top: '50%', left: '50%', width: '40%', height: '30%', borderWidth: 1, borderColor: colors.mint, backgroundColor: 'rgba(0,255,204,0.05)', padding: 4 },
  bboxTxt: { color: colors.mint, fontSize: 6, fontWeight: '900', position: 'absolute', top: -10 },
  bboxSig: { width: '100%', height: '100%', tintColor: colors.mint },
  bboxHandleTxt: { color: colors.mint, fontSize: 12, fontWeight: '900', marginTop: 10 },
  previewStatus: { color: colors.mint, fontSize: 8, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  ctaBtn: { height: 60, borderRadius: radius.pill, overflow: 'hidden', marginTop: spacing.lg, ...shadows.violet },
  ctaGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  successCard: { backgroundColor: colors.bgSection, padding: 20, borderRadius: radius.lg, marginTop: 20, borderLeftWidth: 4, borderLeftColor: colors.mint },
  successTitle: { color: colors.mint, fontWeight: '900', fontSize: 16, marginBottom: 8 },
  hashTxt: { color: colors.textSecondary, fontSize: 10, fontFamily: 'monospace' },
  finishBtn: { marginTop: 16, backgroundColor: colors.mint, padding: 12, borderRadius: radius.md, alignItems: 'center' },
  finishBtnTxt: { color: colors.bg, fontWeight: '900', fontSize: 12 },
  canvasOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg, zIndex: 1000 },
  canvasHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 60, alignItems: 'center', backgroundColor: colors.bgCard },
  canvasHeaderTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: '900', letterSpacing: 4 },
  closeBtn: { color: colors.textSecondary, fontSize: 20, fontWeight: 'bold' },
  canvasCommitBtn: { backgroundColor: colors.mint, padding: 20, alignItems: 'center' },
  canvasCommitTxt: { color: colors.bg, fontWeight: '900', letterSpacing: 2 }
});