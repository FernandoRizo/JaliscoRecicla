// screens/NotificationsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../config/firebaseConfig';
import {
  getUserNotifications,
  markNotificationRead,
} from '../services/firestoreService';

const TABS   = ['Todas', 'Reportes', 'Sistema'];

const NOTIF_STYLES = {
  report_update:  { icon: 'flag-check',           bg: '#dcfce7', color: '#16a34a' },
  schedule_alert: { icon: 'calendar-clock',        bg: '#dbeafe', color: '#3b82f6' },
  broadcast:      { icon: 'bullhorn-outline',       bg: '#fef3c7', color: '#d97706' },
  system:         { icon: 'information-outline',    bg: '#ede9fe', color: '#7c3aed' },
};

export default function NotificationsScreen({ navigation }) {
  const [tab,     setTab]     = useState('Todas');
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const uid  = auth.currentUser?.uid;
    const data = await getUserNotifications(uid, 40);
    setNotifs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = notifs.filter(n => {
    if (tab === 'Todas')    return true;
    if (tab === 'Reportes') return n.type === 'report_update';
    if (tab === 'Sistema')  return ['broadcast', 'system'].includes(n.type);
    return true;
  });

  const handlePress = async (notif) => {
    if (!notif.readAt) {
      await markNotificationRead(notif.id);
      setNotifs(prev =>
        prev.map(n => n.id === notif.id ? { ...n, readAt: new Date() } : n)
      );
    }
    if (notif.reportID) {
      // navigate to report detail if needed
    }
  };

  const renderItem = ({ item }) => {
    const s      = NOTIF_STYLES[item.type] ?? NOTIF_STYLES.system;
    const isRead = !!item.readAt;
    const when   = item.createdAt?.toDate
      ? timeAgo(item.createdAt.toDate())
      : 'Hace un momento';

    return (
      <TouchableOpacity
        style={[styles.card, !isRead && styles.cardUnread]}
        onPress={() => handlePress(item)}
        activeOpacity={0.75}
      >
        <View style={[styles.iconBox, { backgroundColor: s.bg }]}>
          <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, !isRead && styles.cardTitleUnread]}>
            {item.title}
          </Text>
          <Text style={styles.cardMsg} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.cardTime}>{when}</Text>
        </View>
        {!isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        <TouchableOpacity onPress={load}>
          <MaterialCommunityIcons name="refresh" size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? <ActivityIndicator color="#16a34a" style={{ marginTop: 40 }} />
        : (
          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>No hay notificaciones en esta categoría</Text>
            }
          />
        )
      }
    </SafeAreaView>
  );
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)   return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400)return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  safe:          { flex:1, backgroundColor:'#f9fafb' },
  header:        { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:14, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#f3f4f6' },
  backBtn:       { width:38, height:38, backgroundColor:'#f3f4f6', borderRadius:12, alignItems:'center', justifyContent:'center' },
  title:         { fontSize:18, fontWeight:'800', color:'#111' },
  tabs:          { flexDirection:'row', backgroundColor:'#fff', paddingHorizontal:20, paddingBottom:12, gap:8 },
  tab:           { flex:1, paddingVertical:8, borderRadius:100, alignItems:'center', backgroundColor:'#f3f4f6' },
  tabActive:     { backgroundColor:GREEN },
  tabTxt:        { fontSize:13, fontWeight:'600', color:'#6b7280' },
  tabTxtActive:  { color:'#fff' },
  list:          { padding:16, gap:10 },
  card:          { flexDirection:'row', backgroundColor:'#fff', borderRadius:16, padding:14, gap:12, shadowColor:'#000', shadowOpacity:.04, shadowRadius:6, shadowOffset:{width:0,height:2} },
  cardUnread:    { borderLeftWidth:3, borderLeftColor:GREEN },
  iconBox:       { width:44, height:44, borderRadius:14, alignItems:'center', justifyContent:'center', flexShrink:0 },
  cardBody:      { flex:1, gap:3 },
  cardTitle:     { fontSize:14, fontWeight:'600', color:'#374151' },
  cardTitleUnread:{ fontWeight:'800', color:'#111' },
  cardMsg:       { fontSize:13, color:'#6b7280', lineHeight:18 },
  cardTime:      { fontSize:11, color:'#9ca3af', marginTop:2 },
  unreadDot:     { width:9, height:9, borderRadius:4.5, backgroundColor:GREEN, marginTop:4, flexShrink:0 },
  empty:         { textAlign:'center', color:'#9ca3af', marginTop:40, fontSize:15 },
});
