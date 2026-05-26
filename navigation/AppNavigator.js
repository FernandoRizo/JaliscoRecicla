// navigation/AppNavigator.js
// ============================================================
//  JaliscoRecicla – Main Navigation
//  Stack: React Navigation v6 + Bottom Tab Navigator
//
//  Install:
//    npx expo install @react-navigation/native
//    npx expo install @react-navigation/native-stack
//    npx expo install @react-navigation/bottom-tabs
//    npx expo install react-native-screens react-native-safe-area-context
// ============================================================

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { NavigationContainer }          from '@react-navigation/native';
import { createNativeStackNavigator }   from '@react-navigation/native-stack';
import { createBottomTabNavigator }     from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons }       from '@expo/vector-icons';

// ── Screens ───────────────────────────────────────────────────
import SplashScreen          from '../screens/SplashScreen';
import LoginScreen           from '../screens/LoginScreen';
import RegisterScreen        from '../screens/RegisterScreen';
import HomeScreen            from '../screens/HomeScreen';
import SearchScreen          from '../screens/SearchScreen';
import MapScreen             from '../screens/MapScreen';
import CenterDetailScreen    from '../screens/CenterDetailScreen';
import ReportScreen          from '../screens/ReportScreen';
import UploadEvidenceScreen  from '../screens/UploadEvidenceScreen';
import ReportSuccessScreen   from '../screens/ReportSuccessScreen';
import NotificationsScreen   from '../screens/NotificationsScreen';
import ProfileScreen         from '../screens/ProfileScreen';
import AdminLoginScreen      from '../screens/AdminLoginScreen';
import AdminDashboardScreen  from '../screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const GREEN = '#16a34a';
const GRAY  = '#9ca3af';
const DARK  = '#1f2937';

// ─────────────────────────────────────────────────────────────
// BOTTOM TAB – Citizen app (screens 4–12)
// ─────────────────────────────────────────────────────────────
function CitizenTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   GREEN,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Inicio:        focused ? 'home'              : 'home-outline',
            Buscar:        focused ? 'magnify'           : 'magnify',
            Reportar:      'plus-circle',
            Mapa:          focused ? 'map'               : 'map-outline',
            Perfil:        focused ? 'account-circle'    : 'account-circle-outline',
          };
          return (
            <MaterialCommunityIcons
              name={icons[route.name]}
              size={route.name === 'Reportar' ? 32 : size}
              color={route.name === 'Reportar' ? '#fff' : color}
            />
          );
        },
        // Custom FAB-style center button for "Reportar"
        tabBarButton: route.name === 'Reportar'
          ? (props) => (
              <TouchableOpacity
                {...props}
                style={styles.fabWrap}
                activeOpacity={0.85}
              >
                <View style={styles.fab}>
                  <MaterialCommunityIcons name="plus" size={28} color="#fff" />
                </View>
              </TouchableOpacity>
            )
          : undefined,
      })}
    >
      <Tab.Screen name="Inicio"   component={HomeScreen}          />
      <Tab.Screen name="Buscar"   component={SearchScreen}        />
      <Tab.Screen name="Reportar" component={ReportScreen}        />
      <Tab.Screen name="Mapa"     component={MapScreen}           />
      <Tab.Screen name="Perfil"   component={ProfileScreen}       />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT STACK – wraps everything
// ─────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        {/* ── Onboarding ── */}
        <Stack.Screen name="Splash"         component={SplashScreen}         />
        <Stack.Screen name="Login"          component={LoginScreen}          />
        <Stack.Screen name="Register"       component={RegisterScreen}       />

        {/* ── Citizen app (tab navigator) ── */}
        <Stack.Screen
          name="Home"
          component={CitizenTabs}
          options={{ animation: 'fade' }}
        />

        {/* ── Screens pushed on top of tabs ── */}
        <Stack.Screen
          name="CenterDetail"
          component={CenterDetailScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="UploadEvidence" component={UploadEvidenceScreen} />
        <Stack.Screen
          name="ReportSuccess"
          component={ReportSuccessScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="Notifs"         component={NotificationsScreen}  />

        {/* ── Admin flow ── */}
        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:   '#fff',
    borderTopWidth:    1,
    borderTopColor:    '#f3f4f6',
    height:            82,
    paddingBottom:     20,
    paddingTop:        8,
    shadowColor:       '#000',
    shadowOpacity:     .06,
    shadowRadius:      12,
    shadowOffset:      { width:0, height:-4 },
    elevation:         8,
  },
  tabLabel: {
    fontSize:   10,
    fontWeight: '600',
    marginTop:  2,
  },
  fabWrap: {
    top:            -18,
    alignItems:     'center',
    justifyContent: 'center',
  },
  fab: {
    width:           58,
    height:          58,
    borderRadius:    29,
    backgroundColor: GREEN,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     GREEN,
    shadowOpacity:   .45,
    shadowRadius:    12,
    shadowOffset:    { width:0, height:6 },
    elevation:       8,
  },
});
