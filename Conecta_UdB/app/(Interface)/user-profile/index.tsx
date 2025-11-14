// app/(Interface)/user-profile/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  name: string;
  email: string;
  verified: boolean;
}

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userEmail = (params.userEmail as string) || "";

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const saved = await AsyncStorage.getItem("users");
      if (saved) {
        const users: User[] = JSON.parse(saved);
        const foundUser = users.find((u) => u.email === userEmail);
        if (foundUser) setUser(foundUser);
      }
    } catch (e) {
      console.error("Error loading user data:", e);
    }
  };

  if (!user) return (<View style={styles.container}><Text>Cargando...</Text></View>);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <Image source={{ uri: "https://via.placeholder.com/100" }} style={styles.avatar} />
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={[styles.status, { color: user.verified ? "#28a745" : "#ffc107" }]}>{user.verified ? "✓ Cuenta verificada" : "⚠ Sin verificar"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        <Text style={styles.sectionText}>Este usuario está registrado en la plataforma.</Text>
        <Text style={styles.sectionText}>Solo el administrador puede ver esta información.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fbff" },
  header: { backgroundColor: "#e20615ea", alignItems: "center", paddingTop: 60, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 6, width: "100%" },
  backButton: { position: "absolute", top: 40, left: 20, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 20, padding: 6, zIndex: 10 },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#fff" },
  name: { fontSize: 22, fontWeight: "700", color: "#fff" },
  email: { color: "#e0e0e0", marginTop: 4 },
  status: { marginTop: 8, fontSize: 14, fontWeight: "600" },
  section: { width: "90%", marginVertical: 20, alignSelf: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 10 },
  sectionText: { color: "#00000086", lineHeight: 20, marginBottom: 8 },
});
