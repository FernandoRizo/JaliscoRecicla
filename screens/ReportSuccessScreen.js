// screens/ReportSuccessScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ReportSuccessScreen({ route, navigation }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, tension: 60, friction: 6, useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>

      {/* Animated checkmark */}
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <MaterialCommunityIcons name="check-circle" size={80} color="#16a34a" />
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>¡Reporte enviado!</Text>
        <Text style={styles.subtitle}>
          Gracias por tu colaboración.{'\n'}
          Tu reporte será revisado por un administrador.
        </Text>

        {/* Location preview card */}
        <View style={styles.previewCard}>
          <MaterialCommunityIcons name="map-marker" size={22} color="#16a34a" />
          <View style={styles.previewInfo}>
            <Text style={styles.previewName}>EcoRecicla Zapopan</Text>
            <Text style={styles.previewAddr}>Av. Santa Margarita 456</Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingTxt}>En revisión</Text>
          </View>
        </View>

        {/* Timeline hint */}
        <View style={styles.timeline}>
          <TimelineStep
            icon="send-check-outline"
            label="Reporte enviado"
            done
          />
          <View style={styles.timelineLine} />
          <TimelineStep
            icon="account-search-outline"
            label="Revisión del administrador"
            active
          />
          <View style={styles.timelineLine} />
          <TimelineStep
            icon="map-marker-check-outline"
            label="Publicado en el mapa"
          />
        </View>
      </Animated.View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.btnTxt}>Entendido</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('Notifs')}
        >
          <Text style={styles.btnOutlineTxt}>Ver mis notificaciones</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

function TimelineStep({ icon, label, done, active }) {
  const color = done ? '#16a34a' : active ? '#0d9488' : '#d1d5db';
  return (
    <View style={styles.step}>
      <View style={[styles.stepDot, { backgroundColor: color + '22', borderColor: color }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.stepLabel, { color: done || active ? '#374151' : '#9ca3af' }]}>
        {label}
      </Text>
    </View>
  );
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', padding:28 },
  iconWrap:     { marginBottom:24 },
  content:      { alignItems:'center', width:'100%', gap:12 },
  title:        { fontSize:26, fontWeight:'800', color:'#111', textAlign:'center' },
  subtitle:     { fontSize:15, color:'#6b7280', textAlign:'center', lineHeight:22 },
  previewCard:  { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#f0fdf4', borderRadius:16, padding:14, width:'100%', borderWidth:1.5, borderColor:'#bbf7d0' },
  previewInfo:  { flex:1 },
  previewName:  { fontSize:14, fontWeight:'700', color:'#111' },
  previewAddr:  { fontSize:12, color:'#6b7280', marginTop:2 },
  pendingBadge: { backgroundColor:'#fef3c7', paddingVertical:4, paddingHorizontal:10, borderRadius:100 },
  pendingTxt:   { fontSize:11, fontWeight:'700', color:'#92400e' },
  timeline:     { width:'100%', gap:0, marginTop:8 },
  step:         { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:6 },
  stepDot:      { width:40, height:40, borderRadius:20, borderWidth:2, alignItems:'center', justifyContent:'center' },
  stepLabel:    { fontSize:14, fontWeight:'600' },
  timelineLine: { width:2, height:16, backgroundColor:'#e5e7eb', marginLeft:19 },
  footer:       { position:'absolute', bottom:40, left:28, right:28, gap:10 },
  btn:          { backgroundColor:GREEN, height:52, borderRadius:16, alignItems:'center', justifyContent:'center', shadowColor:GREEN, shadowOpacity:.35, shadowRadius:10, shadowOffset:{width:0,height:4} },
  btnTxt:       { color:'#fff', fontSize:16, fontWeight:'700' },
  btnOutline:   { height:48, borderRadius:16, alignItems:'center', justifyContent:'center', borderWidth:1.5, borderColor:'#e5e7eb' },
  btnOutlineTxt:{ color:'#374151', fontSize:15, fontWeight:'600' },
});
