import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";

export default function App() {
  const [screen, setScreen] = useState("login"); // login | register | verify
  const slideAnim = useRef(new Animated.Value(0)).current; // posición de entrada/salida
  const opacityAnim = useRef(new Animated.Value(1)).current; // opacidad suave

  const animateTransition = (direction: number, nextScreen: string) => {
    // Salida: se mueve y desvanece
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue:
          direction === 1 ? -400 : direction === -1 ? 400 : direction === 2 ? -300 : 0,
        duration: 350,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Cambio de pantalla
      setScreen(nextScreen);
      slideAnim.setValue(direction === 2 ? 300 : direction === -1 ? -400 : 400);

      // Entrada: rebote con spring
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const changeScreen = (nextScreen: string) => {
    let direction = 0;
    if (screen === "login" && nextScreen === "register") direction = 1; // derecha → izquierda
    else if (screen === "register" && nextScreen === "verify") direction = 2; // abajo → arriba
    else if (nextScreen === "login") direction = -1; // izquierda ← derecha
    animateTransition(direction, nextScreen);
  };

  const getTransform = () => {
    if (screen === "verify") {
      return [{ translateY: slideAnim }];
    } else {
      return [{ translateX: slideAnim }];
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.card, { transform: getTransform(), opacity: opacityAnim }]}
      >
        {screen === "login" && (
          <LoginScreen onRegister={() => changeScreen("register")} />
        )}
        {screen === "register" && (
          <RegisterScreen
            onNext={() => changeScreen("verify")}
            onBack={() => changeScreen("login")}
          />
        )}
        {screen === "verify" && (
          <VerifyScreen onBack={() => changeScreen("login")} />
        )}
      </Animated.View>
    </View>
  );
}

// ======================== LOGIN ========================
function LoginScreen({ onRegister }: { onRegister: () => void }) {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#2563eb" }]}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        ¿No tienes cuenta?{" "}
        <Text style={styles.link} onPress={onRegister}>
          Regístrate
        </Text>
      </Text>
    </View>
  );
}

// ======================== REGISTER ========================
function RegisterScreen({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.header}>Crear Cuenta</Text>

      <TextInput placeholder="Nombre completo" style={styles.input} />
      <TextInput
        placeholder="Correo electrónico"
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput placeholder="Contraseña" style={styles.input} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        ¿Ya tienes una cuenta?{" "}
        <Text style={styles.link} onPress={onBack}>
          Iniciar sesión
        </Text>
      </Text>
    </View>
  );
}

// ======================== VERIFY ========================
function VerifyScreen({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState("");

  return (
    <View style={styles.formContainer}>
      <Text style={styles.header}>Verificar Código</Text>
      <Text style={styles.info}>
        Se envió un código de 6 dígitos a tu correo.
      </Text>

      <TextInput
        placeholder="Ingresa el código"
        style={styles.input}
        keyboardType="numeric"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        ¿No recibiste el código? <Text style={styles.link}>Reenviar</Text>
      </Text>

      <Text style={[styles.link, { marginTop: 12 }]} onPress={onBack}>
        ← Volver al inicio
      </Text>
    </View>
  );
}

// ======================== ESTILOS ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000ff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
  },
  inputContainer: {
    width: "100%",
    gap: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    width: "100%",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    color: "#6b7280",
    marginTop: 16,
    textAlign: "center",
  },
  link: {
    color: "#000",
    fontWeight: "600",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000",
  },
  info: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
});