// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginWithEmail } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.');
      return;
    }
    try {
      setLoading(true);
      await loginWithEmail(email, password);
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Error', 'Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="recycle" size={40} color={GREEN} />
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Field
          icon="email-outline" placeholder="Correo electrónico"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
        />
        <Field
          icon="lock-outline" placeholder="Contraseña"
          value={password} onChangeText={setPassword}
          secureTextEntry={!showPwd}
          right={
            <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
              <MaterialCommunityIcons name={showPwd ? 'eye-off' : 'eye'} size={20} color="#9ca3af" />
            </TouchableOpacity>
          }
        />

        {/* Remember + Forgot */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.check} onPress={() => setRemember(!remember)}>
            <MaterialCommunityIcons
              name={remember ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={20} color={remember ? GREEN : '#9ca3af'}
            />
            <Text style={styles.rememberTxt}>Recordarme</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        {/* Login btn */}
        <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnPrimaryTxt}>Iniciar sesión</Text>
          }
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.divLine} />
          <Text style={styles.divTxt}>o continúa con</Text>
          <View style={styles.divLine} />
        </View>

        {/* Social */}
        <View style={styles.socialRow}>
          <SocialBtn icon="google" label="Google" onPress={() => {}} />
          <SocialBtn icon="apple"  label="Apple"  onPress={() => {}} />
        </View>

        {/* Register link */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerTxt}>
            ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Field({ icon, right, ...props }) {
  return (
    <View style={styles.fieldWrap}>
      <MaterialCommunityIcons name={icon} size={20} color="#9ca3af" style={styles.fieldIcon} />
      <TextInput style={styles.fieldInput} placeholderTextColor="#9ca3af" {...props} />
      {right && <View style={styles.fieldRight}>{right}</View>}
    </View>
  );
}

function SocialBtn({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.socialBtn} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={22} color="#333" />
      <Text style={styles.socialTxt}>{label}</Text>
    </TouchableOpacity>
  );
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  container:    { flexGrow:1, backgroundColor:'#fff', padding:28 },
  header:       { alignItems:'center', marginTop:40, marginBottom:32 },
  title:        { fontSize:28, fontWeight:'800', color:'#111', marginTop:12 },
  subtitle:     { fontSize:15, color:'#6b7280', marginTop:4 },
  form:         { gap:14 },
  fieldWrap:    { flexDirection:'row', alignItems:'center', backgroundColor:'#f9fafb', borderRadius:14, borderWidth:1.5, borderColor:'#e5e7eb', paddingHorizontal:14, height:52 },
  fieldIcon:    { marginRight:10 },
  fieldInput:   { flex:1, fontSize:15, color:'#111' },
  fieldRight:   { marginLeft:8 },
  row:          { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  check:        { flexDirection:'row', alignItems:'center', gap:6 },
  rememberTxt:  { color:'#374151', fontSize:14 },
  forgot:       { color:GREEN, fontSize:14, fontWeight:'600' },
  btnPrimary:   { backgroundColor:GREEN, height:52, borderRadius:16, alignItems:'center', justifyContent:'center', shadowColor:GREEN, shadowOpacity:.35, shadowRadius:10, shadowOffset:{width:0,height:4} },
  btnPrimaryTxt:{ color:'#fff', fontSize:16, fontWeight:'700' },
  divider:      { flexDirection:'row', alignItems:'center', gap:10, marginVertical:4 },
  divLine:      { flex:1, height:1, backgroundColor:'#e5e7eb' },
  divTxt:       { color:'#9ca3af', fontSize:13 },
  socialRow:    { flexDirection:'row', gap:12 },
  socialBtn:    { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, height:50, borderRadius:14, borderWidth:1.5, borderColor:'#e5e7eb', backgroundColor:'#fff' },
  socialTxt:    { fontSize:14, fontWeight:'600', color:'#374151' },
  registerTxt:  { textAlign:'center', color:'#6b7280', fontSize:14, marginTop:4 },
  registerLink: { color:GREEN, fontWeight:'700' },
});
