// screens/UploadEvidenceScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, Image, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../config/firebaseConfig';
import { addReportPhotos } from '../services/firestoreService';

// npx expo install expo-image-picker

const MAX_PHOTOS = 5;

export default function UploadEvidenceScreen({ route, navigation }) {
  const { reportID } = route.params;
  const [photos,   setPhotos]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);

  /* ── pick image from library or camera ── */
  const pickImage = async () => {
    if (photos.length >= MAX_PHOTOS)
      return Alert.alert('Límite', `Máximo ${MAX_PHOTOS} fotos.`);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted')
      return Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
    });

    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  /* ── upload all photos to Firebase Storage ── */
  const uploadAllPhotos = async () => {
    const urls = [];
    for (let i = 0; i < photos.length; i++) {
      const uri      = photos[i];
      const filename = `reports/${reportID}/${Date.now()}_${i}.jpg`;
      const storageRef = ref(storage, filename);

      // Convert URI → Blob
      const resp  = await fetch(uri);
      const blob  = await resp.blob();

      await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, blob);
        task.on(
          'state_changed',
          snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            urls.push(url);
            resolve();
          }
        );
      });
    }
    return urls;
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      if (photos.length > 0) {
        const urls = await uploadAllPhotos();
        await addReportPhotos(reportID, urls);
      }
      navigation.replace('ReportSuccess', { reportID });
    } catch (e) {
      Alert.alert('Error', 'No se pudieron subir las fotos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setProgress(0);
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
          <Text style={styles.title}>Subir evidencia</Text>
          <Text style={styles.subtitle}>Agrega fotos (opcional)</Text>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons name="information-outline" size={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>

        {/* Counter */}
        <Text style={styles.counter}>
          {photos.length}/{MAX_PHOTOS} fotos · Máx. {MAX_PHOTOS} fotos
        </Text>

        {/* Upload zone */}
        <TouchableOpacity style={styles.uploadZone} onPress={pickImage}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={48} color="#9ca3af" />
          <Text style={styles.uploadTitle}>Subir fotos</Text>
          <Text style={styles.uploadSub}>o arrastra y suelta</Text>
        </TouchableOpacity>

        {/* Progress bar (while uploading) */}
        {loading && (
          <View style={styles.progressWrap}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressTxt}>{progress}%</Text>
          </View>
        )}

        {/* Photo previews */}
        {photos.length > 0 && (
          <View style={styles.grid}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removePhoto(i)}
                >
                  <MaterialCommunityIcons name="close-circle" size={22} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ))}
            {/* Add more button */}
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity style={styles.addMore} onPress={pickImage}>
                <MaterialCommunityIcons name="plus" size={28} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.hint}>
          Las fotos ayudan a que los administradores verifiquen el centro más rápido.
        </Text>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleContinue} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnTxt}>Continuar</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  safe:         { flex:1, backgroundColor:'#fff' },
  header:       { flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:14 },
  backBtn:      { width:38, height:38, backgroundColor:'#f3f4f6', borderRadius:12, alignItems:'center', justifyContent:'center', marginTop:2 },
  title:        { fontSize:18, fontWeight:'800', color:'#111' },
  subtitle:     { fontSize:13, color:'#6b7280', marginTop:2 },
  body:         { padding:20, gap:16, paddingBottom:32 },
  counter:      { fontSize:13, color:'#6b7280', fontWeight:'600', textAlign:'center' },
  uploadZone:   { borderWidth:2, borderColor:'#d1d5db', borderStyle:'dashed', borderRadius:20, paddingVertical:40, alignItems:'center', gap:8, backgroundColor:'#f9fafb' },
  uploadTitle:  { fontSize:16, fontWeight:'700', color:'#374151' },
  uploadSub:    { fontSize:13, color:'#9ca3af' },
  progressWrap: { gap:6 },
  progressBg:   { height:8, backgroundColor:'#e5e7eb', borderRadius:4, overflow:'hidden' },
  progressFill: { height:'100%', backgroundColor:GREEN, borderRadius:4 },
  progressTxt:  { fontSize:12, color:'#6b7280', textAlign:'center' },
  grid:         { flexDirection:'row', flexWrap:'wrap', gap:10 },
  thumbWrap:    { width:100, height:100, borderRadius:14, overflow:'visible' },
  thumb:        { width:100, height:100, borderRadius:14 },
  removeBtn:    { position:'absolute', top:-8, right:-8, backgroundColor:'#fff', borderRadius:11 },
  addMore:      { width:100, height:100, borderRadius:14, borderWidth:2, borderColor:'#e5e7eb', borderStyle:'dashed', alignItems:'center', justifyContent:'center' },
  hint:         { fontSize:13, color:'#9ca3af', textAlign:'center', lineHeight:20 },
  footer:       { padding:20, paddingBottom:32 },
  btn:          { backgroundColor:GREEN, height:52, borderRadius:16, alignItems:'center', justifyContent:'center', shadowColor:GREEN, shadowOpacity:.35, shadowRadius:10, shadowOffset:{width:0,height:4} },
  btnTxt:       { color:'#fff', fontSize:16, fontWeight:'700' },
});
