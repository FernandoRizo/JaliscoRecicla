// App.js
// ============================================================
//  JaliscoRecicla – Root entry point
//  Handles: auth state listener, font loading, splash hiding
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthChange } from './services/authService';
import { getUser }      from './services/firestoreService';
import AppNavigator     from './navigation/AppNavigator';

// Keep the native splash visible while we prepare resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady,  setAppReady]  = useState(false);
  const [authUser,  setAuthUser]  = useState(undefined); // undefined = loading
  const [userRole,  setUserRole]  = useState(null);

  // ── Load fonts + watch auth state ──────────────────────────
  useEffect(() => {
    const prepare = async () => {
      try {
        // Pre-load any custom fonts here if needed
        // await Font.loadAsync({ 'Inter': require('./assets/fonts/Inter.ttf') });
        await new Promise(resolve => setTimeout(resolve, 800)); // brief pause
      } catch (e) {
        console.warn('Font load error:', e);
      } finally {
        setAppReady(true);
      }
    };

    prepare();

    // Firebase auth listener
    const unsubscribe = onAuthChange(async (user) => {
      setAuthUser(user);
      if (user) {
        const profile = await getUser(user.uid);
        setUserRole(profile?.role ?? 'citizen');
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ── Hide native splash once ready ──────────────────────────
  const onLayoutRootView = useCallback(async () => {
    if (appReady && authUser !== undefined) {
      await SplashScreen.hideAsync();
    }
  }, [appReady, authUser]);

  // ── Loading state ──────────────────────────────────────────
  if (!appReady || authUser === undefined) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // ── Determine initial route based on auth + role ───────────
  // AppNavigator always starts at "Splash" but we can pass
  // the resolved user + role as context if needed.
  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <StatusBar style="auto" />
      <AppNavigator
        initialUser={authUser}
        userRole={userRole}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
