import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';
import { colors, radius, spacing, typography, shadows } from '../constants/design';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function CameraScreen({ navigation }: any) {
  const [isFront, setIsFront] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  
  const devices = useCameraDevices();
  const device = isFront ? devices.front : devices.back;
  const camera = useRef<Camera>(null);

  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const toggleCamera = () => setIsFront(!isFront);
  const toggleFlash = () => setFlash(flash === 'off' ? 'on' : 'off');

  const takePhoto = async () => {
    if (!camera.current) return;
    try {
      setIsCapturing(true);
      const photo = await camera.current.takePhoto({
        flash: flash,
      });
      setIsCapturing(false);
      
      // Redirect to SignatureScreen with the photo path
      navigation.navigate('Signature', { imageUri: `file://${photo.path}` });
    } catch (e) {
      setIsCapturing(false);
      Alert.alert('Capture Error', 'COULD_NOT_STABILIZE_FRAME');
    }
  };

  if (!hasPermission) {
    return (
      <View style={s.center}>
        <Text style={s.permissionTxt}>REQUESTING_EYE_ACCESS...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.mint} size="large" />
        <Text style={s.permissionTxt}>INITIALIZING_OPTICAL_SENSORS...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Overlay UI */}
      <View style={s.overlay}>
        <LinearGradient
          colors={['transparent', 'rgba(5,7,10,0.8)']}
          style={s.bottomFade}
        />

        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backTxt}>← BACK</Text>
          </TouchableOpacity>
          <View style={s.statusPill}>
            <View style={s.liveDot} />
            <Text style={s.statusText}>LIVE_STREAM ACTIVE</Text>
          </View>
        </View>

        <View style={s.controls}>
          <TouchableOpacity style={s.sideBtn} onPress={toggleFlash}>
            <Text style={s.sideIcon}>{flash === 'on' ? '⚡️' : '🌑'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.captureBtn} 
            onPress={takePhoto}
            disabled={isCapturing}
          >
            <View style={s.captureInner}>
              {isCapturing ? <ActivityIndicator color={colors.bg} /> : <View style={s.captureDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={s.sideBtn} onPress={toggleCamera}>
            <Text style={s.sideIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.instruction}>STABILIZE FRAME TO INJECT HIDDEN DNA</Text>
        </View>
      </View>

      {/* Futuristic Grid Overlay */}
      <View style={s.gridContainer} pointerEvents="none">
        <View style={s.cornerTL} />
        <View style={s.cornerTR} />
        <View style={s.cornerBL} />
        <View style={s.cornerBR} />
        <View style={s.centerReticle} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  permissionTxt: { color: colors.mint, fontWeight: '900', letterSpacing: 2, fontSize: 12 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  bottomFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 300 },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backBtn: {
    backgroundColor: 'rgba(5,7,10,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  backTxt: { color: '#fff', fontSize: 10, fontWeight: '900' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,204,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.mint + '44'
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.mint, marginRight: 6 },
  statusText: { color: colors.mint, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 40,
  },
  sideBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(5,7,10,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  sideIcon: { fontSize: 24 },
  captureBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  captureInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.bg, opacity: 0.2 },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  instruction: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  gridContainer: { ...StyleSheet.absoluteFillObject, padding: 40 },
  cornerTL: { position: 'absolute', top: 100, left: 40, width: 30, height: 30, borderTopWidth: 2, borderLeftWidth: 2, borderColor: colors.mint },
  cornerTR: { position: 'absolute', top: 100, right: 40, width: 30, height: 30, borderTopWidth: 2, borderRightWidth: 2, borderColor: colors.mint },
  cornerBL: { position: 'absolute', bottom: 180, left: 40, width: 30, height: 30, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: colors.mint },
  cornerBR: { position: 'absolute', bottom: 180, right: 40, width: 30, height: 30, borderBottomWidth: 2, borderRightWidth: 2, borderColor: colors.mint },
  centerReticle: { 
    position: 'absolute', top: '40%', left: '50%', 
    width: 40, height: 40, marginLeft: -20, marginTop: -20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 20
  }
});
