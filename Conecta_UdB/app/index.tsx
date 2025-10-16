// app/index.tsx
import React, { useState, useRef, useCallback, useEffect, JSX } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";

/*
  - Cambia las posiciones del fondo cómodamente en CONFIG (más abajo).
  - Mantiene: login -> register -> verify con animaciones de tarjeta.
  - Fondo animado (translateX / translateY).
*/

/* --------------------
   RECURSOS
   -------------------- */
const BG = require("../assets/images/Logo_udb.png"); // Ajusta la ruta si hace falta

/* --------------------
   CONFIGURACIÓN
   -------------------- */
const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get("window");

const CONFIG = {
  // Posiciones del fondo
  bg: {
    initialX: 300,           // posición inicial X (login)
    registerX: -150,          // posición X al ir a Register
    verifyY: -SCREEN_H,      // posición Y al ir a Verify (sube fuera de pantalla)
    resetX: 150,             // posición al volver a Login
    moveDuration: 420,       // duración por defecto (ms)
  },

  // Transiciones de la tarjeta
  card: {
    slideLarge: SCREEN_W * 0.8, // distancia de slide horizontal (usa % de ancho)
    slideSmall: 300,            // distancia de slide vertical (verify)
    outDuration: 350,           // duración salida tarjeta (ms)
    inDuration: 300,            // duración entrada/opacidad (ms)
    springFriction: 7,
    springTension: 50,
  },
};

/* --------------------
   Nombres de pantallas 
   -------------------- */
const SCREENS = {
  LOGIN: "login",
  REGISTER: "register",
  VERIFY: "verify",
} as const;

type ScreenKey = typeof SCREENS[keyof typeof SCREENS];

/* --------------------
   COMPONENTE PRINCIPAL
   -------------------- */
export default function App(): JSX.Element {
  const [screen, setScreen] = useState<ScreenKey>(SCREENS.LOGIN);

  // Animaciones de la tarjeta (slide + opacidad)
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Animaciones del fondo
  // -> empieza en CONFIG.bg.initialX y 0 en Y
  const bgTranslateX = useRef(new Animated.Value(CONFIG.bg.initialX)).current;
  const bgTranslateY = useRef(new Animated.Value(0)).current;

  // Función simple para animar el fondo a (toX,toY)
  const animateBackground = useCallback(
    (toX: number, toY: number, duration = CONFIG.bg.moveDuration) => {
      Animated.parallel([
        Animated.timing(bgTranslateX, {
          toValue: toX,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bgTranslateY, {
          toValue: toY,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    },
    [bgTranslateX, bgTranslateY]
  );

  /**
   * animateTransition
   * direction:
   *  1  = login -> register (derecha → izquierda en tarjeta)
   * -1  = cualquier -> login (izquierda ← derecha)
   *  2  = register -> verify (abajo → arriba en tarjeta)
   */
  const animateTransition = useCallback(
    (direction: number, nextScreen: ScreenKey) => {
      const SLIDE_LARGE = CONFIG.card.slideLarge;
      const SLIDE_SMALL = CONFIG.card.slideSmall;

      // Salida: desliza y desvanece
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: direction === 1 ? -SLIDE_LARGE : direction === -1 ? SLIDE_LARGE : direction === 2 ? -SLIDE_SMALL : 0,
          duration: CONFIG.card.outDuration,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: CONFIG.card.outDuration - 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Cambio de pantalla
        setScreen(nextScreen);

        // Posición inicial para la entrada de la nueva pantalla
        slideAnim.setValue(direction === 2 ? SLIDE_SMALL : direction === -1 ? -SLIDE_LARGE : SLIDE_LARGE);

        // Entrada: spring + fade in
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: CONFIG.card.springFriction,
            tension: CONFIG.card.springTension,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: CONFIG.card.inDuration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [slideAnim, opacityAnim]
  );

  // Maneja la lógica de cambio de pantalla y sincroniza animaciones de fondo
  const changeScreen = useCallback(
    (nextScreen: ScreenKey) => {
      let direction = 0;
      if (screen === SCREENS.LOGIN && nextScreen === SCREENS.REGISTER) direction = 1;
      else if (screen === SCREENS.REGISTER && nextScreen === SCREENS.VERIFY) direction = 2;
      else if (nextScreen === SCREENS.LOGIN) direction = -1;

      // *************** comportamiento del fondo ***************

      if (screen === SCREENS.LOGIN && nextScreen === SCREENS.REGISTER) {
        // Desde login -> register: mover fondo a registerX (derecha)
        animateBackground(CONFIG.bg.registerX, 0, 400);
      } else if (screen === SCREENS.REGISTER && nextScreen === SCREENS.VERIFY) {
        // Desde register -> verify: subir fondo fuera de pantalla (Y negativo)
        animateBackground(CONFIG.bg.registerX, CONFIG.bg.verifyY, 450);
      } else if (nextScreen === SCREENS.LOGIN) {
        // Volver a login: restaurar posición inicial
        animateBackground(CONFIG.bg.resetX, 0, 400);
      }
      // ***************************************************************************************

      // Ejecuta animación de tarjeta
      animateTransition(direction, nextScreen);
    },
    [screen, animateBackground, animateTransition]
  );

  // Asegurarse que el fondo arranque en la posición inicial (útil para hot reload)
  useEffect(() => {
    bgTranslateX.setValue(CONFIG.bg.initialX);
    bgTranslateY.setValue(0);
  }, [bgTranslateX, bgTranslateY]);

  // Decide transform para la tarjeta (horizontal o vertical)
  const getTransform = () => (screen === SCREENS.VERIFY ? [{ translateY: slideAnim }] : [{ translateX: slideAnim }]);

  /* --------------------
     RENDER
     -------------------- */
  return (
    <View style={styles.root}>
      {/* Imagen de fondo animada */}
      <Animated.Image
        source={BG}
        style={[
          styles.bgImage,
          { transform: [{ translateX: bgTranslateX }, { translateY: bgTranslateY }, { scale: 1.05 }] },
        ]}
        resizeMode="cover"
      />

      {/* Overlay (mejora contraste) */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Contenedor principal */}
      <View style={styles.container}>
        <Animated.View style={[styles.card, { transform: getTransform(), opacity: opacityAnim }]}>
          {screen === SCREENS.LOGIN && <LoginScreen onRegister={() => changeScreen(SCREENS.REGISTER)} />}
          {screen === SCREENS.REGISTER && (
            <RegisterScreen onNext={() => changeScreen(SCREENS.VERIFY)} onBack={() => changeScreen(SCREENS.LOGIN)} />
          )}
          {screen === SCREENS.VERIFY && <VerifyScreen onBack={() => changeScreen(SCREENS.LOGIN)} />}
        </Animated.View>
      </View>
    </View>
  );
}

/* --------------------
   COMPONENTES PEQUEÑOS (pantallas)
   -------------------- */

function LoginScreen({ onRegister }: { onRegister: () => void }) {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <View style={styles.inputContainer}>
        <TextInput placeholder="Correo electrónico" placeholderTextColor="#aaa" style={styles.input} keyboardType="email-address" />
        <TextInput placeholder="Contraseña" placeholderTextColor="#aaa" secureTextEntry style={styles.input} />
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#2563eb" }]} accessibilityLabel="Ingresar">
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        ¿No tienes cuenta? <Text style={styles.link} onPress={onRegister}>Regístrate</Text>
      </Text>
    </View>
  );
}

function RegisterScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.header}>Crear Cuenta</Text>

      <TextInput placeholder="Nombre completo" style={styles.input} />
      <TextInput placeholder="Correo electrónico" style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Contraseña" style={styles.input} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        ¿Ya tienes una cuenta? <Text style={styles.link} onPress={onBack}>Iniciar sesión</Text>
      </Text>
    </View>
  );
}

function VerifyScreen({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState("");
  return (
    <View style={styles.formContainer}>
      <Text style={styles.header}>Verificar Código</Text>
      <Text style={styles.info}>Se envió un código de 6 dígitos a tu correo.</Text>

      <TextInput placeholder="Ingresa el código" style={styles.input} keyboardType="numeric" maxLength={6} value={code} onChangeText={setCode} />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        ¿No recibiste el código? <Text style={styles.link}>Reenviar</Text>
      </Text>

      <Text style={[styles.link, { marginTop: 12 }]} onPress={onBack}>← Volver al inicio</Text>
    </View>
  );
}

/* --------------------
   ESTILOS
   -------------------- */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  bgImage: {
    position: "absolute",
    top: 100,
    left: -20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },

  /* Form */
  formContainer: { width: "100%" },
  title: { fontSize: 32, fontWeight: "700", color: "#111827", marginBottom: 6 },
  subtitle: { fontSize: 16, color: "#6b7280", marginBottom: 24 },
  header: { fontSize: 28, fontWeight: "700", marginBottom: 20, color: "#000" },
  info: { fontSize: 14, color: "#555", marginBottom: 16 },
  inputContainer: { width: "100%", gap: 12 },
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
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  /* Footer / links */
  footer: { color: "#6b7280", marginTop: 16, textAlign: "center" },
  link: { color: "#2563eb", fontWeight: "600" },
});