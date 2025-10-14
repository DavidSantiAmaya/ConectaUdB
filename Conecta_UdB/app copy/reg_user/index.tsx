import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validarCorreoInstitucional = (correo: string): boolean => {
    return correo.toLowerCase().endsWith('@uniboyaca.edu.co');
  };

  const handleRegister = () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }

    if (!validarCorreoInstitucional(email)) {
      Alert.alert(
        'Correo inválido',
        'Debes usar un correo institucional que termine en @uniboyaca.edu.co'
      );
      return;
    }

    router.replace('/(tabs)');
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }

    if (!validarCorreoInstitucional(email)) {
      Alert.alert(
        'Correo inválido',
        'Debes usar un correo institucional que termine en @uniboyaca.edu.co'
      );
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'login' ? 'Iniciar Sesión' : 'Registro'}
      </Text>

      <TextInput
        placeholder="Correo institucional"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={mode === 'login' ? handleLogin : handleRegister}
      >
        <Text style={styles.buttonText}>
          {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        <Text style={styles.switchText}>
          {mode === 'login'
            ? '¿No tienes cuenta? Regístrate'
            : '¿Ya tienes cuenta? Inicia sesión'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#0056b3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    color: '#0056b3',
    fontSize: 14,
    marginTop: 10,
  },
});