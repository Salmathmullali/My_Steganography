import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, FlatList, RefreshControl, ActivityIndicator, Linking,
} from 'react-native';
import { getPortfolio, getSignedImageUrl } from '../lib/api';
import { SignedImage } from '../types';
import { colors, radius, shadows } from '../constants/design';
import { useFocusEffect } from '@react-navigation/native';

export default function PortfolioScreen({ navigation }: any) {
  const [images, setImages] = useState<SignedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const fetchPortfolio = async () => {
    try {
      const data = await getPortfolio();
      setImages(data);
      // Fetch signed URLs for all images
      const urlMap: Record<string, string> = {};
      await Promise.all(
        data.map(async (img) => {
          if (img.signed_path) {
            urlMap[img.id] = await getSignedImageUrl(img.signed_path);
          }
        })
      );
      setUrls(urlMap);
    } catch (_) {
      // Demo mode or network error — show empty portfolio
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchPortfolio(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchPortfolio(); };

  const renderItem = ({ item, index }: { item: SignedImage; index: number }) => {
    const rotate = index % 3 === 0 ? '-0.8deg' : index % 3 === 1 ? '0.4deg' : '-0.3deg';
    return (
      <TouchableOpacity
        style={[s.thumbCard, { transform: [{ rotate }] }]}
        onPress={() => navigation?.navigate('PortfolioDetail', { image: item, signedUrl: urls[item.id] })}
        activeOpacity={0.88}
      >
        {urls[item.id] ? (
          <Image source={{ uri: urls[item.id] }} style={s.thumb} resizeMode="cover" />
        ) : (
          <View style={[s.thumb, s.thumbPlaceholder]}>
            <ActivityIndicator color={colors.violet} size="small" />
          </View>
        )}
        <View style={s.dnaBadge}>
          <Text style={s.dnaTxt}>🧬</Text>
        </View>
        <View style={s.thumbFooter}>
          <Text style={s.thumbDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={[s.blob, s.blobA]} />
        <View style={s.heroBadge}>
          <Text style={s.heroBadgeTxt}>✦ PORTFOLIO</Text>
        </View>
        <Text style={s.headline}>YOUR{'\n'}SIGNED ART</Text>
        <Text style={s.sub}>{images.length} signed work{images.length !== 1 ? 's' : ''}</Text>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={colors.violet} size="large" />
          <Text style={s.loadingTxt}>Loading portfolio…</Text>
        </View>
      ) : images.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>🎨</Text>
          <Text style={s.emptyTitle}>NO ART YET</Text>
          <Text style={s.emptySub}>Sign your first artwork on the CREATE tab</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => navigation?.navigate('Create')}>
            <Text style={s.emptyBtnTxt}>Create Now →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={s.grid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.violet} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, paddingBottom: 10 },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.08 },
  blobA: { width: 200, height: 200, backgroundColor: colors.violet, top: -60, right: -60 },
  heroBadge: {
    backgroundColor: colors.violet + '22', borderRadius: radius.pill, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12,
    borderWidth: 1, borderColor: colors.violet + '44',
  },
  heroBadgeTxt: { color: colors.violet, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  headline: {
    fontSize: 42, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: -2, lineHeight: 44, marginBottom: 6,
  },
  sub: { fontSize: 15, color: colors.textMuted, fontWeight: '600' },
  grid: { padding: 12, paddingBottom: 120 },
  row: { gap: 12 },
  thumbCard: {
    flex: 1, borderRadius: radius.md, overflow: 'hidden',
    marginBottom: 12, backgroundColor: colors.bgCard,
    borderWidth: 1.5, borderColor: colors.border,
    ...shadows.card,
  },
  thumb: { width: '100%', aspectRatio: 1 },
  thumbPlaceholder: { backgroundColor: colors.bgSection, alignItems: 'center', justifyContent: 'center' },
  dnaBadge: {
    position: 'absolute', bottom: 30, right: 8,
    backgroundColor: colors.bgSection + 'cc',
    borderRadius: radius.pill, width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  dnaTxt: { fontSize: 14 },
  thumbFooter: { padding: 8, backgroundColor: colors.bgCard },
  thumbDate: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTxt: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 28, fontWeight: '900', color: colors.textPrimary, letterSpacing: -1, marginBottom: 8 },
  emptySub: { color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    marginTop: 24, backgroundColor: colors.violet, borderRadius: radius.pill,
    paddingHorizontal: 28, paddingVertical: 14, ...shadows.violet,
  },
  emptyBtnTxt: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
});
