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
  "Ingeniería en Multimedia": 9,
  "Ingeniería de Sistemas": 9,
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
};

const ordinal = (n: number) => {
  const ordinals = [
    "Primer",
    "Segundo",
    "Tercer",
    "Cuarto",
    "Quinto",
    "Sexto",
    "Séptimo",
    "Octavo",
    "Noveno",
    "Décimo",
    "Undécimo",
    "Duodécimo",
  ];
  return ordinals[n - 1] || `${n}º`;
};

const allInterests = [
  "Animación",
  "Moda",
  "Arte",
  "Música",
  "Tecnología",
  "Deportes",
  "Literatura",
  "Programación",
  "Fotografía",
  "Videojuegos",
  "Cine",
  "Educación",
  "Ciencia",
  "Medio Ambiente",
];

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("David Santiago");
  const [email, setEmail] = useState("david@uniboyaca.edu.co");
  const [isCareerOpen, setIsCareerOpen] = useState(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);

  const carreras = Object.keys(maxSemestersPerCareer);

  const generateSemestersForCareer = (career: string) => {
    const maxSem = maxSemestersPerCareer[career] || 8;
    const semesters = [];
    for (let i = 1; i <= maxSem; i++) {
      semesters.push(`${ordinal(i)} Semestre`);
    }
    return semesters;
  };

  const [career, setCareer] = useState("Ingeniería en Multimedia");
  const [semesters, setSemesters] = useState(generateSemestersForCareer(career));
  const [semester, setSemester] = useState("Sexto Semestre");

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [aboutMe, setAboutMe] = useState(
    "Soy un apasionado por la animación y las narrativas digitales. Me gusta crear, aprender y compartir con otros artistas."
  );

  useEffect(() => {
    loadProfileLocal();
  }, []);

  const loadProfileLocal = async () => {
    try {
      const json = await AsyncStorage.getItem(PROFILE_KEY);
      if (json != null) {
        const savedProfile: ProfileData = JSON.parse(json);
        setName(savedProfile.name || "");
        setEmail(savedProfile.email || "");
        setCareer(savedProfile.career || "Ingeniería en Multimedia");
        const semestersForCareer = generateSemestersForCareer(savedProfile.career || "Ingeniería en Multimedia");
        setSemesters(semestersForCareer);
        setSemester(savedProfile.semester || semestersForCareer[0]);
        setSelectedInterests(savedProfile.selectedInterests || []);
        setAboutMe(savedProfile.aboutMe || "");
      }
    } catch (e) {
      console.error("Error loading profile data:", e);
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

  function toggleInterest(interest: string) {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length >= 3) {
      Alert.alert("Límite máximo", "Solo puedes seleccionar hasta 3 intereses.");
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  }

  const onCareerSelect = (newCareer: string) => {
    setCareer(newCareer);
    const newSemesters = generateSemestersForCareer(newCareer);
    setSemesters(newSemesters);
    setIsCareerOpen(false);
    setIsSemesterOpen(false);
    setSemester(newSemesters[0]);
  };

  const saveProfile = () => {
    const profileData: ProfileData = {
      name,
      email,
      career,
      semester,
      selectedInterests,
      aboutMe,
    };
    saveProfileLocal(profileData);
    Alert.alert("Perfil actualizado", "Tus datos han sido guardados");
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: "center" }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => (isEditing ? saveProfile() : setIsEditing(true))}
        >
          <MaterialIcons name={isEditing ? "check" : "edit"} size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: "https://i.pinimg.com/564x/7a/79/ac/7a79ac0cdd39e39d9b1ee8360341d49b.jpg" }}
            style={styles.avatar}
          />
          {isEditing && (
            <TouchableOpacity style={styles.addPhotoButton}>
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Nombre y correo como texto estático */}
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Programa y Semestre Académico</Text>
        {isEditing ? (
          <>
            <TouchableOpacity style={styles.input} onPress={() => setIsCareerOpen(!isCareerOpen)}>
              <Text style={{ color: "#000000ff" }}>{career}</Text>
            </TouchableOpacity>

            {isCareerOpen &&
              carreras.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.input, { backgroundColor: "#b8b8b886", marginVertical: 2 }]}
                  onPress={() => onCareerSelect(c)}
                >
                  <Text style={{ color: "#000000ff" }}>{c}</Text>
                </TouchableOpacity>
              ))}

            <TouchableOpacity style={styles.input} onPress={() => setIsSemesterOpen(!isSemesterOpen)}>
              <Text style={{ color: "#000000ff" }}>{semester}</Text>
            </TouchableOpacity>

            {isSemesterOpen &&
              semesters.map((sem) => (
                <TouchableOpacity
                  key={sem}
                  style={[styles.input, { backgroundColor: "#b8b8b886", marginVertical: 2 }]}
                  onPress={() => {
                    setSemester(sem);
                    setIsSemesterOpen(false);
                  }}
                >
                  <Text style={{ color: "#000000ff" }}>{sem}</Text>
                </TouchableOpacity>
              ))}
          </>
        ) : (
          <Text style={styles.sectionText}>
            {career} - {semester}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intereses</Text>
        {isEditing ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
            {allInterests.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={{
                    backgroundColor: selected ? "#e20613" : "#ddd",
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: selected ? "white" : "#333" }}>{interest}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.sectionText}>
            {selectedInterests.length > 0 ? selectedInterests.join(", ") : "No has seleccionado intereses"}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre mí</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={aboutMe}
            onChangeText={setAboutMe}
            placeholder="Cuéntanos sobre ti"
            multiline
          />
        ) : (
          <Text style={styles.sectionText}>{aboutMe}</Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        {[
          { label: "Grupos", value: "0" },
          { label: "Intereses", value: selectedInterests.length.toString() },
          { label: "Confirmaciones", value: "0" },
        ].map((item, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f9fbff" 
  },
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  addPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#ff3366",
    borderRadius: 20,
    padding: 6,
  },
  name: { fontSize: 22, fontWeight: "700", color: "#fff" },
  email: { color: "#e0e0e0", marginTop: 4 },
  section: {
    width: "90%",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  sectionText: { color: "#00000086", lineHeight: 20 },
  input: {
    backgroundColor: "#b8b8b886",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#5b5b5bff",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginTop: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
    elevation: 3,
  },
  statValue: { fontSize: 20, fontWeight: "700", color: "#e20613" },
  statLabel: { color: "#555", marginTop: 4, fontSize: 13 },
});
