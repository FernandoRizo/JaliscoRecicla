// screens/CenterDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image, Linking, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCenterWasteTypes, getWasteTypes } from '../services/firestoreService';

export default function CenterDetailScreen({ route, navigation }) {
  const { center } = route.params;
  const [wasteLabels, setWasteLabels] = useState([]);

  useEffect(() => {
    (async () => {
      const links  = await getCenterWasteTypes(center.id);
      const all    = await getWasteTypes();
      const labels = links.map(l => all.find(w => w.id === l.wasteTypeID)?.name ?? l.wasteTypeID);
      setWasteLabels(labels);
    })();
  }, [center.id]);

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'No se pudo abrir el mapa.'));
  };

  const WASTE_COLORS = {
    'Plástico (PET)': '#f59e0b',
    'Vidrio':         '#8b5cf6',
    'Papel y Cartón': '#3b82f6',
    'Orgánico':       '#16a34a',
    'Electrónico':    '#ef4444',
    'Metal':          '#6b7280',
  };

  return (
    <View style={styles.container}>
      {/* Header image area */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteBtn}>
          <MaterialCommunityIcons name="heart-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <MaterialCommunityIcons name="recycle" size={64} color="rgba(255,255,255,.6)" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Status + rating */}
        <View style={styles.topRow}>
          <View style={[styles.statusBadge, { backgroundColor: center.status === 'active' ? '#dcfce7' : '#fee2e2' }]}>
            <View style={[styles.statusDot, { backgroundColor: center.status === 'active' ? '#16a34a' : '#dc2626' }]} />
            <Text style={[styles.statusTxt, { color: center.status === 'active' ? '#16a34a' : '#dc2626' }]}>
              {center.status === 'active' ? 'Abierto' : 'Cerrado'}
            </Text>
          </View>
          <Text style={styles.rating}>⭐ {center.rating?.toFixed(1)} ({center.ratingCount})</Text>
        </View>

        <Text style={styles.title}>{center.name}</Text>
        <Text style={styles.subtitle}>{center.address}</Text>

        {/* Info rows */}
        <View style={styles.infoCard}>
          <InfoRow icon="clock-outline"   text={center.schedule ?? 'Lun–Vie 8:00–18:00'} />
          <InfoRow icon="phone-outline"   text={center.phone    ?? 'Sin teléfono registrado'} />
          <InfoRow icon="map-marker-outline" text={`${center.latitude?.toFixed(5)}, ${center.longitude?.toFixed(5)}`} />
        </View>

        {/* Waste types */}
        <Text style={styles.sectionTitle}>Materiales aceptados</Text>
        <View style={styles.pillsRow}>
          {wasteLabels.length > 0
            ? wasteLabels.map((l) => (
                <View key={l} style={[styles.pill, { backgroundColor: (WASTE_COLORS[l] ?? '#6b7280') + '22' }]}>
                  <Text style={[styles.pillTxt, { color: WASTE_COLORS[l] ?? '#6b7280' }]}>{l}</Text>
                </View>
              ))
            : <Text style={styles.noPills}>Sin información de materiales</Text>
          }
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleDirections}>
            <MaterialCommunityIcons name="navigation" size={18} color="#fff" />
            <Text style={styles.btnPrimaryTxt}>Cómo llegar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => navigation.navigate('Report', { centerID: center.id, centerName: center.name })}
          >
            <MaterialCommunityIcons name="flag-plus-outline" size={18} color="#374151" />
            <Text style={styles.btnSecondaryTxt}>Reportar info</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, text }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons name={icon} size={18} color="#6b7280" />
      </View>
      <Text style={styles.infoTxt}>{text}</Text>
    </View>
  );
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor:'#f9fafb' },
  hero:         { height:220, backgroundColor:'#14532d', alignItems:'center', justifyContent:'center' },
  backBtn:      { position:'absolute', top:52, left:16, width:38, height:38, backgroundColor:'rgba(255,255,255,.2)', borderRadius:12, alignItems:'center', justifyContent:'center' },
  favoriteBtn:  { position:'absolute', top:52, right:16, width:38, height:38, backgroundColor:'rgba(255,255,255,.2)', borderRadius:12, alignItems:'center', justifyContent:'center' },
  body:         { padding:20, gap:12 },
  topRow:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  statusBadge:  { flexDirection:'row', alignItems:'center', gap:6, paddingVertical:5, paddingHorizontal:12, borderRadius:100 },
  statusDot:    { width:7, height:7, borderRadius:3.5 },
  statusTxt:    { fontSize:13, fontWeight:'700' },
  rating:       { fontSize:14, color:'#374151' },
  title:        { fontSize:22, fontWeight:'800', color:'#111', marginTop:4 },
  subtitle:     { fontSize:14, color:'#6b7280', lineHeight:20 },
  infoCard:     { backgroundColor:'#fff', borderRadius:18, padding:14, gap:0, shadowColor:'#000', shadowOpacity:.04, shadowRadius:8, shadowOffset:{width:0,height:2} },
  infoRow:      { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#f3f4f6' },
  infoIcon:     { width:36, height:36, backgroundColor:'#f3f4f6', borderRadius:10, alignItems:'center', justifyContent:'center' },
  infoTxt:      { flex:1, fontSize:14, color:'#374151' },
  sectionTitle: { fontSize:15, fontWeight:'700', color:'#111' },
  pillsRow:     { flexDirection:'row', flexWrap:'wrap', gap:8 },
  pill:         { paddingVertical:6, paddingHorizontal:12, borderRadius:100 },
  pillTxt:      { fontSize:13, fontWeight:'700' },
  noPills:      { fontSize:13, color:'#9ca3af' },
  actions:      { flexDirection:'row', gap:10, marginTop:8 },
  btnPrimary:   { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:GREEN, height:50, borderRadius:16, shadowColor:GREEN, shadowOpacity:.35, shadowRadius:10, shadowOffset:{width:0,height:4} },
  btnPrimaryTxt:{ color:'#fff', fontSize:15, fontWeight:'700' },
  btnSecondary: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:'#fff', height:50, borderRadius:16, borderWidth:1.5, borderColor:'#e5e7eb' },
  btnSecondaryTxt:{ color:'#374151', fontSize:15, fontWeight:'700' },
});
