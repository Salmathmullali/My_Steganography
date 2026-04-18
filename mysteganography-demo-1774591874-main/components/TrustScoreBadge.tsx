import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, radius } from '../constants/design';

interface Props {
  score: number;
  label: string;
  likelySource: string;
  size?: number;
}

export default function TrustScoreBadge({ score, label, likelySource, size = 160 }: Props) {
  const strokeWidth = 12;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(100, score));
  const dashOffset = circumference - (progress / 100) * circumference;

  const color =
    score >= 70 ? colors.trustHigh :
    score >= 40 ? colors.trustMid :
    colors.trustLow;

  return (
    <View style={s.container}>
      <View style={[s.badgeWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <Circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={colors.border} strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress arc */}
          <Circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={color} strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {/* Score number in center */}
        <View style={s.centerText}>
          <Text style={[s.scoreNumber, { color }]}>{score}</Text>
          <Text style={s.scorePercent}>%</Text>
        </View>
      </View>

      {/* Label pill — Maxima-inspired pill badge */}
      <View style={[s.labelPill, { borderColor: color + '44', backgroundColor: color + '18' }]}>
        <Text style={[s.labelText, { color }]}>{label.toUpperCase()}</Text>
      </View>

      {/* Source */}
      <Text style={s.sourceText} numberOfLines={2}>{likelySource}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 8 },
  badgeWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  centerText: { position: 'absolute', alignItems: 'center' },
  scoreNumber: { fontSize: 46, fontWeight: '900', letterSpacing: -2 },
  scorePercent: { fontSize: 14, fontWeight: '700', color: colors.textMuted, marginTop: -6 },
  labelPill: {
    marginTop: 14, borderRadius: radius.pill,
    borderWidth: 1.5, paddingHorizontal: 18, paddingVertical: 7,
  },
  labelText: { fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
  sourceText: {
    marginTop: 8, fontSize: 13, color: colors.textMuted,
    fontWeight: '600', textAlign: 'center', maxWidth: 220,
  },
});
