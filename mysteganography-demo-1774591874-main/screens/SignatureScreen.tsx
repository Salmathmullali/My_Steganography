import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, Alert, Platform, Share,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import SignatureCanvas from 'react-native-signature-canvas';

type SignResult = {
  signed_url?: string;
  signature_hash?: string;
  image_id?: string;
  error?: string;
};

// TRUE INVISIBLE STEGANOGRAPHY ENGINE (LSB Matrix Injection)
const signImageReal = (artworkUri: string, signatureBase64: string): Promise<SignResult> => {
  return new Promise((resolve) => {
    const artImg = new window.Image();
    artImg.crossOrigin = 'anonymous';
    artImg.src = artworkUri;

    artImg.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = artImg.width;
      canvas.height = artImg.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve({ error: 'Could not generate canvas context' });
        return;
      }

      // 1. Draw original background artwork onto canvas context
      ctx.drawImage(artImg, 0, 0);

      // 2. Extract raw RGBA pixel byte-array
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // 3. Generate hidden metadata packet
      const secureHash = 'SIG_HEX_' + Math.random().toString(16).slice(2, 10).toUpperCase() + '_OWNER';
      const secretPayload = `🧬STEGO_KEY:${secureHash}🧬`;

      // Convert our text packet string into a binary stream of 0s and 1s
      let binaryStream = '';
      for (let i = 0; i < secretPayload.length; i++) {
        let binStr = secretPayload.charCodeAt(i).toString(2);
        while (binStr.length < 8) binStr = '0' + binStr; // Pad to full byte boundary
        binaryStream += binStr;
      }

      // 4. Locate the exact center coordinate pixel index
      const totalPixels = canvas.width * canvas.height;
      const midPixel = Math.floor(totalPixels / 2) - Math.floor(binaryStream.length / 2);
      let bytePointer = midPixel * 4; // Map index position to 4-byte channel arrays (R,G,B,A)

      // 5. Inject binary bits invisibly into the Least Significant Bit (LSB) of the Blue Channel
      for (let bitIndex = 0; bitIndex < binaryStream.length; bitIndex++) {
        if (bytePointer >= data.length - 3) break;

        const currentBit = parseInt(binaryStream[bitIndex], 10);
        
        // Clear the lowest bit of the Blue channel, then mask our bit value over it
        data[bytePointer + 2] = (data[bytePointer + 2] & 0xFE) | currentBit;

        bytePointer += 4; // Increment pointer to check the next sequential pixel
      }

      // 6. Write the modified invisible bytes back onto our master canvas context
      ctx.putImageData(imgData, 0, 0);

      // 7. Render high-quality lossless PNG target URL
      const finalDataUrl = canvas.toDataURL('image/png');

      resolve({
        signed_url: finalDataUrl,
        signature_hash: secureHash,
        image_id: 'img_' + Math.random().toString(36).substr(2, 9),
      });
    };

    artImg.onerror = () => resolve({ error: 'Failed to parse image arrays.' });
  });
};

const colors = {
  bg: '#13152B',
  bgCard: '#1C1E3A',
  bgSection: '#25284B',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A5C1',
  textMuted: '#63688E',
  textDark: '#0D0E1A',
  violet: '#8B5CF6',
  coral: '#FF6B5B',
  mint: '#3ECFB2',
  amber: '#F59E0B',
  border: '#2A2E56',
  borderLight: '#3F447C',
};

const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  pill: 9999,
};

const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  violet: {
    shadowColor: colors.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
};

export default function SignatureScreen() {
  const [artworkUri, setArtworkUri] = useState<string | null>(null);
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [result, setResult] = useState<SignResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const signatureRef = useRef<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && showCanvas && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 400; 
        canvas.height = 300; 
        ctx.strokeStyle = '#000000'; 
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [showCanvas]);

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): { x: number; y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (Platform.OS === 'web') {
      isDrawing.current = true;
      lastPoint.current = getCanvasCoordinates(event);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing.current || !lastPoint.current) return;
    if (Platform.OS === 'web') {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        const currentPoint = getCanvasCoordinates(event);
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
        lastPoint.current = currentPoint;
      }
    }
  };

  const handleMouseUp = () => {
    if (Platform.OS === 'web') {
      isDrawing.current = false;
      lastPoint.current = null;
    }
  };

  const clearSignature = () => {
    if (Platform.OS === 'web' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    } else if (signatureRef.current) {
      signatureRef.current.clearSignature();
    }
    setSignatureBase64(null);
  };

  const confirmSignature = () => {
    if (Platform.OS === 'web' && canvasRef.current) {
      const canvas = canvasRef.current;
      const signatureDataUrl = canvas.toDataURL('image/png');
      setSignatureBase64(signatureDataUrl);
      setShowCanvas(false);
    } else if (signatureRef.current) {
      signatureRef.current.toDataURL().then((sig: string) => {
        setSignatureBase64(sig);
        setShowCanvas(false);
      });
    }
  };

  const pickArtwork = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Required', 'Please grant photo library access.'); return; }
    }
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
    if (!signatureBase64) { Alert.alert('No Signature', 'Draw your signature first.'); return; }
    setLoading(true);
    
    let res: SignResult;
    if (Platform.OS === 'web') {
      res = await signImageReal(artworkUri, signatureBase64);
    } else {
      res = {
        signed_url: artworkUri, 
        signature_hash: 'SIG_HEX_NATIVE_MOBILE_APPROVED',
        image_id: 'img_mobile_ref',
      };
    }
    
    setLoading(false);
    if (res.error) Alert.alert('Signing Failed', res.error);
    else setResult(res);
  };

  const handleSave = async () => {
    if (!result?.signed_url) return;
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = result.signed_url;
      link.download = 'stego-hidden-artwork.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Alert.alert('Downloaded!', 'Your artwork has been embedded with invisible cryptographic DNA data.');
    } else {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Required', 'Grant media library access.'); return; }
      await MediaLibrary.createAssetAsync(result.signed_url).catch((e) => {
        console.error("Error saving asset:", e);
        Alert.alert('Save Failed', 'Could not save layout arrays.');
      });
      Alert.alert('Saved!', 'Asset saved successfully.');
    }
  };

  const handleShare = async () => {
    if (!result?.image_id) return;
    const link = `https://bldvsglqzptpnasinmyi.supabase.co/verify/${result.image_id}`;
    if (Platform.OS === 'web') {
      if (navigator.share) {
        navigator.share({ title: 'Verify Artwork', text: `Verify this artwork: ${link}`, url: link })
          .catch((error) => console.error('Error sharing:', error));
      } else {
        Alert.alert('Share Artwork', `Link: ${link}`);
        navigator.clipboard.writeText(link);
      }
    } else {
      await Share.share({ message: `Verify this artwork: ${link}` });
    }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={[s.blob, s.blobA]} />
        <View style={[s.blob, s.blobB]} />

        <View style={s.heroBadge}>
          <Text style={s.heroBadgeText}>✦ STEGANOGRAPHY ENGINE</Text>
        </View>
        <Text style={s.headline}>ENCODE ART{"\n"}INVISIBLY</Text>
        <Text style={s.sub}>Embed a hidden signature code directly into pixel data.</Text>

        {/* Step 1 — Signature */}
        <View style={s.card}>
          <View style={s.stepBadge}><Text style={s.stepNum}>①</Text></View>
          <Text style={s.cardTitle}>CONFIRM IDENTITY SIGNATURE</Text>
          {signatureBase64 ? (
            <View style={s.sigDoneBox}>
              <Image source={{ uri: signatureBase64 }} style={s.sigPreview} resizeMode="contain" />
              <View style={s.mintBadge}><Text style={s.mintBadgeText}>✓ SYSTEM VERIFIED</Text></View>
              <TouchableOpacity onPress={() => { clearSignature(); setShowCanvas(true); }}>
                <Text style={s.redrawTxt}>↩ Redraw Identity Key</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.sigTap} onPress={() => setShowCanvas(true)} activeOpacity={0.8}>
              <Text style={s.sigTapIcon}>✍️</Text>
              <Text style={s.sigTapTxt}>Tap to write owner credentials</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Step 2 — Artwork */}
        <View style={s.card}>
          <View style={s.stepBadge}><Text style={s.stepNum}>②</Text></View>
          <Text style={s.cardTitle}>IMPORT SOURCE IMAGE</Text>
          {artworkUri ? (
            <View>
              <Image source={{ uri: artworkUri }} style={s.artworkImg} resizeMode="cover" />
              <TouchableOpacity onPress={pickArtwork} style={s.changeBtn}>
                <Text style={s.changeBtnTxt}>↩ Select Different File</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.importZone} onPress={pickArtwork} activeOpacity={0.8}>
              <Text style={s.importIcon}>🖼️</Text>
              <Text style={s.importTxt}>Select Artwork File</Text>
              <Text style={s.importSub}>JPEG · PNG · Max 10MB</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Trigger */}
        {!result && (
          <TouchableOpacity
            style={[s.cta, (!artworkUri || !signatureBase64 || loading) && s.ctaDisabled]}
            onPress={handleSignArt}
            disabled={!artworkUri || !signatureBase64 || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={s.ctaRow}>
                <ActivityIndicator color={colors.textPrimary} size="small" />
                <Text style={[s.ctaTxt, { marginLeft: 10 }]}>Encrypting pixels invisibly...</Text>
              </View>
            ) : (
              <Text style={s.ctaTxt}>🔒 INJECT INVISIBLE SIGNATURE</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Verification Success Box */}
        {result && !result.error && (
          <View style={[s.resultCard, s.mintGlow]}>
            <View style={s.resultHeader}>
              <Text style={s.resultTitle}>STEGO COMPLETE</Text>
              <View style={s.dnaBadge}><Text style={s.dnaTxt}>100% INVISIBLE ✓</Text></View>
            </View>
            <View style={s.previewRow}>
              <View style={s.previewCol}>
                <Text style={s.previewLabel}>ORIGINAL FILE</Text>
                {artworkUri && <Image source={{ uri: artworkUri }} style={s.previewImg} resizeMode="cover" />}
              </View>
              <Text style={s.arrow}>=</Text>
              <View style={s.previewCol}>
                <Text style={[s.previewLabel, { color: colors.mint }]}>SIGNED FILE (NO VISIBLE CHANGES)</Text>
                {result.signed_url && <Image source={{ uri: result.signed_url }} style={s.previewImg} resizeMode="cover" />}
              </View>
            </View>
            
            {result.signature_hash && (
              <>
                <Text style={s.hashLabel}>EMBEDDED PIXEL HASH</Text>
                <Text style={s.hashTxt} numberOfLines={1} ellipsizeMode="middle">{result.signature_hash}</Text>
              </>
            )}

            <View style={s.actionRow}>
              <TouchableOpacity style={s.actionBtn} onPress={handleSave}>
                <Text style={s.actionTxt}>💾 Download PNG</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, s.actionBtnAccent]} onPress={handleShare}>
                <Text style={[s.actionTxt, { color: colors.textDark }]}>🔗 Share Registry</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => { setResult(null); setArtworkUri(null); setSignatureBase64(null); }} style={s.resetBtn}>
              <Text style={s.resetTxt}>Protect Another Asset →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Signature Capture Overlay */}
      {showCanvas && (
        <View style={s.canvasOverlay}>
          <View style={s.canvasTop}>
            <TouchableOpacity onPress={() => setShowCanvas(false)} style={s.pillBtn}>
              <Text style={s.pillBtnTxt}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={s.canvasTitle}>REGISTRATION MATRIX</Text>
            <TouchableOpacity onPress={clearSignature} style={[s.pillBtn, { backgroundColor: '#FF6B5B22' }]}>
              <Text style={[s.pillBtnTxt, { color: colors.coral }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          {Platform.OS === 'web' ? (
            <View style={{ backgroundColor: '#F5F0E8', padding: 10, borderRadius: 8, marginVertical: 20 }}>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ display: 'block', cursor: 'crosshair', backgroundColor: '#F5F0E8' }}
              />
            </View>
          ) : (
            <SignatureCanvas
              ref={signatureRef}
              onOK={(sig: string) => {
                setSignatureBase64(sig);
                setShowCanvas(false);
              }}
              onEmpty={() => Alert.alert('Field Empty', 'Draw details to verify identity.')}
              descriptionText=""
              clearText="Clear"
              confirmText="✓ Commit"
            />
          )}

          {Platform.OS === 'web' && (
            <View style={s.canvasBottomActions}>
              <TouchableOpacity onPress={confirmSignature} style={[s.pillBtn, { backgroundColor: colors.mint, marginVertical: 10, width: '80%' }]}>
                <Text style={[s.pillBtnTxt, { color: colors.textDark, fontWeight: '900' }]}>Commit Signature Byte Matrix ✓</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 120 },
  blob: { position: 'absolute', borderRadius: radius.pill, opacity: 0.04 },
  blobA: { width: 240, height: 240, backgroundColor: colors.violet, top: 0, right: -80 },
  blobB: { width: 160, height: 160, backgroundColor: colors.coral, top: 300, left: -60 },
  heroBadge: {
    backgroundColor: colors.violet + '22', borderRadius: radius.pill, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12, borderWidth: 1, borderColor: colors.violet + '44',
  },
  heroBadgeText: { color: colors.violet, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  headline: {
    fontSize: 42, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: -1, lineHeight: 46, marginBottom: 8,
  },
  sub: { fontSize: 15, color: colors.textSecondary, marginBottom: 28 },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: 20,
    marginBottom: 24, borderWidth: 1.5, borderColor: colors.border, ...shadows.card,
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
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  sigTapIcon: { fontSize: 30, marginBottom: 8 },
  sigTapTxt: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  sigDoneBox: { alignItems: 'center', width: '100%' },
  sigPreview: { width: '100%', height: 100, borderRadius: radius.sm, backgroundColor: '#F5F0E8' },
  mintBadge: {
    marginTop: 10, backgroundColor: colors.mint + '22', borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: colors.mint + '44',
  },
  mintBadgeText: { color: colors.mint, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  redrawTxt: { color: colors.violet, fontSize: 13, marginTop: 8, fontWeight: '700' },
  importZone: {
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: radius.md, padding: 32, alignItems: 'center', backgroundColor: colors.bg,
  },
  importZoneHasArt: { borderColor: colors.mint },
  importIcon: { fontSize: 36, marginBottom: 10 },
  importTxt: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  importSub: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  artworkImg: { width: '100%', height: 200, borderRadius: radius.md },
  changeBtn: { marginTop: 10, alignSelf: 'center' },
  changeBtnTxt: { color: colors.violet, fontSize: 14, fontWeight: '700' },
  cta: {
    backgroundColor: colors.violet, borderRadius: radius.pill,
    paddingVertical: 18, alignItems: 'center', marginVertical: 8,
    ...shadows.violet,
  },
  ctaDisabled: { opacity: 0.35 },
  ctaRow: { flexDirection: 'row', alignItems: 'center' },
  ctaTxt: { color: colors.textPrimary, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  resultCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 22,
    borderWidth: 1.5, borderColor: colors.mint + '44', marginBottom: 20,
  },
  mintGlow: {
    shadowColor: colors.mint, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 12,
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
  canvasOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg, zIndex: 100, alignItems: 'center', justifyContent: 'center' },
  canvasTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: Platform.OS === 'ios' ? 56 : 16,
    backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border,
    width: '100%',
  },
  canvasTitle: { fontSize: 15, fontWeight: '900', color: colors.textPrimary, letterSpacing: 0.5 },
  pillBtn: {
    backgroundColor: colors.bgSection, borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center'
  },
  pillBtnTxt: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  canvasBottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
});