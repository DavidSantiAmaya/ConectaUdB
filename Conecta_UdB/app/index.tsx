import React, { useState, useRef, useCallback, useEffect } from "react";
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

const BG = require("../assets/images/Logo_udb.png"); // adjust if different path

const SCREENS = {
  LOGIN: "login",
  REGISTER: "register",
  VERIFY: "verify",
} as const;

type ScreenKey = typeof SCREENS[keyof typeof SCREENS];

export default function App(): React.JSX.Element {
  const [screen, setScreen] = useState<ScreenKey>(SCREENS.LOGIN);

  // main animations for card transitions
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // screen dims
  const { height: SCREEN_H } = Dimensions.get("window");

  /**
   * CONFIG: centraliza aquí todas las posiciones/valores que quieras editar
   *
   * bg.initialX   -> posición X inicial del fondo (login)
   * bg.registerX  -> posición X objetivo cuando el usuario hace "Regístrate"
   * bg.verifyY    -> posición Y objetivo al entrar en Verify (ej. -SCREEN_H para subir fuera)
   * bg.resetX     -> posición X al volver a login (por defecto igual a initialX)
   * bg.duration   -> duración por defecto de la animación del fondo
   *
   * card.* -> valores para los movimientos de la tarjeta (si quieres ajustar)
   */
  const CONFIG = {
    bg: {
      initialX: 150, // px — posición inicial X (login)
      registerX: -300, // px — posición X al ir a register
      verifyY: -SCREEN_H, // px — posición Y al ir a verify (sube fuera). Puedes cambiar a -SCREEN_H * 0.6 para subir parcialmente
      resetX: 150, // px — posición al volver a login (por defecto igual a initialX)
      duration: 420, // ms — duración por defecto para animaciones del fondo
      easing: Easing.out(Easing.cubic),
      scale: 1, // escala aplicada a la imagen para evitar bordes visibles al mover
    },
    card: {
      slideLarge: 400, // valor usado para traslados horizontales grandes (antes 400)
      slideSmall: 300, // valor usado para traslados verticales (antes 300)
      outDuration: 350,
      inDuration: 300,
      springFriction: 7,
      springTension: 50,
    },
  };

  // background animation values (inicializados usando CONFIG.bg.initialX)
  const bgTranslateX = useRef(new Animated.Value(CONFIG.bg.initialX)).current;
  const bgTranslateY = useRef(new Animated.Value(0)).current;

  // helper: animate background to particular values
    const animateBackground = useCallback(
      (toX: number, toY: number, duration = CONFIG.bg.duration) => {
        Animated.parallel([
          Animated.timing(bgTranslateX, {
            toValue: toX,
            duration,
            easing: CONFIG.bg.easing,
            useNativeDriver: true,
          }),
          Animated.timing(bgTranslateY, {
            toValue: toY,
            duration,
            easing: CONFIG.bg.easing,
            useNativeDriver: true,
          }),
        ]).start();
      },
      [bgTranslateX, bgTranslateY, CONFIG.bg.duration, CONFIG.bg.easing]
    );

  /**
   * animateTransition
   * direction:
   *  1  = login -> register (slide right -> left)
   * -1  = any -> login (slide left -> right)
   *  2  = register -> verify (slide bottom -> top)
   */
  const animateTransition = useCallback(
    (direction: number, nextScreen: ScreenKey) => {
      // Slide the card out + fade
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue:
            direction === 1
              ? -CONFIG.card.slideLarge
              : direction === -1
              ? CONFIG.card.slideLarge
              : direction === 2
              ? -CONFIG.card.slideSmall
              : 0,
          duration: CONFIG.card.outDuration,
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
        // after exit animation, change screen
        setScreen(nextScreen);

        // set initial offset for incoming screen
        slideAnim.setValue(direction === 2 ? CONFIG.card.slideSmall : direction === -1 ? -CONFIG.card.slideLarge : CONFIG.card.slideLarge);

        // Entry animation (spring + fade in)
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
    [
      slideAnim,
      opacityAnim,
      CONFIG.card.inDuration,
      CONFIG.card.outDuration,
      CONFIG.card.slideLarge,
      CONFIG.card.slideSmall,
      CONFIG.card.springFriction,
      CONFIG.card.springTension,
    ]
  );

  const changeScreen = useCallback(
    (nextScreen: ScreenKey) => {
      let direction = 0;
      if (screen === SCREENS.LOGIN && nextScreen === SCREENS.REGISTER) direction = 1;
      else if (screen === SCREENS.REGISTER && nextScreen === SCREENS.VERIFY) direction = 2;
      else if (nextScreen === SCREENS.LOGIN) direction = -1;

      // Trigger background animations depending on transition
      if (screen === SCREENS.LOGIN && nextScreen === SCREENS.REGISTER) {
        // when clicking "Regístrate" from login: move bg further to the right
        animateBackground(CONFIG.bg.registerX, 0, CONFIG.bg.duration);
      } else if (screen === SCREENS.REGISTER && nextScreen === SCREENS.VERIFY) {
        // when going from register -> verify: move bg up (out of view or partial)
        animateBackground(CONFIG.bg.registerX, CONFIG.bg.verifyY, CONFIG.bg.duration + 30);
      } else if (nextScreen === SCREENS.LOGIN) {
        // returning to login: reset bg to initial
        animateBackground(CONFIG.bg.resetX, 0, CONFIG.bg.duration);
      }

      animateTransition(direction, nextScreen);
    },
    [screen, animateBackground, animateTransition, CONFIG.bg.duration, CONFIG.bg.registerX, CONFIG.bg.resetX, CONFIG.bg.verifyY]
  );

  const getTransform = useCallback(() => {
    if (screen === SCREENS.VERIFY) {
      return [{ translateY: slideAnim }];
    } else {
      return [{ translateX: slideAnim }];
    }
  }, [screen, slideAnim]);

  // Ensure bg starts at the initial position on mount (in case of hot reload)
  useEffect(() => {
    bgTranslateX.setValue(CONFIG.bg.initialX);
    bgTranslateY.setValue(0);
  }, [bgTranslateX, bgTranslateY, CONFIG.bg.initialX]);

  return (
    <View style={styles.root}>
      {/* Animated background image (positioned absolutely) */}
      <Animated.Image
        source={BG}
        style={[
          styles.bgImage,
          {
            transform: [{ translateX: bgTranslateX }, { translateY: bgTranslateY }, { scale: CONFIG.bg.scale }],
          },
        ]}
        resizeMode="cover"
      />

      {/* Overlay to improve contrast */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Main container with animated card */}
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

/* -------------------------
   Small screen components
   ------------------------- */

function LoginScreen({ onRegister }: { onRegister: () => void }) {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <View style={styles.inputContainer}>
        <TextInput placeholder="Correo electrónico" placeholderTextColor="#aaa" style={styles.input} />
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

      <Text style={[styles.link, { marginTop: 12 }]} onPress={onBack}>
        ← Volver al inicio
      </Text>
    </View>
  );
}

/* -------------------------
   Styles
   ------------------------- */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffffff",
    overflow: "hidden",
  },
  bgImage: {
    position: "absolute",
    top: 95, // movido hacia arriba
    left: 150,
    opacity: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
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
    color: "#2563eb",
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
