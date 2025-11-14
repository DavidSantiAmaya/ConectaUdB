// app/(Interface)/admin/index.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

interface User {
  name: string;
  email: string;
  password?: string;
  verified: boolean;
  isAdmin?: boolean;
}

export default function AdminScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [adminName, setAdminName] = useState("Administrador");

  useEffect(() => {
    loadUsers();
    loadAdminInfo();
  }, []);

  const loadAdminInfo = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem("currentUser");
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        setAdminName(currentUser.name || "Administrador");
      }
    } catch (e) {
      console.error("Error loading admin info:", e);
    }
  };

  const loadUsers = async () => {
    try {
      const saved = await AsyncStorage.getItem("users");
      if (saved) {
        const allUsers: User[] = JSON.parse(saved);
        // Mostrar todos excepto administradores
        const normalUsers = allUsers.filter((u) => !u.isAdmin);
        setUsers(normalUsers);
      }
    } catch (e) {
      console.error("Error loading users:", e);
    }
  };

  const viewUserProfile = (user: User) => {
  router.push({
    pathname: "/(Interface)/user-profile",
    params: { userEmail: user.email },
  });
};


  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => viewUserProfile(item)}>
      <View>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={[styles.userStatus, { color: item.verified ? "#28a745" : "#ffc107" }]}>{item.verified ? "✓ Verificado" : "⚠ Sin verificar"}</Text>
      </View>
      <MaterialIcons name="arrow-forward-ios" size={20} color="#e20613" />
    </TouchableOpacity>
  );

  const logout = async () => {
    Alert.alert("Cerrar sesión", "¿Deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        onPress: async () => {
          await AsyncStorage.removeItem("currentUser");
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Admin: {adminName}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Total de usuarios registrados: {users.length}</Text>

      <FlatList data={users} keyExtractor={(item) => item.email} renderItem={renderUser} contentContainerStyle={{ paddingBottom: 30 }} ListEmptyComponent={<Text style={styles.emptyText}>No hay usuarios registrados.</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fbff", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#e20613" },
  logoutButton: { backgroundColor: "#e20613", padding: 8, borderRadius: 20 },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 16 },
  userCard: { backgroundColor: "#fff", padding: 15, marginBottom: 12, borderRadius: 10, elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userName: { fontSize: 18, fontWeight: "700", color: "#222" },
  userEmail: { fontSize: 14, color: "#666", marginTop: 4 },
  userStatus: { fontSize: 12, marginTop: 6, fontWeight: "600" },
  emptyText: { fontSize: 16, color: "#999", alignSelf: "center", marginTop: 50 },
});
