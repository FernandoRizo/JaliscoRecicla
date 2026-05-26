// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../config/firebaseConfig';
import { getUser } from '../services/firestoreService';

const QUICK_ACTIONS = [
  { icon: 'magnify',           label: 'Buscar\nresiduos',    screen: 'Search',   color: '#16a34a', bg: '#dcfce7' },
  { icon: 'map-marker',        label: 'Ver\nmapa',           screen: 'Map',      color: '#0d9488', bg: '#ccfbf1' },
  { icon: 'flag-plus-outline', label: 'Reportar\ncentro',    screen: 'Report',   color: '#dc2626', bg: '#fee2e2' },
  { icon: 'bell-outline',      label: 'Mis\nnotificaciones', screen: 'Notifs',   color: '#d97706', bg: '#fef3c7' },
];

const QUICK_CHIPS = [
  { icon: 'bottle-soda-outline', label: 'Botellas', color: '#f59e0b' },
  { icon: 'file-document-outline', label: 'Papel',  color: '#3b82f6' },
  { icon: 'glass-fragile',       label: 'Vidrio',   color: '#8b5cf6' },
  { icon: 'leaf',                label: 'Orgánico', color: '#16a34a' },
];

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) getUser(uid).then(setUser);
  }, []);

  const firstName = user?.fullName?.split(' ')[0] ?? 'Usuario';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>¡Hola, {firstName}!</Text>
            <Text style={styles.location}>Jalisco, México</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
            <Text style={styles.avatarTxt}>{firstName[0]}</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
          <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
          <Text style={styles.searchPlaceholder}>¿Qué quieres hacer?</Text>
        </TouchableOpacity>

        {/* Quick actions grid */}
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.actionCard, { backgroundColor: a.bg }]}
              onPress={() => navigation.navigate(a.screen)}
            >
              <MaterialCommunityIcons name={a.icon} size={32} color={a.color} />
              <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick chips */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {QUICK_CHIPS.map((c) => (
            <TouchableOpacity
              key={c.label}
              style={styles.chip}
              onPress={() => navigation.navigate('Search', { category: c.label })}
            >
              <MaterialCommunityIcons name={c.icon} size={22} color={c.color} />
              <Text style={[styles.chipTxt, { color: c.color }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tip of the day */}
        <View style={styles.tipCard}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color="#d97706" />
          <Text style={styles.tipTitle}>Tips del día</Text>
          <Text style={styles.tipBody}>
            Recuerda enjuagar los envases antes de reciclarlos. Esto ayuda a evitar contaminación y malos olores en el contenedor.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  safe:           { flex:1, backgroundColor:'#fff' },
  topBar:         { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingTop:16, paddingBottom:12 },
  greeting:       { fontSize:20, fontWeight:'800', color:'#111' },
  location:       { fontSize:13, color:'#6b7280', marginTop:2 },
  avatar:         { width:42, height:42, borderRadius:14, backgroundColor:GREEN, alignItems:'center', justifyContent:'center' },
  avatarTxt:      { color:'#fff', fontWeight:'800', fontSize:16 },
  searchBar:      { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#f3f4f6', borderRadius:14, marginHorizontal:20, padding:13, marginBottom:20 },
  searchPlaceholder:{ color:'#9ca3af', fontSize:15 },
  actionsGrid:    { flexDirection:'row', flexWrap:'wrap', paddingHorizontal:20, gap:12, marginBottom:20 },
  actionCard:     { width:'47%', borderRadius:20, padding:18, alignItems:'center', gap:10 },
  actionLabel:    { fontSize:13, fontWeight:'700', textAlign:'center' },
  sectionTitle:   { fontSize:16, fontWeight:'700', color:'#111', paddingHorizontal:20, marginBottom:12 },
  chipsRow:       { paddingHorizontal:20, gap:10, paddingBottom:4 },
  chip:           { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#f9fafb', borderRadius:100, paddingVertical:10, paddingHorizontal:16, borderWidth:1.5, borderColor:'#e5e7eb' },
  chipTxt:        { fontSize:13, fontWeight:'700' },
  tipCard:        { margin:20, backgroundColor:'#fefce8', borderRadius:20, padding:16, borderLeftWidth:4, borderLeftColor:'#fbbf24', gap:6 },
  tipTitle:       { fontSize:15, fontWeight:'700', color:'#92400e' },
  tipBody:        { fontSize:13, color:'#78350f', lineHeight:20 },
});
