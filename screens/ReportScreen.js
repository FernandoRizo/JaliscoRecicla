// screens/ReportScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { auth } from '../config/firebaseConfig';
import { createReport, getWasteTypes } from '../services/firestoreService';

export default function ReportScreen({ route, navigation }) {
  const prefillName = route?.params?.centerName ?? '';
  const prefillID   = route?.params?.centerID   ?? null;

  const [name,       setName]       = useState(prefillName);
  const [address,    setAddress]    = useState('');
  const [description,setDescription]= useState('');
  const [wasteTypes, setWasteTypes] = useState([]);
  const [selected,   setSelected]   = useState([]);
  const [locLabel,   setLocLabel]   = useState('Obtener ubicación actual');
  const [location,   setLocation]   = useState(null);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    getWasteTypes().then(setWasteTypes);
  }, []);

  const pickLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    const [geo] = await Location.reverseGeocodeAsync(loc.coords);
    const label = `${geo.street ?? ''} ${geo.streetNumber ?? ''}, ${geo.city ?? ''}`.trim();
    setLocLabel(label || 'Ubicación obtenida ✓');
    setAddress(label);
  };

  const toggleWaste = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (!name || !address)
      return Alert.alert('Campos requeridos', 'Ingresa el nombre y la dirección del centro.');
    setLoading(true);
    try {
      const uid      = auth.currentUser?.uid;
      const reportID = await createReport({
        userID:      uid,
        centerID:    prefillID,
        name,
        address,
        description,
        wasteTypes:  selected,
        photoURLs:   [],
      });
      navigation.navigate('UploadEvidence', { reportID });
    } catch (e) {
      Alert.alert('Error', 'No se pudo crear el reporte. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Reportar centro</Text>
          <Text style={styles.subtitle}>Ayúdanos a mejorar el mapa</Text>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons name="information-outline" size={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* Name */}
        <Text style={styles.label}>Nombre del centro</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. EcoRecicla Zapopan"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
        />

        {/* Address */}
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Calle, número, colonia..."
          placeholderTextColor="#9ca3af"
          value={address}
          onChangeText={setAddress}
        />

        {/* Location picker */}
        <TouchableOpacity style={styles.locationBtn} onPress={pickLocation}>
          <MaterialCommunityIcons
            name={location ? 'map-marker-check' : 'map-marker-plus-outline'}
            size={20}
            color={location ? GREEN : '#0d9488'}
          />
          <Text style={[styles.locationTxt, location && { color: GREEN }]}>{locLabel}</Text>
        </TouchableOpacity>

        {/* Description */}
        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Horario aproximado, acceso, notas..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Waste type chips */}
        <Text style={styles.label}>Tipo de materiales que acepta</Text>
        <View style={styles.chipsGrid}>
          {wasteTypes.map(w => (
            <TouchableOpacity
              key={w.id}
              style={[styles.chip, selected.includes(w.id) && styles.chipActive]}
              onPress={() => toggleWaste(w.id)}
            >
              <Text style={[styles.chipTxt, selected.includes(w.id) && styles.chipTxtActive]}>
                {w.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleNext} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnTxt}>Siguiente</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  safe:        { flex:1, backgroundColor:'#fff' },
  header:      { flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:14, gap:12 },
  backBtn:     { width:38, height:38, backgroundColor:'#f3f4f6', borderRadius:12, alignItems:'center', justifyContent:'center', marginTop:2 },
  title:       { fontSize:18, fontWeight:'800', color:'#111' },
  subtitle:    { fontSize:13, color:'#6b7280', marginTop:2 },
  body:        { padding:20, gap:10, paddingBottom:32 },
  label:       { fontSize:13, fontWeight:'700', color:'#374151', marginBottom:2, marginTop:6 },
  input:       { backgroundColor:'#f9fafb', borderRadius:14, borderWidth:1.5, borderColor:'#e5e7eb', padding:14, fontSize:15, color:'#111' },
  textarea:    { height:80, textAlignVertical:'top' },
  locationBtn: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#f0fdfa', borderRadius:14, borderWidth:1.5, borderColor:'#0d9488', padding:14 },
  locationTxt: { flex:1, fontSize:14, fontWeight:'600', color:'#0d9488' },
  chipsGrid:   { flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:4 },
  chip:        { paddingVertical:8, paddingHorizontal:14, borderRadius:100, backgroundColor:'#f9fafb', borderWidth:1.5, borderColor:'#e5e7eb' },
  chipActive:  { backgroundColor:GREEN, borderColor:GREEN },
  chipTxt:     { fontSize:13, fontWeight:'600', color:'#6b7280' },
  chipTxtActive:{ color:'#fff' },
  footer:      { padding:20, paddingBottom:32 },
  btn:         { backgroundColor:GREEN, height:52, borderRadius:16, alignItems:'center', justifyContent:'center', shadowColor:GREEN, shadowOpacity:.35, shadowRadius:10, shadowOffset:{width:0,height:4} },
  btnTxt:      { color:'#fff', fontSize:16, fontWeight:'700' },
});
