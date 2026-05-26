// screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }) {
  const logoScale  = useRef(new Animated.Value(0)).current;
  const fadeIn     = useRef(new Animated.Value(0)).current;
  const slideUp    = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeIn,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Logo animado */}
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
        <MaterialCommunityIcons name="recycle" size={72} color="#fff" />
      </Animated.View>

      {/* Título */}
      <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
        <Text style={styles.brand}>
          <Text style={styles.brandBlack}>Jalisco</Text>
          <Text style={styles.brandGreen}>Recicla</Text>
        </Text>
        <Text style={styles.tagline}>Juntos por un{'\n'}Jalisco más limpio</Text>

        {/* Dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Comenzar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const GREEN = '#16a34a';
const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', paddingHorizontal:32 },
  logoWrap:    { width:120, height:120, borderRadius:32, backgroundColor:GREEN, alignItems:'center', justifyContent:'center', marginBottom:32, shadowColor:GREEN, shadowOpacity:.4, shadowRadius:20, shadowOffset:{width:0,height:8} },
  brand:       { fontSize:36, fontWeight:'800', textAlign:'center', marginBottom:12 },
  brandBlack:  { color:'#111' },
  brandGreen:  { color:GREEN },
  tagline:     { fontSize:18, color:'#555', textAlign:'center', lineHeight:28, marginBottom:32 },
  dots:        { flexDirection:'row', justifyContent:'center', gap:8, marginBottom:40 },
  dot:         { width:8, height:8, borderRadius:4, backgroundColor:'#ddd' },
  dotActive:   { width:24, backgroundColor:GREEN, borderRadius:4 },
  btn:         { backgroundColor:GREEN, paddingVertical:16, borderRadius:16, alignItems:'center', shadowColor:GREEN, shadowOpacity:.4, shadowRadius:12, shadowOffset:{width:0,height:6} },
  btnText:     { color:'#fff', fontSize:17, fontWeight:'700' },
});
