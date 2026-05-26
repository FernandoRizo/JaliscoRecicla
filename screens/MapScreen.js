// screens/MapScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getActiveCenters } from '../services/firestoreService';

// NOTE: install with:  npx expo install react-native-maps expo-location
// Add in app.json → "plugins": ["expo-location"]

const FILTERS = ['Todos', 'Plástico', 'Vidrio', 'Papel', 'Orgánico'];

export default function MapScreen({ navigation }) {
  const mapRef   = useRef(null);
  const [location,   setLocation]   = useState(null);
  const [centers,    setCenters]    = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [filter,     setFilter]     = useState('Todos');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      }
      const data = await getActiveCenters();
      setCenters(data);
      setLoading(false);
    })();
  }, []);

  const filteredCenters = filter === 'Todos'
    ? centers
    : centers.filter(c =>
        (c.wasteTypes ?? []).some(w => w.toLowerCase().includes(filter.toLowerCase()))
      );

  const focusCenter = (center) => {
    setSelected(center);
    mapRef.current?.animateToRegion({
      latitude:      center.latitude,
      longitude:     center.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 600);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loaderTxt}>Cargando centros...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back btn */}
      <SafeAreaView style={styles.topOverlay}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Centros cercanos</Text>
        <TouchableOpacity style={styles.backBtn}>
          <MaterialCommunityIcons name="tune" size={20} color="#374151" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Filter chips */}
      <View style={styles.filtersWrap}>
        <FlatList
          data={FILTERS}
          horizontal
          keyExtractor={f => f}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, filter === item && styles.chipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.chipTxt, filter === item && styles.chipTxtActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude:       location?.latitude  ?? 20.676,
          longitude:      location?.longitude ?? -103.347,
          latitudeDelta:  0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filteredCenters.map(center => (
          <Marker
            key={center.id}
            coordinate={{ latitude: center.latitude, longitude: center.longitude }}
            onPress={() => focusCenter(center)}
            pinColor={center.id === selected?.id ? '#dc2626' : '#16a34a'}
            title={center.name}
          />
        ))}
      </MapView>

      {/* Bottom list */}
      <View style={styles.bottomSheet}>
        <FlatList
          data={filteredCenters}
          horizontal
          keyExtractor={c => c.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.centerCard, selected?.id === item.id && styles.centerCardActive]}
              onPress={() => {
                focusCenter(item);
                navigation.navigate('CenterDetail', { center: item });
              }}
            >
              <Text style={styles.centerName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.centerAddr} numberOfLines={1}>
                <MaterialCommunityIcons name="map-marker" size={12} color="#9ca3af" /> {item.address}
              </Text>
              <View style={styles.centerMeta}>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#dcfce7' : '#fee2e2' }]}>
                  <Text style={[styles.statusTxt, { color: item.status === 'active' ? '#16a34a' : '#dc2626' }]}>
                    {item.status === 'active' ? 'Abierto' : 'Cerrado'}
                  </Text>
                </View>
                <Text style={styles.rating}>⭐ {item.rating?.toFixed(1)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1 },
  loader:         { flex:1, alignItems:'center', justifyContent:'center', gap:12 },
  loaderTxt:      { color:'#6b7280', fontSize:15 },
  map:            { flex:1 },
  topOverlay:     { position:'absolute', top:0, left:0, right:0, zIndex:10, flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:48, paddingBottom:10, backgroundColor:'rgba(255,255,255,.95)' },
  backBtn:        { width:38, height:38, backgroundColor:'#f3f4f6', borderRadius:12, alignItems:'center', justifyContent:'center' },
  topTitle:       { fontSize:16, fontWeight:'700', color:'#111' },
  filtersWrap:    { position:'absolute', top:110, left:0, right:0, zIndex:10 },
  filtersRow:     { paddingHorizontal:16, gap:8 },
  chip:           { paddingVertical:7, paddingHorizontal:14, borderRadius:100, backgroundColor:'rgba(255,255,255,.95)', borderWidth:1.5, borderColor:'#e5e7eb' },
  chipActive:     { backgroundColor:'#16a34a', borderColor:'#16a34a' },
  chipTxt:        { fontSize:13, fontWeight:'600', color:'#374151' },
  chipTxtActive:  { color:'#fff' },
  bottomSheet:    { position:'absolute', bottom:0, left:0, right:0, paddingBottom:32 },
  cardsList:      { paddingHorizontal:16, gap:10 },
  centerCard:     { width:220, backgroundColor:'rgba(255,255,255,.97)', borderRadius:16, padding:14, borderWidth:1.5, borderColor:'#e5e7eb', gap:6 },
  centerCardActive:{ borderColor:'#16a34a' },
  centerName:     { fontSize:14, fontWeight:'700', color:'#111' },
  centerAddr:     { fontSize:12, color:'#9ca3af' },
  centerMeta:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  statusBadge:    { paddingVertical:3, paddingHorizontal:8, borderRadius:100 },
  statusTxt:      { fontSize:11, fontWeight:'700' },
  rating:         { fontSize:13, color:'#374151' },
});
