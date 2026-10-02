import 'react-native-gesture-handler';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, radius } from './constants/design';

// Auth Screens (kept for future use — bypassed in demo mode)

// Main Screens
import SignatureScreen from './screens/SignatureScreen';
import ScannerScreen from './screens/ScannerScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import PortfolioDetailScreen from './screens/PortfolioDetailScreen';
import SettingsScreen from './screens/SettingsScreen';

import WelcomeScreen from './screens/WelcomeScreen';
import DrawArtScreen from './screens/DrawArtScreen';
import CameraScreen from './screens/CameraScreen';

const PortfolioStack = createNativeStackNavigator();

function PortfolioNavigator() {
  return (
    <PortfolioStack.Navigator screenOptions={{ headerShown: false }}>
      <PortfolioStack.Screen name="PortfolioList" component={PortfolioScreen} />
      <PortfolioStack.Screen name="PortfolioDetail" component={PortfolioDetailScreen} />
    </PortfolioStack.Navigator>
  );
}

const RootStack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <RootStack.Screen name="Welcome" component={WelcomeScreen} />
      <RootStack.Screen name="Scan" component={ScannerScreen} />
      <RootStack.Screen name="Signature" component={SignatureScreen} />
      <RootStack.Screen name="DrawArt" component={DrawArtScreen} />
      <RootStack.Screen name="Camera" component={CameraScreen} />
      <RootStack.Screen name="Portfolio" component={PortfolioNavigator} />
      <RootStack.Screen name="Settings" component={SettingsScreen} />
    </RootStack.Navigator>
  );
}

// ── Root App — DEMO MODE ──────────────────────────────────────────────────
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}



const appStyle = StyleSheet.create({
  loading: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  loadingLogo: { fontSize: 60 },
  loadingTxt: {
    color: colors.textSecondary, fontSize: 18, fontWeight: '800',
    marginTop: 12, letterSpacing: -0.5,
  },
});
