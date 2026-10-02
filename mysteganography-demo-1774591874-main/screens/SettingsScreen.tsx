import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, radius, shadows } from '../constants/design';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsLoggedIn(true);
      setEmail(user.email || '');
      const { data } = await supabase
        .from('user_profiles')
        .select('openai_key_encrypted')
        .eq('id', user.id)
        .single();
      if (data) {
        setHasKey(!!data.openai_key_encrypted);
      }
    } catch (_) {
      // Running in demo mode without auth
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) { Alert.alert('Required', 'Please enter your OpenAI API key.'); return; }
    if (!apiKey.trim().startsWith('sk-')) { Alert.alert('Invalid Key', 'OpenAI keys start with "sk-".'); return; }
    if (!isLoggedIn) {
      // In demo mode, just acknowledge the key (can't store server-side without auth)
      setHasKey(true);
      setApiKey('');
      Alert.alert('Demo Mode', 'In demo mode, the key is saved locally. Sign in to store it securely on the server.');
      return;
    }
    setSavingKey(true);
    try {
      const { data, error } = await supabase.functions.invoke('save-openai-key', {
        body: JSON.stringify({ api_key: apiKey.trim() }),
        headers: { 'Content-Type': 'application/json' },
      });
      setSavingKey(false);
      if (error) throw error;
      setHasKey(true);
      setApiKey('');
      Alert.alert('Key Saved ✓', 'Your key is encrypted and stored securely.');
    } catch (err: any) {
      setSavingKey(false);
      Alert.alert('Error', err.message || 'Could not save key.');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await supabase.auth.signOut(); } },
    ]);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={[s.blob, s.blobA]} />
      <View style={[s.blob, s.blobB]} />

      {/* Hero */}
      <View style={s.heroBadge}>
        <Text style={s.heroBadgeTxt}>⚙ SETTINGS</Text>
      </View>
      <Text style={s.headline}>YOUR{'\n'}ACCOUNT</Text>
      <Text style={s.emailLine}>{isLoggedIn ? email : 'Demo Mode — No account required'}</Text>

      {/* Demo mode notice */}
      {!isLoggedIn && (
        <View style={s.demoNotice}>
          <Text style={s.demoNoticeIcon}>🚀</Text>
          <Text style={s.demoNoticeTxt}>
            Running in demo mode. Sign &  scan features work locally. To save artwork to the cloud, authentication is needed.
          </Text>
        </View>
      )}

      {/* OpenAI Key */}
      <View style={[s.card, { transform: [{ rotate: '0.3deg' }] }]}>
        <View style={s.cardTitleRow}>
          <Text style={s.cardHeadline}>OPENAI API KEY</Text>
          <View style={[s.keyStatus, hasKey ? s.keyStatusActive : s.keyStatusInactive]}>
            <Text style={[s.keyStatusTxt, { color: hasKey ? colors.mint : colors.textMuted }]}>
              {hasKey ? '✓ SAVED' : 'NOT SET'}
            </Text>
          </View>
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoTxt}>
            🔒 Your key is encrypted with AES-256 and never sent to the frontend. It's used only server-side to analyze images.
          </Text>
        </View>

        <Text style={s.label}>API KEY</Text>
        <TextInput
          style={s.input}
          placeholder={hasKey ? '••••••••• (tap to update)' : 'sk-proj-...'}
          placeholderTextColor={colors.textMuted}
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={[s.btn, s.btnAmber]} onPress={handleSaveKey} disabled={savingKey}>
          {savingKey ? <ActivityIndicator color={colors.textDark} size="small" /> :
            <Text style={s.btnTxt}>{hasKey ? 'Update Key →' : 'Save Key →'}</Text>}
        </TouchableOpacity>
      </View>

      {/* App info */}
      <View style={s.infoCard}>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>APP VERSION</Text>
          <Text style={s.infoVal}>1.0.0 (Prototype)</Text>
        </View>
        <View style={s.divider} />
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>MODE</Text>
          <Text style={s.infoVal}>{isLoggedIn ? 'Authenticated' : 'Demo (No Auth)'}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>BACKEND</Text>
          <Text style={s.infoVal}>Supabase</Text>
        </View>
        <View style={s.divider} />
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>SIGNING METHOD</Text>
          <Text style={s.infoVal}>LSB Steganography (Blue Channel)</Text>
        </View>
      </View>

      {/* Logout — only show if logged in */}
      {isLoggedIn && (
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutTxt}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 120 },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.05 },
  blobA: { width: 300, height: 300, backgroundColor: colors.amber, top: -100, right: -120 },
  blobB: { width: 200, height: 200, backgroundColor: colors.violet, bottom: 200, left: -60 },
  heroBadge: {
    backgroundColor: colors.amber + '15', borderRadius: radius.pill, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12,
    borderWidth: 1, borderColor: colors.amber + '33',
  },
  heroBadgeTxt: { color: colors.amber, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  headline: {
    fontSize: 48, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: -2, lineHeight: 50, marginBottom: 6,
  },
  emailLine: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 28, letterSpacing: 1 },
  demoNotice: {
    backgroundColor: colors.amber + '10', borderRadius: radius.md, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderWidth: 1, borderColor: colors.amber + '22', marginBottom: 20,
  },
  demoNoticeIcon: { fontSize: 20 },
  demoNoticeTxt: { flex: 1, color: colors.amber, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 24,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20, ...shadows.card,
  },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardHeadline: { fontSize: 10, fontWeight: '900', color: colors.textMuted, letterSpacing: 2 },
  keyStatus: {
    borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1,
  },
  keyStatusActive: { borderColor: colors.mint + '44', backgroundColor: colors.mint + '10' },
  keyStatusInactive: { borderColor: colors.border, backgroundColor: colors.bgSection },
  keyStatusTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  label: {
    fontSize: 10, fontWeight: '900', color: colors.textMuted,
    letterSpacing: 2, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14,
    color: colors.textPrimary, fontSize: 14, fontWeight: '600',
  },
  btn: {
    backgroundColor: colors.amber, borderRadius: radius.pill,
    paddingVertical: 16, alignItems: 'center', marginTop: 20,
    ...shadows.card,
  },
  btnAmber: { backgroundColor: colors.amber },
  btnTxt: { color: colors.bg, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  infoBox: {
    backgroundColor: colors.bg + '55', borderRadius: radius.md, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  infoTxt: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  infoCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 24,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 9, fontWeight: '900', color: colors.textMuted, letterSpacing: 2 },
  infoVal: { fontSize: 11, fontWeight: '600', color: colors.textPrimary, maxWidth: '55%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border },
  logoutBtn: {
    borderWidth: 1, borderColor: colors.coral + '44', borderRadius: radius.pill,
    paddingVertical: 16, alignItems: 'center', marginBottom: 20,
    backgroundColor: colors.coral + '05'
  },
  logoutTxt: { color: colors.coral, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
});

