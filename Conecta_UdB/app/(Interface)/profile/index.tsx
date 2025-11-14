// app/(Interface)/profile/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const PROFILE_KEY = "@conectaudb_profile";

interface ProfileData {
  name: string;
  email: string;
  career: string;
  semester: string;
  selectedInterests: string[];
  aboutMe: string;
}

const maxSemestersPerCareer: Record<string, number> = {
  "Medicina": 12,
  "Enfermería": 8,
  "Bacteriología y Laboratorio Clínico": 10,
  "Terapia Respiratoria": 8,
  "Fisioterapia": 9,
  "Ingeniería Sanitaria": 9,
  "Ingeniería Ambiental": 8,
  "Ingeniería Industrial": 8,
  "Ingeniería Civil": 8,  
  "Ingeniería Mecatrónica": 9,
  "Psicología": 10,
  "Licenciatura en Educación Infantil": 8,
  "Diseño Gráfico": 8,
  "Arquitectura": 9,
  "Comunicación Social": 8,
  "Derecho y Ciencias Políticas": 10,
  "Administración de Negocios Internacionales": 8,
  "Administración de Empresas": 8,
  "Contaduría Pública": 8,
  "Ingeniería en Multimedia": 9,
  "Ingeniería de Sistemas": 9,
};

const allInterests = ["Animación", "Moda", "Arte", "Música", "Tecnología", "Deportes", "Literatura", "Programación", "Fotografía", "Videojuegos", "Cine", "Educación", "Ciencia", "Medio Ambiente"];

export default function ProfileScreen() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [career, setCareer] = useState("Ingeniería en Multimedia");
  const [semester, setSemester] = useState("Sexto Semestre");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [aboutMe, setAboutMe] = useState("");

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const generateSemestersForCareer = (career: string) => {
    const maxSem = maxSemestersPerCareer[career] || 8;
    const semesters = [];
    for (let i = 1; i <= maxSem; i++) semesters.push(`${i}º Semestre`);
    return semesters;
  };

  const loadCurrentUser = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem("currentUser");
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        setName(currentUser.name || "");
        setEmail(currentUser.email || "");
        setIsAdmin(currentUser.isAdmin || false);

        // Si es admin, redirigir a pantalla de admin
        if (currentUser.isAdmin) {
          router.replace("/(Interface)/admin");
          return;
        }

        // Cargar perfil completo si existe
        const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
        if (profileJson) {
          const savedProfile: ProfileData = JSON.parse(profileJson);
          setCareer(savedProfile.career || "Ingeniería en Multimedia");
          setSemester(savedProfile.semester || "Sexto Semestre");
          setSelectedInterests(savedProfile.selectedInterests || []);
          setAboutMe(savedProfile.aboutMe || "");
        }
      } else {
        // Si no hay currentUser, redirigir a login
        router.replace("/"); // index.tsx (login)
      }
    } catch (e) {
      console.error("Error loading current user:", e);
    }
  };

  const saveProfileLocal = async (profileData: ProfileData) => {
    try {
      const json = JSON.stringify(profileData);
      await AsyncStorage.setItem(PROFILE_KEY, json);
    } catch (e) {
      console.error("Error saving profile data:", e);
    }
  };

  const saveProfile = () => {
    const profileData: ProfileData = { name, email, career, semester, selectedInterests, aboutMe };
    saveProfileLocal(profileData);
    Alert.alert("Perfil actualizado", "Tus datos han sido guardados");
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.editButton} onPress={() => (isEditing ? saveProfile() : setIsEditing(true))}>
          <MaterialIcons name={isEditing ? "save" : "edit"} size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <Image source={{ uri: "https://via.placeholder.com/100" }} style={styles.avatar} />
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Programa y Semestre Académico</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={career} onChangeText={setCareer} />
        ) : (
          <Text style={styles.sectionText}>{career} - {semester}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intereses</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={selectedInterests.join(", ")} onChangeText={(t) => setSelectedInterests(t.split(",").map(s => s.trim()))} />
        ) : (
          <Text style={styles.sectionText}>{selectedInterests.length ? selectedInterests.join(", ") : "No has seleccionado intereses"}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre mí</Text>
        {isEditing ? <TextInput style={[styles.input, { height: 80 }]} value={aboutMe} onChangeText={setAboutMe} multiline /> : <Text style={styles.sectionText}>{aboutMe}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fbff" },
  header: {
    backgroundColor: "#e20615ea",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6,
    width: "100%",
  },
  editButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
  avatarContainer: { position: "relative", marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#fff" },
  name: { fontSize: 22, fontWeight: "700", color: "#fff" },
  email: { color: "#e0e0e0", marginTop: 4 },
  section: { width: "90%", marginVertical: 10, alignSelf: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 6 },
  sectionText: { color: "#00000086", lineHeight: 20 },
  input: { backgroundColor: "#b8b8b886", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, color: "#5b5b5bff", fontWeight: "600" },
});
