import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* 🔹 Encabezado con fondo degradado */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.editButton}>
          <MaterialIcons name="settings" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: "https://placehold.co/100x100/0b5fff/ffffff?text=U" }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.addPhotoButton}>
            <MaterialIcons name="photo-camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>David Santiago</Text>
        <Text style={styles.email}>david@uniboyaca.edu.co</Text>
      </View>

      {/* 🔹 Estadísticas */}
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

      {/* 🔹 Sección “Sobre mí” */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre mí</Text>
        <Text style={styles.sectionText}>
          Soy un apasionado por la animación y las narrativas digitales. Me
          gusta crear, aprender y compartir con otros artistas.
        </Text>
      </View>
    </View>
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
  },
  editButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    padding: 6,
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
  location: { color: "#fff", marginTop: 4, fontSize: 13 },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 10,
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

  section: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  sectionText: { color: "#555", lineHeight: 20 },
});