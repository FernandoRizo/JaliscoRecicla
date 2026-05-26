// screens/AdminLoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginWithEmail } from '../services/authService';
import { getUser } from '../services/firestoreService';

export default function AdminLoginScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert('Campos requeridos', 'Ingresa tus credenciales de administrador.');
    try {
      setLoading(true);
      const fireUser = await loginWithEmail(email, password);
      const userData = await getUser(fireUser.uid);

      if (userData?.role !== 'administrator') {
        Alert.alert(
          'Acceso denegado',
          'Esta cuenta no tiene permisos de administrador.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
        return;
      }
      navigation.replace('AdminDashboard');
    } catch (e) {
      Alert.alert('Error', 'Credenciales incorrectas o cuenta no encontrada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="shield-account-outline" size={56} color={DARK} />
        </View>

        <Text style={styles.title}>Administrador</Text>
        <Text style={styles.subtitle}>Panel de administración</Text>

        {/* Fields */}
        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#9ca3af" />
            <TextInput
              style={styles.fieldInput}
              placeholder="Correo electrónico"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldWrap}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#9ca3af" />
            <TextInput
              style={styles.fieldInput}
              placeholder="Contraseña"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
            />
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
              <MaterialCommunityIcons
                name={showPwd ? 'eye-off' : 'eye'}
                size={20} color="#9ca3af"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnTxt}>Entrar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert('Recuperar contraseña', 'Contacta al superadministrador del sistema.')}>
            <Text style={styles.forgot}>Recuperar contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* Back to citizen login */}
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Login')}>
          <MaterialCommunityIcons name="arrow-left" size={16} color="#9ca3af" />
          <Text style={styles.backTxt}>Volver al acceso ciudadano</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const DARK = '#1f2937';
const styles = StyleSheet.create({
  safe:         { flex:1, backgroundColor:'#fff' },
  container:    { flex:1, padding:32, alignItems:'center', justifyContent:'center' },
  iconWrap:     { width:96, height:96, backgroundColor:'#f3f4f6', borderRadius:28, alignItems:'center', justifyContent:'center', marginBottom:20 },
  title:        { fontSize:28, fontWeight:'800', color:DARK, marginBottom:4 },
  subtitle:     { fontSize:15, color:'#6b7280', marginBottom:32 },
  form:         { width:'100%', gap:14 },
  fieldWrap:    { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#f9fafb', borderRadius:14, borderWidth:1.5, borderColor:'#e5e7eb', paddingHorizontal:14, height:52 },
  fieldInput:   { flex:1, fontSize:15, color:'#111' },
  btn:          { backgroundColor:DARK, height:52, borderRadius:16, alignItems:'center', justifyContent:'center', shadowColor:DARK, shadowOpacity:.25, shadowRadius:10, shadowOffset:{width:0,height:4} },
  btnTxt:       { color:'#fff', fontSize:16, fontWeight:'700' },
  forgot:       { textAlign:'center', color:'#6b7280', fontSize:14, textDecorationLine:'underline' },
  backLink:     { flexDirection:'row', alignItems:'center', gap:6, marginTop:32 },
  backTxt:      { color:'#9ca3af', fontSize:14 },
});
