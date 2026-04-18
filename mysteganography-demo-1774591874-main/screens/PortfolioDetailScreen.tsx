import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Alert, Share, Platform,
} from 'react-native';
import { SignedImage } from '../types';
import { colors, radius, shadows } from '../constants/design';

export default function PortfolioDetailScreen({ route, navigation }: any) {
  const { image, signedUrl } = route.params;

  const handleShare = async () => {
    const link = `https://bldvsglqzptpnasinmyi.supabase.co/verify/${image.id}`;
    await Share.share({ message: `Verify my artwork: ${link}` });
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={[s.blob, s.blobA]} />

      {/* Back */}
      <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
        <Text style={s.backTxt}>← Back</Text>
      </TouchableOpacity>

      {/* Image */}
      <View style={[s.imgCard, { transform: [{ rotate: '-0.5deg' }] }]}>
        {signedUrl ? (
          <Image source={{ uri: signedUrl }} style={s.image} resizeMode="cover" />
        ) : (
          <View style={[s.image, s.imgPlaceholder]}>
            <Text style={s.placeholderTxt}>Image stored securely</Text>
          </View>
        )}
        <View style={s.dnaBadge}>
          <Text style={s.dnaTxt}>🧬 DNA SIGNED ✓</Text>
        </View>
      </View>

      {/* Meta card */}
      <View style={s.metaCard}>
        <Text style={s.cardHeadline}>SIGNATURE DETAILS</Text>

        <View style={s.metaRow}>
          <Text style={s.metaLabel}>SIGNED ON</Text>
          <Text style={s.metaValue}>{new Date(image.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.metaRow}>
          <Text style={s.metaLabel}>IMAGE ID</Text>
          <Text style={s.metaValue} numberOfLines={1} ellipsizeMode="middle">
            {image.id.slice(0, 8)}…{image.id.slice(-8)}
          </Text>
        </View>

        <View style={s.divider} />

        <Text style={s.metaLabel}>SIGNATURE HASH (SHA-256)</Text>
        <Text style={s.hashTxt} numberOfLines={2} selectable>
          {image.signature_hash}
        </Text>
      </View>

      {/* Actions */}
      <View style={s.actionsRow}>
        <TouchableOpacity style={s.actionBtn} onPress={handleShare}>
          <Text style={s.actionTxt}>🔗 Share Verify Link</Text>
        </TouchableOpacity>
      </View>

      {/* Info box */}
      <View style={s.infoBox}>
        <Text style={s.infoIcon}>ℹ️</Text>
        <Text style={s.infoTxt}>
          Anyone can verify this artwork's authenticity using the verify link. Your signature hash is permanently embedded in the image pixels.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 100 },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.08 },
  blobA: { width: 200, height: 200, backgroundColor: colors.mint, top: 0, right: -80 },
  backBtn: {
    backgroundColor: colors.bgCard, borderRadius: radius.pill,
    paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start',
    marginBottom: 24, borderWidth: 1, borderColor: colors.border,
  },
  backTxt: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  imgCard: {
    borderRadius: radius.lg, overflow: 'hidden', marginBottom: 20,
    ...shadows.card,
  },
  image: { width: '100%', height: 320 },
  imgPlaceholder: { backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  placeholderTxt: { color: colors.textMuted, fontWeight: '600' },
  dnaBadge: {
    position: 'absolute', bottom: 14, right: 14,
    backgroundColor: colors.mint, borderRadius: radius.pill,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  dnaTxt: { color: colors.textDark, fontSize: 11, fontWeight: '900' },
  metaCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: 22,
    borderWidth: 1.5, borderColor: colors.border, marginBottom: 16,
  },
  cardHeadline: { fontSize: 11, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 18 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  metaLabel: { fontSize: 10, fontWeight: '900', color: colors.textMuted, letterSpacing: 1.5 },
  metaValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  hashTxt: {
    color: colors.violet, fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 8, lineHeight: 17,
  },
  actionsRow: { marginBottom: 16 },
  actionBtn: {
    backgroundColor: colors.violet, borderRadius: radius.pill,
    paddingVertical: 17, alignItems: 'center',
    ...shadows.violet,
  },
  actionTxt: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  infoBox: {
    backgroundColor: colors.bgCard, borderRadius: radius.md, padding: 16,
    flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: colors.border,
  },
  infoIcon: { fontSize: 18 },
  infoTxt: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 19 },
});
