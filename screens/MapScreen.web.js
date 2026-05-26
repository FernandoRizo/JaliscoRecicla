// screens/MapScreen.web.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getActiveCenters } from '../services/firestoreService';

export default function MapScreen({ navigation }) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCenters = async () => {
      try {
        const data = await getActiveCenters();
        setCenters(data);
      } catch (error) {
        console.warn('Error loading centers on web:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, []);

  const openInGoogleMaps = (center) => {
    const query = encodeURIComponent(
      `${center.name ?? ''} ${center.address ?? ''}`
    );

    const url = center.latitude && center.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;

    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loaderText}>Cargando centros...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#374151" />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Centros de reciclaje</Text>
          <Text style={styles.subtitle}>Vista compatible con web</Text>
        </View>
      </View>

      <FlatList
        data={centers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="recycle" size={26} color="#16a34a" />
              <View style={{ flex: 1 }}>
                <Text style={styles.centerName}>{item.name}</Text>
                <Text style={styles.address}>{item.address}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.status}>
                {item.status === 'active' ? 'Activo' : 'No activo'}
              </Text>

              {item.rating ? (
                <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.mapBtn}
              onPress={() => openInGoogleMaps(item)}
            >
              <MaterialCommunityIcons name="map-marker" size={18} color="#fff" />
              <Text style={styles.mapBtnText}>Abrir en Google Maps</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay centros disponibles.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
  },
  loaderText: {
    color: '#6b7280',
    fontSize: 15,
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  list: {
    padding: 24,
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  centerName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  address: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    color: '#16a34a',
    fontWeight: '700',
  },
  rating: {
    color: '#374151',
    fontWeight: '600',
  },
  mapBtn: {
    marginTop: 4,
    backgroundColor: '#16a34a',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapBtnText: {
    color: '#fff',
    fontWeight: '800',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
  },
});