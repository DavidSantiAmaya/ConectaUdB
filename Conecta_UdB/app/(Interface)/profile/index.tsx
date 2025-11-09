import React, { useState } from "react";
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

export default function ProfileScreen() {
  // Estados para edición y campos
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("David Santiago");
  const [email, setEmail] = useState("david@uniboyaca.edu.co");

  // Estado para mostrar/ocultar acordeón de carreras y semestres
  const [isCareerOpen, setIsCareerOpen] = useState(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);

  // Listas de opciones
  const carreras = [
    "Medicina",
    "Enfermería",
    "Bacteriología y Laboratorio Clínico",
    "Terapia Respiratoria",
    "Fisioterapia",
    "Ingeniería Sanitaria",
    "Ingeniería Ambiental",
    "Ingeniería Industrial",
    "Ingeniería Civil",
    "Ingeniería en Multimedia",
    "Ingeniería de Sistemas",
    "Ingeniería Mecatrónica",
    "Psicología",
    "Licenciatura en Educación Infantil",
    "Diseño Gráfico",
    "Arquitectura",
    "Comunicación Social",
    "Derecho y Ciencias Políticas",
    "Administración de Negocios Internacionales",
    "Administración de Empresas",
    "Contaduría Pública",
  ];
  const semesters = [
    "Primer Semestre",
    "Segundo Semestre",
    "Tercer Semestre",
    "Cuarto Semestre",
    "Quinto Semestre",
    "Sexto Semestre",
    "Séptimo Semestre",
    "Octavo Semestre",
    "Noveno Semestre",
    "Décimo Semestre",
    "Undécimo Semestre",
    "Duodécimo Semestre"
  ];

  const [career, setCareer] = useState("Ingeniería en Multimedia");
  const [semester, setSemester] = useState("Sexto Semestre");
  const [interests, setInterests] = useState("Animación, Narrativas Digitales, Arte");
  const [aboutMe, setAboutMe] = useState(
    "Soy un apasionado por la animación y las narrativas digitales. Me gusta crear, aprender y compartir con otros artistas."
  );

  const saveProfile = () => {
    Alert.alert("Perfil actualizado", "Tus datos han sido guardados");
    setIsEditing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: "center" }}
    >
      {/* Header con avatar e iconos */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => (isEditing ? saveProfile() : setIsEditing(true))}
        >
          <MaterialIcons name={isEditing ? "check" : "edit"} size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: "https://placehold.co/100x100/0b5fff/ffffff?text=U" }}
            style={styles.avatar}
          />
          {isEditing && (
            <TouchableOpacity style={styles.addPhotoButton}>
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre completo"
              placeholderTextColor="#eee"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Correo institucional"
              keyboardType="email-address"
              placeholderTextColor="#eee"
            />
          </>
        ) : (
          <>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </>
        )}
      </View>

      {/* Programa y Semestre Académico con acordeones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Programa y Semestre Académico</Text>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setIsCareerOpen(!isCareerOpen)}
            >
              <Text style={{ color: "#fff" }}>{career}</Text>
            </TouchableOpacity>

            {isCareerOpen &&
              carreras.map((carrera) => (
                <TouchableOpacity
                  key={carrera}
                  style={[styles.input, { backgroundColor: "#0a4af7", marginVertical: 2 }]}
                  onPress={() => {
                    setCareer(carrera);
                    setIsCareerOpen(false);
                  }}
                >
                  <Text style={{ color: "#fff" }}>{carrera}</Text>
                </TouchableOpacity>
              ))}

            <TouchableOpacity
              style={styles.input}
              onPress={() => setIsSemesterOpen(!isSemesterOpen)}
            >
              <Text style={{ color: "#fff" }}>{semester}</Text>
            </TouchableOpacity>

            {isSemesterOpen &&
              semesters.map((sem) => (
                <TouchableOpacity
                  key={sem}
                  style={[styles.input, { backgroundColor: "#0a4af7", marginVertical: 2 }]}
                  onPress={() => {
                    setSemester(sem);
                    setIsSemesterOpen(false);
                  }}
                >
                  <Text style={{ color: "#fff" }}>{sem}</Text>
                </TouchableOpacity>
              ))}
          </>
        ) : (
          <Text style={styles.sectionText}>
            {career} - {semester}
          </Text>
        )}
      </View>

      {/* Intereses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intereses</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, { height: 60 }]}
            value={interests}
            onChangeText={setInterests}
            placeholder="Escribe tus intereses"
            multiline
          />
        ) : (
          <Text style={styles.sectionText}>{interests}</Text>
        )}
      </View>

      {/* Sobre mí */}
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

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        {[
          { label: "Grupos", value: "0" },
          { label: "Intereses", value: "5" },
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
  container: { flex: 1, backgroundColor: "#f9fbff" },
  header: {
    backgroundColor: "#0b5fff",
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
  sectionText: { color: "#555", lineHeight: 20 },
  input: {
    backgroundColor: "#0b5fff88",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#fff",
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
  statValue: { fontSize: 20, fontWeight: "700", color: "#0b5fff" },
  statLabel: { color: "#555", marginTop: 4, fontSize: 13 },
});
