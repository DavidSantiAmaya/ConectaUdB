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
import * as ImagePicker from "expo-image-picker";

const PROFILE_KEY = "@conectaudb_profile";
const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

const DEFAULT_IMAGES = [
  "https://i.pinimg.com/564x/7a/79/ac/7a79ac0cdd39e39d9b1ee8360341d49b.jpg",
  "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
  "https://images.pexels.com/photos/4587995/pexels-photo-4587995.jpeg",
  "https://images.pexels.com/photos/1548665/pexels-photo-1548665.jpeg",
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
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos necesarios",
        "Se requieren permisos para acceder a tu galería de fotos."
      );
    }
  };

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

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets ? result.assets[0].uri : result.uri;
        setImageUrl(uri);
        setModalVisible(false);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo cargar la imagen de tu galería.");
    }
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
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
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
                <MaterialIcons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* CARRERA Y SEMESTRE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Programa Académico</Text>

          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setIsCareerOpen(!isCareerOpen)}
              >
                <Text style={{ color: "#000", fontWeight: "600" }}>{career}</Text>
                <MaterialIcons name="expand-more" size={20} color="#e20613" />
              </TouchableOpacity>

              {isCareerOpen &&
                carreras.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.input, styles.dropdownItem]}
                    onPress={() => onCareerSelect(c)}
                  >
                    <Text style={{ color: "#000" }}>{c}</Text>
                  </TouchableOpacity>
                ))}

              <TouchableOpacity
                style={[styles.input, { marginTop: 12 }]}
                onPress={() => setIsSemesterOpen(!isSemesterOpen)}
              >
                <Text style={{ color: "#000", fontWeight: "600" }}>{semester}</Text>
                <MaterialIcons name="expand-more" size={20} color="#e20613" />
              </TouchableOpacity>

              {isSemesterOpen &&
                semesters.map((sem) => (
                  <TouchableOpacity
                    key={sem}
                    style={[styles.input, styles.dropdownItem]}
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
            <View style={styles.displayBox}>
              <Text style={styles.displayText}>
                {career} • {semester}
              </Text>
            </View>
          )}
        </View>

        {/* INTERESES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Intereses</Text>

          {isEditing ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
              {allInterests.map((interest) => {
                const selected = selectedInterests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    style={[
                      styles.interestButton,
                      selected && styles.interestButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.interestButtonText,
                        selected && styles.interestButtonTextSelected,
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.displayBox}>
              <Text style={styles.displayText}>
                {selectedInterests.length
                  ? selectedInterests.join(" • ")
                  : "Sin intereses seleccionados"}
              </Text>
            </View>
          )}
        </View>

        {/* SOBRE MÍ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Sobre mí</Text>
          {isEditing ? (
            <TextInput
              style={styles.textAreaInput}
              value={aboutMe}
              onChangeText={setAboutMe}
              multiline
              placeholder="Cuéntanos un poco sobre ti..."
              placeholderTextColor="#999"
            />
          ) : (
            <View style={styles.displayBox}>
              <Text style={styles.displayText}>
                {aboutMe || "Aún no has completado esta sección"}
              </Text>
            </View>
          )}
        </View>

        {/* ESTADÍSTICAS - SOLO INTERESES */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{selectedInterests.length}</Text>
            <Text style={styles.statLabel}>Intereses</Text>
          </View>
        </View>
      </ScrollView>

      {/* MODAL DE IMÁGENES */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Elige tu foto de perfil</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Botón para abrir galería */}
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImageFromGallery}
            >
              <MaterialIcons name="photo-library" size={24} color="#fff" />
              <Text style={styles.galleryButtonText}>Subir desde mi galería</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>O elige una imagen predeterminada:</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 16 }}
            >
              {DEFAULT_IMAGES.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => pickImage(img)}
                  style={{ marginRight: 12 }}
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
  container: { flex: 1, backgroundColor: "#f8fafb" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafb",
  },

  header: {
    backgroundColor: "#e20615",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 8,
    width: "100%",
    shadowColor: "#e20615",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  editButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#e20613",
    borderRadius: 24,
    padding: 10,
    elevation: 6,
    zIndex: 10,
  },
  avatarContainer: {
    marginBottom: 16,
    width: 130,
    height: 130,
    borderRadius: 70,
    overflow: "hidden",
    elevation: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#fff",
  },
  changeImgBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#e20613",
    padding: 10,
    borderRadius: 24,
    elevation: 6,
  },

  name: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 4 },
  email: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "500" },

  section: { width: "90%", marginVertical: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
    marginBottom: 10,
  },
  sectionText: { color: "#666", lineHeight: 22, fontSize: 15 },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
  },
  dropdownItem: {
    backgroundColor: "#f5f5f5",
    marginVertical: 6,
  },
  textAreaInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 15,
    color: "#333",
    textAlignVertical: "top",
  },
  displayBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  displayText: { color: "#555", fontSize: 15, lineHeight: 22 },

  interestButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
    margin: 6,
    borderWidth: 1.5,
    borderColor: "#ddd",
  },
  interestButtonSelected: {
    backgroundColor: "#e20613",
    borderColor: "#e20613",
  },
  interestButtonText: { color: "#333", fontWeight: "600", fontSize: 13 },
  interestButtonTextSelected: { color: "#fff" },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    marginTop: 28,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statValue: { fontSize: 28, fontWeight: "800", color: "#e20613" },
  statLabel: { color: "#666", marginTop: 6, fontSize: 14, fontWeight: "600" },

  /* Modal styles */
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },
  galleryButton: {
    backgroundColor: "#e20613",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 3,
  },
  galleryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 10,
  },
  orText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  pickImage: {
    width: 110,
    height: 110,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e20613",
  },
  closeModal: {
    marginTop: 16,
    backgroundColor: "#e20613",
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
  },
  closeText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});