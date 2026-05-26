// screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { registerWithEmail } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirm)
      return Alert.alert('Campos requeridos', 'Completa todos los campos.');
    if (password !== confirm)
      return Alert.alert('Error', 'Las contraseñas no coinciden.');
    if (!accepted)
      return Alert.alert('Términos', 'Acepta los términos y condiciones.');
    if (password.length < 6)
      return Alert.alert('Contraseña', 'La contraseña debe tener al menos 6 caracteres.');
    try {
      setLoading(true);
      await registerWithEmail(email, password, fullName);
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Back */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#374151" />
      </TouchableOpacity>

      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Únete a JaliscoRecicla</Text>

      <View style={styles.form}>
        <Field icon="account-outline"  placeholder="Nombre completo"     value={fullName} onChangeText={setFullName} />
        <Field icon="email-outline"    placeholder="Correo electrónico"  value={email}    onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field icon="lock-outline"     placeholder="Contraseña"          value={password} onChangeText={setPassword} secureTextEntry />
        <Field icon="lock-check-outline" placeholder="Confirmar contraseña" value={confirm} onChangeText={setConfirm} secureTextEntry />

        {/* Terms checkbox */}
        <TouchableOpacity style={styles.terms} onPress={() => setAccepted(!accepted)}>
          <MaterialCommunityIcons
            name={accepted ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={22} color={accepted ? GREEN : '#9ca3af'}
          />
          <Text style={styles.termsTxt}>
            Acepto los <Text style={styles.termsLink}>Términos y Condiciones</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnPrimaryTxt}>Registrarme</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginTxt}>
            ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Field({ icon, ...props }) {
  return (
    <View style={styles.fieldWrap}>
      <MaterialCommunityIcons name={icon} size={20} color="#9ca3af" style={{ marginRight:10 }} />
      <TextInput style={styles.fieldInput} placeholderTextColor="#9ca3af" {...props} />
    </View>
  );
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  container:    { flexGrow:1, backgroundColor:'#fff', padding:28 },
  back:         { marginTop:16, marginBottom:24, width:36 },
  title:        { fontSize:28, fontWeight:'800', color:'#111', marginBottom:4 },
  subtitle:     { fontSize:15, color:'#6b7280', marginBottom:28 },
  form:         { gap:14 },
  fieldWrap:    { flexDirection:'row', alignItems:'center', backgroundColor:'#f9fafb', borderRadius:14, borderWidth:1.5, borderColor:'#e5e7eb', paddingHorizontal:14, height:52 },
  fieldInput:   { flex:1, fontSize:15, color:'#111' },
  terms:        { flexDirection:'row', alignItems:'center', gap:10 },
  termsTxt:     { flex:1, color:'#374151', fontSize:14, lineHeight:20 },
  termsLink:    { color:GREEN, fontWeight:'600' },
  btnPrimary:   { backgroundColor:GREEN, height:52, borderRadius:16, alignItems:'center', justifyContent:'center', shadowColor:GREEN, shadowOpacity:.35, shadowRadius:10, shadowOffset:{width:0,height:4} },
  btnPrimaryTxt:{ color:'#fff', fontSize:16, fontWeight:'700' },
  loginTxt:     { textAlign:'center', color:'#6b7280', fontSize:14 },
  loginLink:    { color:GREEN, fontWeight:'700' },
});
