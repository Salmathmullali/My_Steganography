import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, radius, shadows } from '../../constants/design';

interface Props { onNavigateToLogin: () => void; }

export default function RegisterScreen({ onNavigateToLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Missing Fields', 'Please fill in all fields.'); return; }
    if (password.length < 6) { Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setLoading(false); Alert.alert('Registration Failed', error.message); return; }
    if (data.user) {
      await supabase.from('user_profiles').upsert({ id: data.user.id, display_name: name });
    }
    setLoading(false);
    Alert.alert('Account Created! 🎉', 'Welcome to MySteganography. Sign in to get started.',
      [{ text: 'Sign In', onPress: onNavigateToLogin }]);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[s.blob, s.blobTL]} />
      <View style={[s.blob, s.blobBR]} />
      <View style={[s.blob, s.blobMid]} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoBadge}>
          <Text style={s.logoEmoji}>🎨</Text>
          <Text style={s.logoText}>MySteganography</Text>
        </View>

        <Text style={s.headline}>CREATE{'\n'}ACCOUNT</Text>
        <Text style={s.tagline}>Your invisible signature awaits</Text>

        <View style={s.card}>
          <Text style={s.label}>ARTIST NAME</Text>
          <TextInput
            style={s.input} placeholder="Your artist name" placeholderTextColor={colors.textMuted}
            value={name} onChangeText={setName} autoCapitalize="words"
          />
          <Text style={s.label}>EMAIL</Text>
          <TextInput
            style={s.input} placeholder="you@example.com" placeholderTextColor={colors.textMuted}
            value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
          />
          <Text style={s.label}>PASSWORD</Text>
          <TextInput
            style={s.input} placeholder="Min. 6 characters" placeholderTextColor={colors.textMuted}
            value={password} onChangeText={setPassword} secureTextEntry
          />
          <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.textDark} /> :
              <Text style={s.btnText}>Create Account →</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onNavigateToLogin} style={s.pillLink}>
          <Text style={s.pillLinkText}>Already have an account? <Text style={{ color: colors.mint }}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28, paddingTop: 60 },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.12 },
  blobTL: { width: 200, height: 200, backgroundColor: colors.mint, top: -80, left: -80 },
  blobBR: { width: 150, height: 150, backgroundColor: colors.coral, bottom: 100, right: -50 },
  blobMid: { width: 100, height: 100, backgroundColor: colors.amber, top: '40%', right: 40, opacity: 0.08 },
  logoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.bgCard, borderRadius: radius.pill,
    paddingHorizontal: 18, paddingVertical: 10, alignSelf: 'flex-start',
    borderWidth: 1.5, borderColor: colors.border, marginBottom: 32,
  },
  logoEmoji: { fontSize: 22 },
  logoText: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  headline: {
    fontSize: 50, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: -2, lineHeight: 52, marginBottom: 8,
  },
  tagline: { fontSize: 16, color: colors.textSecondary, marginBottom: 36 },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: 24,
    borderWidth: 1.5, borderColor: colors.border,
    transform: [{ rotate: '0.5deg' }],
    ...shadows.card,
  },
  label: {
    fontSize: 11, fontWeight: '800', color: colors.textMuted,
    letterSpacing: 1.5, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.borderLight,
    borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14,
    color: colors.textPrimary, fontSize: 16,
  },
  btn: {
    backgroundColor: colors.mint, borderRadius: radius.pill,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
    ...shadows.mint,
  },
  btnText: { color: colors.textDark, fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  pillLink: {
    marginTop: 24, alignSelf: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.pill,
    paddingHorizontal: 20, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  pillLinkText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
});
