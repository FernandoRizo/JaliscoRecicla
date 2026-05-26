// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../config/firebaseConfig';
import { getUser, getUserReports } from '../services/firestoreService';
import { logout } from '../services/authService';

const MENU_ITEMS = [
  { icon: 'file-document-outline', label: 'Mis reportes',   sub: '12 enviados', screen: 'MyReports',  color: '#3b82f6', bg: '#dbeafe' },
  { icon: 'heart-outline',         label: 'Favoritos',      sub: '5 centros',   screen: 'Favorites',  color: '#ec4899', bg: '#fce7f3' },
  { icon: 'cog-outline',           label: 'Configuración',  sub: null,          screen: 'Settings',   color: '#6b7280', bg: '#f3f4f6' },
  { icon: 'help-circle-outline',   label: 'Ayuda y soporte',sub: null,          screen: 'Help',       color: '#d97706', bg: '#fef3c7' },
];

export default function ProfileScreen({ navigation }) {
  const [user,         setUser]         = useState(null);
  const [reportCount,  setReportCount]  = useState(0);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getUser(uid).then(setUser);
    getUserReports(uid).then(r => setReportCount(r.length));
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir', style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const initial = user?.fullName?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Back */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi perfil</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <MaterialCommunityIcons name="pencil-outline" size={22} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Avatar + info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user?.fullName ?? 'Cargando...'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatBox value={reportCount}  label="Reportes" />
            <StatBox value={5}            label="Favoritos" />
            <StatBox value={320}          label="Puntos" />
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuBorder]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.logoutCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: '#fee2e2' }]}>
              <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: '#dc2626' }]}>Cerrar sesión</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>JaliscoRecicla v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  safe:         { flex:1, backgroundColor:'#f9fafb' },
  header:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:14 },
  backBtn:      { width:38, height:38, backgroundColor:'#f3f4f6', borderRadius:12, alignItems:'center', justifyContent:'center' },
  headerTitle:  { fontSize:18, fontWeight:'800', color:'#111' },
  profileCard:  { backgroundColor:'#fff', margin:16, borderRadius:24, padding:20, alignItems:'center', gap:6, shadowColor:'#000', shadowOpacity:.05, shadowRadius:10, shadowOffset:{width:0,height:2} },
  avatar:       { width:80, height:80, borderRadius:24, backgroundColor:GREEN, alignItems:'center', justifyContent:'center', marginBottom:4 },
  avatarTxt:    { color:'#fff', fontSize:28, fontWeight:'800' },
  name:         { fontSize:20, fontWeight:'800', color:'#111' },
  email:        { fontSize:14, color:'#6b7280' },
  statsRow:     { flexDirection:'row', gap:0, marginTop:16, width:'100%', borderTopWidth:1, borderTopColor:'#f3f4f6', paddingTop:16 },
  statBox:      { flex:1, alignItems:'center', gap:2 },
  statVal:      { fontSize:22, fontWeight:'800', color:'#111' },
  statLbl:      { fontSize:12, color:'#9ca3af', fontWeight:'600' },
  menuCard:     { backgroundColor:'#fff', marginHorizontal:16, marginBottom:12, borderRadius:20, overflow:'hidden', shadowColor:'#000', shadowOpacity:.04, shadowRadius:8, shadowOffset:{width:0,height:2} },
  logoutCard:   { backgroundColor:'#fff', marginHorizontal:16, marginBottom:12, borderRadius:20, overflow:'hidden' },
  menuItem:     { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:14, gap:14 },
  menuBorder:   { borderBottomWidth:1, borderBottomColor:'#f3f4f6' },
  menuIcon:     { width:40, height:40, borderRadius:13, alignItems:'center', justifyContent:'center' },
  menuText:     { flex:1 },
  menuLabel:    { fontSize:15, fontWeight:'700', color:'#111' },
  menuSub:      { fontSize:12, color:'#9ca3af', marginTop:1 },
  version:      { textAlign:'center', color:'#d1d5db', fontSize:12, marginBottom:32 },
});
