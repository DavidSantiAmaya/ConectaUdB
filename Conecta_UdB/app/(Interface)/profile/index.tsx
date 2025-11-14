import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const PROFILE_KEY = "@conectaudb_profile";
const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

const DEFAULT_IMAGES = [
  "https://i.pinimg.com/564x/7a/79/ac/7a79ac0cdd39e39d9b1ee8360341d49b.jpg",

  "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",

  "https://images.pexels.com/photos/4587995/pexels-photo-4587995.jpeg",

  "https://images.pexels.com/photos/1548665/pexels-photo-1548665.jpeg"
  // puedes agregar más URLs aquí
];

interface ProfileData {
  name: string;
  email: string;
  career: string;
  semester: string;
  selectedInterests: string[];
  aboutMe: string;
  imageUrl?: string;
}

interface User {
  name: string;
  email: string;
  password?: string;
  verified?: boolean;
  isAdmin?: boolean;
  imageUrl?: string;
  blocked?: boolean;
  blockedUntil?: number;
}

const maxSemestersPerCareer: Record<string, number> = {
  Medicina: 12,
  Enfermería: 8,
  "Bacteriología y Laboratorio Clínico": 10,
  "Terapia Respiratoria": 8,
  Fisioterapia: 9,
  "Ingeniería Sanitaria": 9,
  "Ingeniería Ambiental": 8,
  "Ingeniería Industrial": 8,
  "Ingeniería Civil": 8,
  "Ingeniería Mecatrónica": 9,
  Psicología: 10,
  "Licenciatura en Educación Infantil": 8,
  "Diseño Gráfico": 8,
  Arquitectura: 9,
  "Comunicación Social": 8,
  "Derecho y Ciencias Políticas": 10,
  "Administración de Negocios Internacionales": 8,
  "Administración de Empresas": 8,
  "Contaduría Pública": 8,
  "Ingeniería en Multimedia": 9,
  "Ingeniería de Sistemas": 9,
};

const ordinal = (n: number) => {
  const ord = [
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
  return ord[n - 1] || `${n}º`;
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
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [career, setCareer] = useState("Ingeniería en Multimedia");
  const [semesters, setSemesters] = useState<string[]>([]);
  const [semester, setSemester] = useState("Primer Semestre");

  const [isCareerOpen, setIsCareerOpen] = useState(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [aboutMe, setAboutMe] = useState("");

  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGES[0]);
  const [modalVisible, setModalVisible] = useState(false);

  const carreras = Object.keys(maxSemestersPerCareer);

  const generateSemestersForCareer = (careerName: string) => {
    const max = maxSemestersPerCareer[careerName] || 8;
    const list: string[] = [];
    for (let i = 1; i <= max; i++) list.push(`${ordinal(i)} Semestre`);
    return list;
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setLoading(true);
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);

      if (!userJson) {
        router.replace("/");
        return;
      }

      const user: User = JSON.parse(userJson);
      setName(user.name || "");
      setEmail(user.email || "");
      setIsAdmin(user.isAdmin || false);

      if (user.isAdmin) {
        router.replace("/(Interface)/admin");
        return;
      }

      const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
      if (profileJson) {
        const profile: ProfileData = JSON.parse(profileJson);
        const semList = generateSemestersForCareer(profile.career);
        setCareer(profile.career);
        setSemesters(semList);
        setSemester(profile.semester ?? semList[0]);
        setSelectedInterests(profile.selectedInterests ?? []);
        setAboutMe(profile.aboutMe ?? "");
        setImageUrl(profile.imageUrl ?? user.imageUrl ?? DEFAULT_IMAGES[0]);
      } else {
        const semList = generateSemestersForCareer(career);
        setSemesters(semList);
        setSemester(semList[0]);
        setImageUrl(user.imageUrl ?? DEFAULT_IMAGES[0]);
      }
    } catch (e) {
      console.error("Error loading user:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveProfileLocal = async (data: ProfileData) => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving profile:", e);
    }
  };

  const saveProfile = async () => {
    const data: ProfileData = {
      name,
      email,
      career,
      semester,
      selectedInterests,
      aboutMe,
      imageUrl,
    };

    try {
      await saveProfileLocal(data);

      const saved = await AsyncStorage.getItem(USERS_KEY);
      if (saved) {
        const users: User[] = JSON.parse(saved);
        const updated = users.map((u) =>
          u.email === email ? { ...u, name, email, imageUrl } : u
        );
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
      }

      const currentUserJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson) as User;
        const updatedCurrent = { ...currentUser, name, email, imageUrl };
        await AsyncStorage.setItem(
          CURRENT_USER_KEY,
          JSON.stringify(updatedCurrent)
        );
      }

      Alert.alert("Perfil actualizado", "Tus datos han sido guardados");
      setIsEditing(false);
    } catch (e) {
      console.error("Error saving everything:", e);
      Alert.alert("Error", "No se pudo guardar el perfil. Revisa la consola.");
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length >= 3) {
      Alert.alert("Límite máximo", "Solo puedes seleccionar hasta 3 intereses.");
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const onCareerSelect = (newCareer: string) => {
    setCareer(newCareer);
    const newSem = generateSemestersForCareer(newCareer);
    setSemesters(newSem);
    setSemester(newSem[0]);
    setIsCareerOpen(false);
    setIsSemesterOpen(false);
  };

  const openImageModal = () => {
    setModalVisible(true);
  };

  const pickImage = (url: string) => {
    setImageUrl(url);
    setModalVisible(false);
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#666" }}>Cargando...</Text>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {/* CABECERA */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => (isEditing ? saveProfile() : setIsEditing(true))}
          >
            <MaterialIcons
              name={isEditing ? "check" : "edit"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            <Image source={{ uri: imageUrl }} style={styles.avatar} />
            {isEditing && (
              <TouchableOpacity
                style={styles.changeImgBtn}
                onPress={openImageModal}
              >
                <MaterialIcons name="image" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* CARRERA Y SEMESTRE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programa y Semestre Académico</Text>

          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setIsCareerOpen(!isCareerOpen)}
              >
                <Text style={{ color: "#000" }}>{career}</Text>
              </TouchableOpacity>

              {isCareerOpen &&
                carreras.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.input, { backgroundColor: "#b8b8b886" }]}
                    onPress={() => onCareerSelect(c)}
                  >
                    <Text>{c}</Text>
                  </TouchableOpacity>
                ))}

              <TouchableOpacity
                style={styles.input}
                onPress={() => setIsSemesterOpen(!isSemesterOpen)}
              >
                <Text>{semester}</Text>
              </TouchableOpacity>

              {isSemesterOpen &&
                semesters.map((sem) => (
                  <TouchableOpacity
                    key={sem}
                    style={[styles.input, { backgroundColor: "#b8b8b886" }]}
                    onPress={() => {
                      setSemester(sem);
                      setIsSemesterOpen(false);
                    }}
                  >
                    <Text>{sem}</Text>
                  </TouchableOpacity>
                ))}
            </>
          ) : (
            <Text style={styles.sectionText}>
              {career} - {semester}
            </Text>
          )}
        </View>

        {/* INTERESES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intereses</Text>

          {isEditing ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
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
                      margin: 5,
                    }}
                  >
                    <Text style={{ color: selected ? "#fff" : "#000" }}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={styles.sectionText}>
              {selectedInterests.length
                ? selectedInterests.join(", ")
                : "No has seleccionado intereses"}
            </Text>
          )}
        </View>

        {/* IMAGEN PREDETERMINADA (info) */}
        <View style={[styles.section, { alignItems: "flex-start" }]}>
          <Text style={styles.sectionTitle}>Imagen de perfil</Text>
          <Text style={[styles.sectionText, { marginBottom: 8 }]}>
            La imagen seleccionada se mostrará en tu perfil y en el panel de
            administración.
          </Text>
        </View>

        {/* SOBRE MÍ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { height: 120 }]}
              value={aboutMe}
              onChangeText={setAboutMe}
              multiline
            />
          ) : (
            <Text style={styles.sectionText}>{aboutMe}</Text>
          )}
        </View>

        {/* ESTADÍSTICAS */}
        <View style={styles.statsContainer}>
          {[
            { label: "Grupos", value: "0" },
            { label: "Intereses", value: selectedInterests.length.toString() },
            { label: "Confirmaciones", value: "0" },
          ].map((item, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL DE IMÁGENES PREDETERMINADAS */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Elige tu nueva foto</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 8 }}
            >
              {DEFAULT_IMAGES.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => pickImage(img)}
                  style={{ marginRight: 10 }}
                >
                  <Image source={{ uri: img }} style={styles.pickImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fbff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fbff",
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
  avatarContainer: {
    marginBottom: 12,
    width: 110,
    height: 110,
    borderRadius: 60,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  changeImgBtn: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#0a7cff",
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },

  name: { fontSize: 22, fontWeight: "700", color: "#fff" },
  email: { color: "#e0e0e0", marginTop: 4 },

  section: { width: "90%", marginVertical: 10 },
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
    padding: 10,
    marginVertical: 4,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginTop: 20,
    marginBottom: 40,
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

  /* modal styles */
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  pickImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  closeModal: {
    marginTop: 18,
    backgroundColor: "#E20615",
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
 