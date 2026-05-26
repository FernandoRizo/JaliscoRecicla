// screens/AdminDashboardScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  SafeAreaView, ActivityIndicator, Alert, RefreshControl,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getPendingReports,
  reviewReport,
  getActiveCenters,
} from '../services/firestoreService';
import { auth } from '../config/firebaseConfig';
import { logout } from '../services/authService';

const TABS = ['Dashboard', 'Reportes', 'Centros', 'Perfil'];

const TAB_ICONS = {
  Dashboard: 'view-dashboard-outline',
  Reportes:  'flag-outline',
  Centros:   'map-marker-outline',
  Perfil:    'account-outline',
};

export default function AdminDashboardScreen({ navigation }) {
  const [tab,        setTab]        = useState('Dashboard');
  const [reports,    setReports]    = useState([]);
  const [centers,    setCenters]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [reps, cts] = await Promise.all([
        getPendingReports(),
        getActiveCenters(),
      ]);
      setReports(reps);
      setCenters(cts);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleReview = (reportID, decision) => {
    const label = decision === 'approved' ? 'Aprobar' : 'Rechazar';
    Alert.alert(
      `${label} reporte`,
      `¿Deseas ${label.toLowerCase()} este reporte?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: label, style: decision === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await reviewReport(reportID, decision, auth.currentUser.uid);
              setReports(prev => prev.filter(r => r.id !== reportID));
              Alert.alert('✓', `Reporte ${decision === 'approved' ? 'aprobado' : 'rechazado'} correctamente.`);
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el reporte.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas salir del panel de administración?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => {
        await logout();
        navigation.replace('Login');
      }},
    ]);
  };

  // ── KPI STATS ───────────────────────────────────────────────────────────────
  const stats = [
    { icon:'flag-outline',       label:'Reportes\npendientes', value: reports.length,  bg:'#fef3c7', color:'#d97706' },
    { icon:'map-marker-outline', label:'Centros\nactivos',     value: centers.length,  bg:'#dcfce7', color:'#16a34a' },
    { icon:'account-outline',    label:'Usuarios\nregistrados',value: 2431,            bg:'#dbeafe', color:'#3b82f6' },
    { icon:'chart-line',         label:'Uptime\ndel sistema',  value:'98.2%',          bg:'#ede9fe', color:'#7c3aed' },
  ];

  // ── RENDER REPORT ITEM ───────────────────────────────────────────────────────
  const renderReport = ({ item }) => {
    const statusMap = {
      submitted:      { label:'Pendiente',  bg:'#fef3c7', color:'#92400e' },
      pending_review: { label:'En revisión',bg:'#dbeafe', color:'#1e40af' },
      approved:       { label:'Aprobado',   bg:'#dcfce7', color:'#166534' },
      rejected:       { label:'Rechazado',  bg:'#fee2e2', color:'#991b1b' },
    };
    const s    = statusMap[item.status] ?? statusMap.submitted;
    const when = item.createdAt?.toDate
      ? timeAgo(item.createdAt.toDate())
      : 'Hace un momento';

    return (
      <View style={styles.reportCard}>
        {/* Top row */}
        <View style={styles.reportTop}>
          <Text style={styles.reportName} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusTxt, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.reportMeta}>
          <MetaChip icon="map-marker-outline" text={item.address} />
          <MetaChip icon="clock-outline"      text={when} />
        </View>

        {/* Waste types */}
        {(item.wasteTypes ?? []).length > 0 && (
          <View style={styles.wastePills}>
            {item.wasteTypes.slice(0, 3).map(w => (
              <View key={w} style={styles.wastePill}>
                <Text style={styles.wastePillTxt}>{w}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action buttons — only for pending/submitted */}
        {['submitted', 'pending_review'].includes(item.status) && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleReview(item.id, 'approved')}
            >
              <MaterialCommunityIcons name="check" size={16} color="#166534" />
              <Text style={[styles.actionBtnTxt, { color:'#166534' }]}>Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleReview(item.id, 'rejected')}
            >
              <MaterialCommunityIcons name="close" size={16} color="#991b1b" />
              <Text style={[styles.actionBtnTxt, { color:'#991b1b' }]}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.viewBtn]}>
              <Text style={[styles.actionBtnTxt, { color:'#374151' }]}>Ver detalle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ── RENDER CENTER ITEM ───────────────────────────────────────────────────────
  const renderCenter = ({ item }) => (
    <View style={styles.centerCard}>
      <View style={[styles.centerDot, { backgroundColor: item.status === 'active' ? '#16a34a' : '#9ca3af' }]} />
      <View style={styles.centerInfo}>
        <Text style={styles.centerName}>{item.name}</Text>
        <Text style={styles.centerAddr} numberOfLines={1}>{item.address}</Text>
      </View>
      <Text style={styles.centerRating}>⭐ {item.rating?.toFixed(1)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loaderTxt}>Cargando panel...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel Admin</Text>
          <Text style={styles.headerSub}>JaliscoRecicla</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {tab === 'Dashboard' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1f2937" />}
        >
          {/* KPI Grid */}
          <View style={styles.statsGrid}>
            {stats.map(s => (
              <View key={s.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                  <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Recent reports */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos reportes</Text>
            <TouchableOpacity onPress={() => setTab('Reportes')}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {reports.slice(0, 3).map(r => (
            <View key={r.id} style={{ paddingHorizontal: 16 }}>
              {renderReport({ item: r })}
            </View>
          ))}
          {reports.length === 0 && (
            <Text style={styles.empty}>No hay reportes pendientes 🎉</Text>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {tab === 'Reportes' && (
        <FlatList
          data={reports}
          keyExtractor={i => i.id}
          renderItem={renderReport}
          contentContainerStyle={styles.listPad}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No hay reportes pendientes 🎉</Text>}
        />
      )}

      {tab === 'Centros' && (
        <FlatList
          data={centers}
          keyExtractor={i => i.id}
          renderItem={renderCenter}
          contentContainerStyle={styles.listPad}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No hay centros registrados</Text>}
        />
      )}

      {tab === 'Perfil' && (
        <View style={styles.profileTab}>
          <MaterialCommunityIcons name="account-circle-outline" size={72} color="#9ca3af" />
          <Text style={styles.profileName}>{auth.currentUser?.email}</Text>
          <Text style={styles.profileRole}>Administrador</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={18} color="#dc2626" />
            <Text style={styles.logoutTxt}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={styles.navItem}
            onPress={() => setTab(t)}
          >
            <MaterialCommunityIcons
              name={TAB_ICONS[t]}
              size={24}
              color={tab === t ? '#1f2937' : '#9ca3af'}
            />
            <Text style={[styles.navLabel, tab === t && styles.navLabelActive]}>
              {t}
            </Text>
            {tab === t && <View style={styles.navDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

function MetaChip({ icon, text }) {
  return (
    <View style={styles.metaChip}>
      <MaterialCommunityIcons name={icon} size={12} color="#9ca3af" />
      <Text style={styles.metaTxt} numberOfLines={1}>{text}</Text>
    </View>
  );
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return 'Hace un momento';
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

const DARK = '#1f2937';
const styles = StyleSheet.create({
  safe:          { flex:1, backgroundColor:'#f9fafb' },
  loader:        { flex:1, alignItems:'center', justifyContent:'center', gap:12 },
  loaderTxt:     { color:'#6b7280', fontSize:15 },

  // Header
  header:        { backgroundColor:DARK, paddingHorizontal:20, paddingTop:16, paddingBottom:18, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  headerTitle:   { fontSize:20, fontWeight:'800', color:'#fff' },
  headerSub:     { fontSize:12, color:'#9ca3af', marginTop:2 },
  headerRight:   { flexDirection:'row', gap:8 },
  headerBtn:     { width:38, height:38, backgroundColor:'rgba(255,255,255,.1)', borderRadius:12, alignItems:'center', justifyContent:'center' },

  // Stats
  statsGrid:     { flexDirection:'row', flexWrap:'wrap', padding:16, gap:10 },
  statCard:      { width:'47%', backgroundColor:'#fff', borderRadius:18, padding:14, gap:6, shadowColor:'#000', shadowOpacity:.04, shadowRadius:8, shadowOffset:{width:0,height:2} },
  statIcon:      { width:42, height:42, borderRadius:14, alignItems:'center', justifyContent:'center', marginBottom:2 },
  statValue:     { fontSize:26, fontWeight:'800', color:DARK },
  statLabel:     { fontSize:11, color:'#9ca3af', fontWeight:'600', textTransform:'uppercase', letterSpacing:.5, lineHeight:16 },

  // Section
  sectionHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:16, paddingBottom:10 },
  sectionTitle:  { fontSize:16, fontWeight:'800', color:DARK },
  sectionLink:   { fontSize:13, color:'#16a34a', fontWeight:'700' },
  empty:         { textAlign:'center', color:'#9ca3af', marginTop:40, fontSize:15, paddingHorizontal:20 },
  listPad:       { padding:16, gap:10 },

  // Report card
  reportCard:    { backgroundColor:'#fff', borderRadius:18, padding:14, gap:8, shadowColor:'#000', shadowOpacity:.04, shadowRadius:8, shadowOffset:{width:0,height:2}, marginBottom:4 },
  reportTop:     { flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', gap:8 },
  reportName:    { flex:1, fontSize:15, fontWeight:'700', color:DARK },
  statusBadge:   { paddingVertical:4, paddingHorizontal:10, borderRadius:100, flexShrink:0 },
  statusTxt:     { fontSize:11, fontWeight:'700' },
  reportMeta:    { flexDirection:'row', gap:12, flexWrap:'wrap' },
  metaChip:      { flexDirection:'row', alignItems:'center', gap:4 },
  metaTxt:       { fontSize:12, color:'#9ca3af' },
  wastePills:    { flexDirection:'row', gap:6, flexWrap:'wrap' },
  wastePill:     { backgroundColor:'#f3f4f6', paddingVertical:4, paddingHorizontal:10, borderRadius:100 },
  wastePillTxt:  { fontSize:11, fontWeight:'600', color:'#6b7280' },
  actions:       { flexDirection:'row', gap:8, marginTop:4 },
  actionBtn:     { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5, paddingVertical:9, borderRadius:10 },
  actionBtnTxt:  { fontSize:13, fontWeight:'700' },
  approveBtn:    { backgroundColor:'#dcfce7' },
  rejectBtn:     { backgroundColor:'#fee2e2' },
  viewBtn:       { backgroundColor:'#f3f4f6' },

  // Center card
  centerCard:    { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:16, padding:14, gap:12, shadowColor:'#000', shadowOpacity:.04, shadowRadius:6, shadowOffset:{width:0,height:2} },
  centerDot:     { width:10, height:10, borderRadius:5, flexShrink:0 },
  centerInfo:    { flex:1 },
  centerName:    { fontSize:14, fontWeight:'700', color:DARK },
  centerAddr:    { fontSize:12, color:'#9ca3af', marginTop:2 },
  centerRating:  { fontSize:13, color:'#374151' },

  // Profile tab
  profileTab:    { flex:1, alignItems:'center', justifyContent:'center', gap:8 },
  profileName:   { fontSize:16, fontWeight:'700', color:DARK },
  profileRole:   { fontSize:13, color:'#9ca3af' },
  logoutBtn:     { flexDirection:'row', alignItems:'center', gap:8, marginTop:16, backgroundColor:'#fee2e2', paddingVertical:12, paddingHorizontal:24, borderRadius:14 },
  logoutTxt:     { fontSize:15, fontWeight:'700', color:'#dc2626' },

  // Bottom nav
  bottomNav:     { flexDirection:'row', backgroundColor:'#fff', borderTopWidth:1, borderTopColor:'#f3f4f6', paddingBottom:20, paddingTop:10 },
  navItem:       { flex:1, alignItems:'center', gap:2 },
  navLabel:      { fontSize:10, fontWeight:'600', color:'#9ca3af' },
  navLabelActive:{ color:DARK },
  navDot:        { width:4, height:4, borderRadius:2, backgroundColor:DARK, marginTop:1 },
});
