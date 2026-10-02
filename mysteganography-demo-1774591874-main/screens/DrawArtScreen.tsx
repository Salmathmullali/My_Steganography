import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { colors, typography, spacing, radius, shadows } from '../constants/design';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COLOR_PALETTE = [
  '#FFFFFF', '#00FFCC', '#8A2BE2', '#FF2E63', '#FFD700', 
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#000000'
];

export default function DrawArtScreen({ navigation }: any) {
  const canvasRef = useRef<any>(null);
  const [activeColor, setActiveColor] = useState(colors.mint);
  const [isEraser, setIsEraser] = useState(false);
  const [brushSize, setBrushSize] = useState(4);

  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  const handleClear = () => canvasRef.current?.clearSignature();

  const handleColorSelect = (color: string) => {
    setActiveColor(color);
    canvasRef.current?.changePenColor(color);
    setIsEraser(false);
  };

  const handleEraser = () => {
    setIsEraser(true);
    canvasRef.current?.changePenColor('#FFFFFF'); // Assuming canvas bg is white or using transparency
  };

  const handleSignRedirect = () => {
    canvasRef.current?.readSignature();
  };

  const onOK = (signature: string) => {
    // Redirect to SignatureScreen with the drawing data as the source image
    navigation.navigate('Signature', { drawingUri: signature });
  };

  return (
    <View style={s.container}>
      <View style={s.toolbar}>
        <View style={s.toolGroup}>
          <TouchableOpacity style={s.actionBtn} onPress={handleUndo}>
            <Text style={s.actionBtnTxt}>⟲</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={handleRedo}>
            <Text style={s.actionBtnTxt}>⟳</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.headerTitle}>CANVAS_LAB</Text>

        <TouchableOpacity style={[s.actionBtn, { borderColor: colors.danger }]} onPress={handleClear}>
          <Text style={[s.actionBtnTxt, { color: colors.danger }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={s.canvasContainer}>
        <SignatureCanvas
          ref={canvasRef}
          onOK={onOK}
          onEmpty={() => Alert.alert('Canvas Empty', 'Please draw something before signing.')}
          descriptionText=""
          clearText="Clear"
          confirmText="Confirm"
          webStyle={`.m-signature-pad--footer {display: none; margin: 0;}`}
          autoClear={false}
          imageType="image/png"
        />
      </View>

      <View style={s.bottomPanel}>
        <View style={s.brushTools}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.colorScroll}>
            {COLOR_PALETTE.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  s.colorCircle, 
                  { backgroundColor: color },
                  activeColor === color && !isEraser && s.activeColorCircle
                ]}
                onPress={() => handleColorSelect(color)}
              />
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={[s.eraserBtn, isEraser && s.activeEraser]} 
            onPress={handleEraser}
          >
            <Text style={s.eraserTxt}>🧹</Text>
          </TouchableOpacity>
        </View>

        <View style={s.footerActions}>
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>BRUSH_SIZE</Text>
            <View style={s.sizeRow}>
              {[2, 4, 8, 16].map((size) => (
                <TouchableOpacity 
                  key={size} 
                  onPress={() => {
                    setBrushSize(size);
                    canvasRef.current?.changePenSize(size, size);
                  }}
                  style={[s.sizeDot, { width: size+4, height: size+4, backgroundColor: activeColor }, brushSize === size && s.activeSize]}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity style={s.ctaBtn} onPress={handleSignRedirect}>
            <LinearGradient
              colors={[colors.violet, colors.mint]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.ctaGradient}
            >
              <Text style={s.ctaText}>CREATE HIDDEN SIGN ➔</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
  },
  toolGroup: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSection,
  },
  actionBtnTxt: { fontSize: 20, color: colors.textSecondary, fontWeight: 'bold' },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Signature pad works best with white/solid bg
    margin: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  bottomPanel: {
    backgroundColor: colors.bgCard,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  brushTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: spacing.lg,
  },
  colorScroll: { gap: 12, paddingRight: 40 },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColorCircle: {
    borderColor: colors.textPrimary,
    transform: [{ scale: 1.1 }],
  },
  eraserBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bgSection,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeEraser: {
    borderColor: colors.mint,
    backgroundColor: colors.mint + '22',
  },
  eraserTxt: { fontSize: 20 },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoBox: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sizeDot: {
    borderRadius: 99,
    opacity: 0.5,
  },
  activeSize: {
    opacity: 1,
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  ctaBtn: {
    flex: 2,
    height: 54,
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...shadows.violet,
  },
  ctaGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: colors.textPrimary,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  }
});
