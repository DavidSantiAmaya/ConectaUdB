// app/index.tsx
import React, { useState, useRef, useCallback, JSX, useEffect } from "react";
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
  Image,
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

type User = {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  isAdmin?: boolean;
  verificationCode?: string;
};

const SCREENS = {
  LOGIN: "login",
  REGISTER: "register",
  VERIFY: "verify",
} as const;

type ScreenKey = typeof SCREENS[keyof typeof SCREENS];

// 👤 USUARIOS PREDEFINIDOS
const PREDEFINED_USERS: User[] = [
  {
    name: "David Santiago",
    email: "dsamaya@uniboyaca.edu.co",
    password: "123123",
    verified: true,
    isAdmin: false,
  },
  {
    name: "Administrador",
    email: "admin@uniboyaca.edu.co",
    password: "123456", // CORRECCIÓN: 123456
    verified: true,
    isAdmin: true,
  },
];

export default function App(): JSX.Element {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenKey>(SCREENS.LOGIN);
  const [tempUser, setTempUser] = useState<User | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const bgTranslateX = useRef(new Animated.Value(CONFIG.bg.initialX)).current;
  const bgTranslateY = useRef(new Animated.Value(0)).current;

  // Inicializar usuarios predefinidos en AsyncStorage si no existen
  useEffect(() => {
    initializePredefinedUsers();
  }, []);

  const initializePredefinedUsers = async () => {
    try {
      const saved = await AsyncStorage.getItem("users");
      let users: User[] = saved ? JSON.parse(saved) : [];

      // Agregar usuarios predefinidos si no existen
      PREDEFINED_USERS.forEach((predefinedUser) => {
        const exists = users.find((u) => u.email === predefinedUser.email);
        if (!exists) {
          users.push(predefinedUser);
        }
      });

      await AsyncStorage.setItem("users", JSON.stringify(users));
    } catch (e) {
      console.error("Error initializing predefined users:", e);
    }
  };

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
    screen === SCREENS.VERIFY ? [{ translateY: slideAnim }] : [{ translateX: slideAnim }];

  return (
    <View style={styles.root}>
      <Animated.Image
        source={BG}
        style={[
          styles.bgImage,
          {
            transform: [{ translateX: bgTranslateX }, { translateY: bgTranslateY }],
          },
        ]}
      />
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Animated.View style={[styles.card, { opacity: opacityAnim, transform: getTransform() }]}>
          {screen === SCREENS.LOGIN && (
            <LoginScreen onRegister={() => changeScreen(SCREENS.REGISTER)} onSuccess={() => router.push("/(Interface)/home")} />
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
            <VerifyScreen user={tempUser} onSuccess={() => router.push("/(Interface)/home")} onBack={() => changeScreen(SCREENS.LOGIN)} />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

/* --------------------
   LOGIN
-------------------- */
function LoginScreen({ onRegister, onSuccess }: { onRegister: () => void; onSuccess: () => void; }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.endsWith("@uniboyaca.edu.co")) {
      Alert.alert("Error", "Solo se permiten correos @uniboyaca.edu.co");
      return;
    }

    try {
      const saved = await AsyncStorage.getItem("users");
      const users: User[] = saved ? JSON.parse(saved) : [];

      // buscar usuario (incluye usuarios predefinidos que inicializamos)
      const found = users.find((u: User) => u.email === email && u.password === password);

      if (!found) {
        Alert.alert("Error", "Usuario o contraseña incorrectos");
        return;
      }

      if (!found.verified) {
        Alert.alert("Aviso", "Verifica tu cuenta antes de ingresar");
        return;
      }

      // 🔥 GUARDAR SESIÓN ACTUAL
      await AsyncStorage.setItem("currentUser", JSON.stringify(found));

      onSuccess();
    } catch (e) {
      console.error("Login error:", e);
      Alert.alert("Error", "Ocurrió un error al iniciar sesión");
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      <TextInput style={styles.input} placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
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
function RegisterScreen({ onNext, onBack }: { onNext: (user: User) => void; onBack: () => void; }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    if (!email.endsWith("@uniboyaca.edu.co")) {
      Alert.alert("Error", "Usa un correo @uniboyaca.edu.co");
      return;
    }

    try {
      const saved = await AsyncStorage.getItem("users");
      const users: User[] = saved ? JSON.parse(saved) : [];

      if (users.find((u: User) => u.email === email)) {
        Alert.alert("Error", "Este correo ya está registrado");
        return;
      }

      const newUser: User = { name, email, password, verified: false };
      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));

      Alert.alert("Código enviado", "Tu código de verificación es 789456 (demo)");
      onNext(newUser);
    } catch (e) {
      console.error("Register error:", e);
      Alert.alert("Error", "Ocurrió un error al registrar");
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <TextInput style={styles.input} placeholder="Nombre completo" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
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
function VerifyScreen({ user, onSuccess, onBack }: { user: User | null; onSuccess: () => void; onBack: () => void; }) {
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    if (code !== "789456") {
      Alert.alert("Error", "Código incorrecto");
      return;
    }

    if (!user) {
      Alert.alert("Error", "Usuario no encontrado");
      return;
    }

    try {
      const saved = await AsyncStorage.getItem("users");
      const users: User[] = saved ? JSON.parse(saved) : [];

      const idx = users.findIndex((u: User) => u.email === user.email);
      if (idx >= 0) {
        users[idx].verified = true;
        await AsyncStorage.setItem("users", JSON.stringify(users));

        // 🔥 GUARDAR SESIÓN ACTUAL
        await AsyncStorage.setItem("currentUser", JSON.stringify(users[idx]));

        Alert.alert("Cuenta verificada", "Tu cuenta ha sido activada");
        onSuccess();
      }
    } catch (e) {
      console.error("Verify error:", e);
      Alert.alert("Error", "Ocurrió un error al verificar");
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.header}>Verificar Código</Text>
      <Text style={styles.info}>Se envió un código a tu correo.</Text>
      <TextInput style={styles.input} placeholder="Código" value={code} onChangeText={setCode} keyboardType="number-pad" />
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.link}>← Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

/* --------------------
   ESTILOS
-------------------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff", overflow: "hidden" },
  bgImage: { position: "absolute", top: 100, left: -20 },
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
  formContainer: { width: "100%" },
  title: { fontSize: 32, fontWeight: "700", color: "#111827", marginBottom: 6 },
  subtitle: { fontSize: 16, color: "#806b6bff", marginBottom: 24 },
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
    backgroundColor: "#e20613",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  footer: { color: "#806b6bff", marginTop: 16, textAlign: "center" },
  link: { color: "#e20613", fontWeight: "600" },
});
