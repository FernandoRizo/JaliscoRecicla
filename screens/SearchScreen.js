// screens/SearchScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getWasteTypes } from '../services/firestoreService';

const FILTERS = ['Todo', 'Plástico', 'Papel', 'Vidrio', 'Orgánico'];

const ICONS = {
  plastico:   { name:'bottle-soda-outline', color:'#f59e0b', bg:'#fef3c7' },
  papel:      { name:'file-document-outline', color:'#3b82f6', bg:'#dbeafe' },
  vidrio:     { name:'glass-fragile', color:'#8b5cf6', bg:'#ede9fe' },
  organico:   { name:'leaf', color:'#16a34a', bg:'#dcfce7' },
  electronico:{ name:'laptop', color:'#ef4444', bg:'#fee2e2' },
  metal:      { name:'layers-outline', color:'#6b7280', bg:'#f3f4f6' },
};

export default function SearchScreen({ navigation, route }) {
  const [query,       setQuery]       = useState('');
  const [activeFilter, setActiveFilter] = useState('Todo');
  const [wasteTypes,  setWasteTypes]  = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    getWasteTypes()
      .then(setWasteTypes)
      .finally(() => setLoading(false));
  }, []);

  const filtered = wasteTypes.filter((w) => {
    const matchQuery  = w.name.toLowerCase().includes(query.toLowerCase()) ||
                        (w.examples || []).some(e => e.toLowerCase().includes(query.toLowerCase()));
    const matchFilter = activeFilter === 'Todo' || w.category === activeFilter.toLowerCase();
    return matchQuery && matchFilter;
  });

  const renderItem = ({ item }) => {
    const ic = ICONS[item.category] ?? ICONS.metal;
    return (
      <TouchableOpacity style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: ic.bg }]}>
          <MaterialCommunityIcons name={ic.name} size={28} color={ic.color} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.cardName}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: ic.bg }]}>
              <Text style={[styles.badgeTxt, { color: ic.color }]}>{item.category}</Text>
            </View>
          </View>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Buscar residuo</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Botella, cartón, electrónico..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <FlatList
        data={FILTERS}
        horizontal
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filter, activeFilter === item && styles.filterActive]}
            onPress={() => setActiveFilter(item)}
          >
            <Text style={[styles.filterTxt, activeFilter === item && styles.filterTxtActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results */}
      {loading
        ? <ActivityIndicator color="#16a34a" style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id ?? i.name}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>No se encontraron resultados para "{query}"</Text>
            }
          />
        )
      }
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  safe:         { flex:1, backgroundColor:'#fff' },
  header:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:14 },
  title:        { fontSize:18, fontWeight:'800', color:'#111' },
  searchWrap:   { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#f3f4f6', borderRadius:14, marginHorizontal:20, paddingHorizontal:14, height:48, marginBottom:12 },
  searchInput:  { flex:1, fontSize:15, color:'#111' },
  filters:      { paddingHorizontal:20, gap:8, paddingBottom:8 },
  filter:       { paddingVertical:7, paddingHorizontal:16, borderRadius:100, backgroundColor:'#f9fafb', borderWidth:1.5, borderColor:'#e5e7eb' },
  filterActive: { backgroundColor:GREEN, borderColor:GREEN },
  filterTxt:    { fontSize:13, fontWeight:'600', color:'#6b7280' },
  filterTxtActive:{ color:'#fff' },
  list:         { paddingHorizontal:20, paddingTop:8, gap:10 },
  card:         { flexDirection:'row', backgroundColor:'#fff', borderRadius:16, padding:14, borderWidth:1.5, borderColor:'#f3f4f6', gap:14, shadowColor:'#000', shadowOpacity:.04, shadowRadius:6, shadowOffset:{width:0,height:2} },
  iconBox:      { width:56, height:56, borderRadius:16, alignItems:'center', justifyContent:'center', flexShrink:0 },
  cardBody:     { flex:1, gap:4 },
  cardTop:      { flexDirection:'row', alignItems:'center', gap:8, flexWrap:'wrap' },
  cardName:     { fontSize:15, fontWeight:'700', color:'#111' },
  badge:        { paddingVertical:2, paddingHorizontal:8, borderRadius:100 },
  badgeTxt:     { fontSize:11, fontWeight:'700', textTransform:'capitalize' },
  cardDesc:     { fontSize:13, color:'#6b7280', lineHeight:18 },
  empty:        { textAlign:'center', color:'#9ca3af', marginTop:40, fontSize:15 },
});
