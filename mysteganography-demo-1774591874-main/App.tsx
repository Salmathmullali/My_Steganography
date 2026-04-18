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

const Tab = createBottomTabNavigator();
const PortfolioStack = createNativeStackNavigator();

// ── Portfolio Stack ────────────────────────────────────────────────────────────
function PortfolioNavigator() {
  return (
    <PortfolioStack.Navigator screenOptions={{ headerShown: false }}>
      <PortfolioStack.Screen name="PortfolioList" component={PortfolioScreen} />
      <PortfolioStack.Screen name="PortfolioDetail" component={PortfolioDetailScreen} />
    </PortfolioStack.Navigator>
  );
}

// ── Tab icon component ─────────────────────────────────────────────────────────
function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[tabIconStyle.wrap, focused && tabIconStyle.wrapActive]}>
      <Text style={tabIconStyle.emoji}>{emoji}</Text>
      {focused && <Text style={tabIconStyle.label}>{label}</Text>}
    </View>
  );
}

const tabIconStyle = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radius.pill,
  },
  wrapActive: {
    backgroundColor: colors.violet + '22',
    borderWidth: 1, borderColor: colors.violet + '44',
  },
  emoji: { fontSize: 18 },
  label: { color: colors.violet, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
});

// ── Main Tab Navigator ─────────────────────────────────────────────────────────
function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgCard },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: '900', fontSize: 18, letterSpacing: -0.5 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingVertical: 8,
          height: Platform.OS === 'ios' ? 84 : 68,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.violet,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Create"
        component={SignatureScreen}
        options={{
          title: '🔏 MySteganography',
          headerRight: () => <SettingsHeaderBtn />,
          tabBarIcon: ({ focused }) => <TabIcon emoji="✍️" label="CREATE" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScannerScreen}
        options={{
          title: '🔍 Scan Image',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="SCAN" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioNavigator}
        options={{
          title: '🎨 Portfolio',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎨" label="PORTFOLIO" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '⚙ Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="SETTINGS" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ── Settings header button ─────────────────────────────────────────────────────
function SettingsHeaderBtn() {
  return (
    <TouchableOpacity style={headerBtnStyle.btn}>
      <Text style={headerBtnStyle.txt}>⚙️</Text>
    </TouchableOpacity>
  );
}
const headerBtnStyle = StyleSheet.create({
  btn: { marginRight: 16, padding: 6 },
  txt: { fontSize: 20 },
});

// ── Root App — DEMO MODE (no auth required) ──────────────────────────────────
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <MainNavigator />
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
