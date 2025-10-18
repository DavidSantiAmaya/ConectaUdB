import React, { useState, useRef, useCallback, JSX } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const BG = require("../assets/images/Logo_udb.png");

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get("window");

const CONFIG = {
  bg: {
    initialX: 300,
    registerX: -150,
    verifyY: -SCREEN_H,
    resetX: 150,
    moveDuration: 420,
  },
  card: {
    slideLarge: SCREEN_W * 0.8,
    slideSmall: 300,
    outDuration: 350,
    inDuration: 300,
    springFriction: 7,
    springTension: 50,
  },
};

const SCREENS = {
  LOGIN: "login",
  REGISTER: "register",
  VERIFY: "verify",
} as const;

type ScreenKey = typeof SCREENS[keyof typeof SCREENS];

export default function App(): JSX.Element {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenKey>(SCREENS.LOGIN);
  const [tempUser, setTempUser] = useState<any>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const bgTranslateX = useRef(new Animated.Value(CONFIG.bg.initialX)).current;
  const bgTranslateY = useRef(new Animated.Value(0)).current;

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

  const animateTransition = useCallback(
    (direction: number, nextScreen: ScreenKey) => {
      const SLIDE_LARGE = CONFIG.card.slideLarge;
      const SLIDE_SMALL = CONFIG.card.slideSmall;

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue:
            direction === 1
              ? -SLIDE_LARGE
              : direction === -1
              ? SLIDE_LARGE
              : direction === 2
              ? -SLIDE_SMALL
              : 0,
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
        setScreen(nextScreen);
        slideAnim.setValue(
          direction === 2
            ? SLIDE_SMALL
            : direction === -1
            ? -SLIDE_LARGE
            : SLIDE_LARGE
        );
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

  const changeScreen = useCallback(
    (nextScreen: ScreenKey) => {
      let direction = 0;
      if (screen === SCREENS.LOGIN && nextScreen === SCREENS.REGISTER)
        direction = 1;
      else if (screen === SCREENS.REGISTER && nextScreen === SCREENS.VERIFY)
        direction = 2;
      else if (nextScreen === SCREENS.LOGIN) direction = -1;

      if (screen === SCREENS.LOGIN && nextScreen === SCREENS.REGISTER)
        animateBackground(CONFIG.bg.registerX, 0, 400);
      else if (screen === SCREENS.REGISTER && nextScreen === SCREENS.VERIFY)
        animateBackground(CONFIG.bg.registerX, CONFIG.bg.verifyY, 450);
      else if (nextScreen === SCREENS.LOGIN)
        animateBackground(CONFIG.bg.resetX, 0, 400);

      animateTransition(direction, nextScreen);
    },
    [screen, animateBackground, animateTransition]
  );

  const getTransform = () =>
    screen === SCREENS.VERIFY
      ? [{ translateY: slideAnim }]
      : [{ translateX: slideAnim }];

  return (
    <View style={styles.root}>
      <Animated.Image
        source={BG}
        style={[
          styles.bgImage,
          {
            transform: [
              { translateX: bgTranslateX },
              { translateY: bgTranslateY },
              { scale: 1.05 },
            ],
          },
        ]}
        resizeMode="cover"
      />
      <View style={styles.overlay} pointerEvents="none" />
      <View style={styles.container}>
        <Animated.View
          style={[styles.card, { transform: getTransform(), opacity: opacityAnim }]}
        >
          {screen === SCREENS.LOGIN && (
            <LoginScreen
              onRegister={() => changeScreen(SCREENS.REGISTER)}
              onSuccess={() => router.push("/home")}
            />
          )}
          {screen === SCREENS.REGISTER && (
            <RegisterScreen
              onNext={(user) => {
                setTempUser(user);
                changeScreen(SCREENS.VERIFY);
              }}
              onBack={() => changeScreen(SCREENS.LOGIN)}
            />
          )}
          {screen === SCREENS.VERIFY && (
            <VerifyScreen
              user={tempUser}
              onSuccess={() => router.push("/home")}
              onBack={() => changeScreen(SCREENS.LOGIN)}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

/* --------------------
   LOGIN
-------------------- */
function LoginScreen({
  onRegister,
  onSuccess,
}: {
  onRegister: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.endsWith("@uniboyaca.edu.co")) {
      Alert.alert("Error", "Solo se permiten correos @uniboyaca.edu.co");
      return;
    }
    if (email === "admin@uniboyaca.edu.co" && password === "12345") {
      onSuccess();
      return;
    }
    const saved = await AsyncStorage.getItem("users");
    const users = saved ? JSON.parse(saved) : [];
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (!found) return Alert.alert("Error", "Usuario o contraseña incorrectos");
    if (!found.verified) return Alert.alert("Aviso", "Verifica tu cuenta antes de ingresar");
    onSuccess();
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
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

/* --------------------
   REGISTER
-------------------- */
function RegisterScreen({
  onNext,
  onBack,
}: {
  onNext: (user: any) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!email.endsWith("@uniboyaca.edu.co"))
      return Alert.alert("Error", "Usa un correo @uniboyaca.edu.co");

    const saved = await AsyncStorage.getItem("users");
    const users = saved ? JSON.parse(saved) : [];
    if (users.find((u: any) => u.email === email))
      return Alert.alert("Error", "Este correo ya está registrado");

    const newUser = { name, email, password, verified: false };
    users.push(newUser);
    await AsyncStorage.setItem("users", JSON.stringify(users));

    Alert.alert("Código enviado", "Tu código de verificación es 789456 (demo)");
    onNext(newUser);
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.header}>Crear Cuenta</Text>
      <TextInput
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
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

/* --------------------
   VERIFY
-------------------- */
function VerifyScreen({
  user,
  onSuccess,
  onBack,
}: {
  user: any;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    if (code !== "789456") return Alert.alert("Error", "Código incorrecto");

    const saved = await AsyncStorage.getItem("users");
    const users = saved ? JSON.parse(saved) : [];
    const idx = users.findIndex((u: any) => u.email === user.email);
    if (idx >= 0) users[idx].verified = true;
    await AsyncStorage.setItem("users", JSON.stringify(users));
    Alert.alert("Cuenta verificada", "Tu cuenta ha sido activada");
    onSuccess();
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.header}>Verificar Código</Text>
      <Text style={styles.info}>Se envió un código a tu correo.</Text>
      <TextInput
        placeholder="Ingresa el código"
        value={code}
        onChangeText={setCode}
        style={styles.input}
        keyboardType="numeric"
        maxLength={6}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>
      <Text style={[styles.link, { marginTop: 12 }]} onPress={onBack}>
        ← Volver al inicio
      </Text>
    </View>
  );
}

/* --------------------
   ESTILOS
-------------------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", overflow: "hidden" },
  bgImage: { position: "absolute", top: 100, left: -20 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.08)" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
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
  formContainer: { width: "100%" },
  title: { fontSize: 32, fontWeight: "700", color: "#111827", marginBottom: 6 },
  subtitle: { fontSize: 16, color: "#6b7280", marginBottom: 24 },
  header: { fontSize: 28, fontWeight: "700", marginBottom: 20, color: "#000" },
  info: { fontSize: 14, color: "#555", marginBottom: 16 },
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
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  footer: { color: "#6b7280", marginTop: 16, textAlign: "center" },
  link: { color: "#2563eb", fontWeight: "600" },
});
