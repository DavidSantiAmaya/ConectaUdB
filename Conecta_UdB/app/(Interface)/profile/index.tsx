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
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

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
  hobby: string;
  favoriteMovie: string;
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
  const [hobby, setHobby] = useState("");
  const [favoriteMovie, setFavoriteMovie] = useState("");

  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGES[0]);
  const [modalVisible, setModalVisible] = useState(false);

  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));

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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
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
        setHobby(profile.hobby ?? "");
        setFavoriteMovie(profile.favoriteMovie ?? "");
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
      hobby,
      favoriteMovie,
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
    } else if (selectedInterests.length >= 8) {
      Alert.alert("Límite máximo", "Solo puedes seleccionar hasta 8 intereses.");
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
        <LinearGradient
          colors={["#FFFFFF", "#F7F7F7"]}
          style={styles.loadingGradient}
        >
          <Text style={styles.loadingText}>Cargando tu perfil...</Text>
        </LinearGradient>
      </View>
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
        >
          <LinearGradient
            colors={["#E63946", "#C1121F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => (isEditing ? saveProfile() : setIsEditing(true))}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <View style={styles.editButtonInner}>
                  <MaterialIcons
                    name={isEditing ? "check" : "edit"}
                    size={22}
                    color="#FFFFFF"
                  />
                </View>
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.avatarContainer}>
              <Image source={{ uri: imageUrl }} style={styles.avatar} />
              {isEditing && (
                <TouchableOpacity
                  style={styles.changeImgBtn}
                  onPress={openImageModal}
                  activeOpacity={0.7}
                >
                  <View style={styles.changeImgBtnInner}>
                    <MaterialIcons name="camera-alt" size={18} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </LinearGradient>

          <View style={styles.statsRow}>
            <View style={styles.statSmall}>
              <Text style={styles.statSmallValue}>{selectedInterests.length}</Text>
              <Text style={styles.statSmallLabel}>Intereses</Text>
            </View>
            <View style={styles.statIcon}>
              {hobby ? (
                <MaterialIcons name="sports-tennis" size={28} color="#E63946" />
              ) : (
                <MaterialIcons name="add-circle-outline" size={28} color="#CCC" />
              )}
              <Text style={styles.statIconLabel}>Hobby</Text>
            </View>
            <View style={styles.statIcon}>
              {favoriteMovie ? (
                <MaterialIcons name="movie" size={28} color="#E63946" />
              ) : (
                <MaterialIcons name="add-circle-outline" size={28} color="#CCC" />
              )}
              <Text style={styles.statIconLabel}>Película</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Programa Académico</Text>

            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setIsCareerOpen(!isCareerOpen)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.inputText}>{career}</Text>
                  <MaterialIcons
                    name="expand-more"
                    size={20}
                    color="#E63946"
                  />
                </TouchableOpacity>

                {isCareerOpen &&
                  carreras.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={styles.dropdownItem}
                      onPress={() => onCareerSelect(c)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.dropdownText}>{c}</Text>
                    </TouchableOpacity>
                  ))}

                <TouchableOpacity
                  style={[styles.input, { marginTop: 12 }]}
                  onPress={() => setIsSemesterOpen(!isSemesterOpen)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.inputText}>{semester}</Text>
                  <MaterialIcons
                    name="expand-more"
                    size={20}
                    color="#E63946"
                  />
                </TouchableOpacity>

                {isSemesterOpen &&
                  semesters.map((sem) => (
                    <TouchableOpacity
                      key={sem}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSemester(sem);
                        setIsSemesterOpen(false);
                      }}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.dropdownText}>{sem}</Text>
                    </TouchableOpacity>
                  ))}
              </>
            ) : (
              <View style={styles.displayBox}>
                <View style={styles.displayContent}>
                  <MaterialIcons name="school" size={18} color="#E63946" />
                  <Text style={styles.displayText}>
                    {career} • {semester}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intereses (Máx. 8)</Text>

            {isEditing ? (
              <View style={styles.interestGrid}>
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
                      activeOpacity={0.6}
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
                <View style={styles.displayContent}>
                  <MaterialIcons name="favorite" size={18} color="#E63946" />
                  <Text style={styles.displayText}>
                    {selectedInterests.length
                      ? selectedInterests.join(" • ")
                      : "Sin intereses seleccionados"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mi Hobby</Text>
            {isEditing ? (
              <View style={styles.textAreaWrapper}>
                <MaterialIcons
                  name="sports-tennis"
                  size={18}
                  color="#E63946"
                  style={styles.textAreaIcon}
                />
                <TextInput
                  style={styles.textAreaInput}
                  value={hobby}
                  onChangeText={setHobby}
                  placeholder="¿Cuál es tu hobby favorito?"
                  placeholderTextColor="#BBB"
                />
              </View>
            ) : (
              <View style={styles.displayBox}>
                <View style={styles.displayContent}>
                  <MaterialIcons name="sports-tennis" size={18} color="#E63946" />
                  <Text style={styles.displayText}>
                    {hobby || "Aún no has añadido tu hobby"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Película Favorita</Text>
            {isEditing ? (
              <View style={styles.textAreaWrapper}>
                <MaterialIcons
                  name="movie"
                  size={18}
                  color="#E63946"
                  style={styles.textAreaIcon}
                />
                <TextInput
                  style={styles.textAreaInput}
                  value={favoriteMovie}
                  onChangeText={setFavoriteMovie}
                  placeholder="¿Cuál es tu película favorita?"
                  placeholderTextColor="#BBB"
                />
              </View>
            ) : (
              <View style={styles.displayBox}>
                <View style={styles.displayContent}>
                  <MaterialIcons name="movie" size={18} color="#E63946" />
                  <Text style={styles.displayText}>
                    {favoriteMovie || "Aún no has añadido tu película favorita"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            {isEditing ? (
              <View style={styles.textAreaWrapper}>
                <MaterialIcons
                  name="description"
                  size={18}
                  color="#E63946"
                  style={styles.textAreaIcon}
                />
                <TextInput
                  style={styles.textAreaInput}
                  value={aboutMe}
                  onChangeText={setAboutMe}
                  multiline
                  placeholder="Cuéntanos un poco sobre ti..."
                  placeholderTextColor="#BBB"
                />
              </View>
            ) : (
              <View style={styles.displayBox}>
                <View style={styles.displayContent}>
                  <MaterialIcons name="info" size={18} color="#E63946" />
                  <Text style={styles.displayText}>
                    {aboutMe || "Aún no has completado esta sección"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Elige tu foto de perfil</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={28} color="#121212" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImageFromGallery}
              activeOpacity={0.8}
            >
              <MaterialIcons name="photo-library" size={24} color="#FFFFFF" />
              <Text style={styles.galleryButtonText}>
                Subir desde mi galería
              </Text>
            </TouchableOpacity>

            <Text style={styles.orText}>O elige una imagen predeterminada:</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {DEFAULT_IMAGES.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => pickImage(img)}
                  style={styles.pickImageContainer}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: img }} style={styles.pickImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
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
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121212",
  },

  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    width: "100%",
    shadowColor: "#E63946",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  editButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  editButtonInner: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 28,
    padding: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#121212",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarContainer: {
    marginBottom: 16,
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#121212",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  changeImgBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  changeImgBtnInner: {
    backgroundColor: "#E63946",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#121212",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  name: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  email: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "600",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginVertical: 20,
    gap: 10,
  },
  statSmall: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    shadowColor: "#121212",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statSmallValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#E63946",
  },
  statSmallLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
    marginTop: 4,
  },
  statIcon: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#121212",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statIconLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
    marginTop: 6,
  },

  section: {
    width: "88%",
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#121212",
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F0F0F0",
    shadowColor: "#121212",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  inputText: {
    color: "#121212",
    fontWeight: "700",
    fontSize: 14,
  },
  dropdownItem: {
    backgroundColor: "#F8F8F8",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#E63946",
  },
  dropdownText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
  },
  textAreaWrapper: {
    position: "relative",
    marginTop: 8,
  },
  textAreaIcon: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 5,
  },
  textAreaInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 45,
    minHeight: 100,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    fontSize: 14,
    color: "#333",
    textAlignVertical: "top",
    fontWeight: "500",
    shadowColor: "#121212",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  displayBox: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    shadowColor: "#121212",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  displayContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  displayText: {
    color: "#555",
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
    fontWeight: "500",
  },

  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  interestButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    marginBottom: 6,
    shadowColor: "#121212",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  interestButtonSelected: {
    backgroundColor: "#E63946",
    borderColor: "#E63946",
    shadowColor: "#E63946",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  interestButtonText: {
    color: "#333",
    fontWeight: "700",
    fontSize: 12,
  },
  interestButtonTextSelected: {
    color: "#FFFFFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: "85%",
    shadowColor: "#121212",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#121212",
  },
  galleryButton: {
    backgroundColor: "#E63946",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#E63946",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    gap: 10,
  },
  galleryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  orText: {
    textAlign: "center",
    color: "#999",
    marginVertical: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  imageScroll: {
    marginVertical: 10,
  },
  pickImageContainer: {
    marginRight: 10,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E63946",
    shadowColor: "#121212",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pickImage: {
    width: 100,
    height: 100,
  },
  closeModal: {
    marginTop: 16,
    backgroundColor: "#E63946",
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#E63946",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  closeText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
});
