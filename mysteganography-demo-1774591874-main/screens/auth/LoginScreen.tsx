import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { colors, radius, shadows } from '../../constants/design';

interface Props { onNavigateToRegister: () => void; }

export default function LoginScreen({ onNavigateToRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Missing Fields', 'Please enter email and password.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Login Failed', error.message);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Decorative blob shapes — Maxima-inspired geometric decoration */}
      <View style={[s.blob, s.blobTopRight]} />
      <View style={[s.blob, s.blobBottomLeft]} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo badge — pill shaped like Maxima nav */}
        <View style={s.logoBadge}>
          <Text style={s.logoEmoji}>🔏</Text>
          <Text style={s.logoText}>MySteganography</Text>
        </View>

        {/* Bold blocky heading — Maxima style */}
        <Text style={s.headline}>SIGN IN</Text>
        <Text style={s.tagline}>Protect what you create</Text>

        {/* Form card — slightly tilted like Maxima cards */}
        <View style={s.card}>
          <Text style={s.label}>EMAIL</Text>
          <TextInput
            style={s.input} placeholder="you@example.com" placeholderTextColor={colors.textMuted}
            value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
          />
          <Text style={s.label}>PASSWORD</Text>
          <TextInput
            style={s.input} placeholder="••••••••" placeholderTextColor={colors.textMuted}
            value={password} onChangeText={setPassword} secureTextEntry
          />
          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.textDark} /> :
              <Text style={s.btnText}>Sign In →</Text>}
          </TouchableOpacity>
        </View>

        {/* Pill link — Maxima pill button style */}
        <TouchableOpacity onPress={onNavigateToRegister} style={s.pillLink}>
          <Text style={s.pillLinkText}>New here? <Text style={{ color: colors.coral }}>Create Account</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28, paddingTop: 60 },
  blob: {
    position: 'absolute', borderRadius: 999, opacity: 0.12,
  },
  blobTopRight: {
    width: 220, height: 220, backgroundColor: colors.violet,
    top: -60, right: -60,
  },
  blobBottomLeft: {
    width: 180, height: 180, backgroundColor: colors.coral,
    bottom: 80, left: -70,
  },
  logoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.bgCard, borderRadius: radius.pill,
    paddingHorizontal: 18, paddingVertical: 10, alignSelf: 'flex-start',
    borderWidth: 1.5, borderColor: colors.border, marginBottom: 32,
    ...shadows.card,
  },
  logoEmoji: { fontSize: 22 },
  logoText: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  headline: {
    fontSize: 52, fontWeight: '900', color: colors.textPrimary,
    letterSpacing: -2, lineHeight: 54, marginBottom: 8,
  },
  tagline: { fontSize: 16, color: colors.textSecondary, marginBottom: 36 },
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: 24,
    borderWidth: 1.5, borderColor: colors.border,
    // Subtle tilt like Maxima's tilted cards
    transform: [{ rotate: '-0.5deg' }],
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
    backgroundColor: colors.coral, borderRadius: radius.pill,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
    ...shadows.coral,
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
