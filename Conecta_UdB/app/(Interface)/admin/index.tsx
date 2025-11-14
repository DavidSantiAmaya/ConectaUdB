// app/(Interface)/admin/index.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";

interface User {
  name: string;
  email: string;
  password?: string;
  verified: boolean;
  isAdmin?: boolean;
  blocked?: boolean;
  blockedUntil?: number;
  deleted?: boolean;
}

export default function AdminScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [adminName, setAdminName] = useState("Administrador");

  // Carga inicial del adminName (mount)
  useEffect(() => {
    loadAdminInfo();
  }, []);

  // Se ejecuta cada vez que la pantalla vuelve a estar en foco
  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
      // no need to re-load admin on every focus, but safe if desired:
      loadAdminInfo();
    }, [])
  );

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

        // Filtrar: NO admin, NO eliminados
        const filteredUsers = allUsers.filter((u) => !u.isAdmin && !u.deleted);

        // Orden opcional: usuarios bloqueados primero (puedes quitar)
        filteredUsers.sort((a, b) => {
          const aBlocked = a.blocked && a.blockedUntil && a.blockedUntil > Date.now();
          const bBlocked = b.blocked && b.blockedUntil && b.blockedUntil > Date.now();
          if (aBlocked === bBlocked) return a.name.localeCompare(b.name);
          return aBlocked ? -1 : 1;
        });

        setUsers(filteredUsers);
      } else {
        setUsers([]);
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

  const logout = async () => {
    Alert.alert("Cerrar sesión", "¿Deseas salir del panel?", [
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

  const renderUser = ({ item }: { item: User }) => {
    const isBlocked =
      item.blocked && item.blockedUntil && item.blockedUntil > Date.now();

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => viewUserProfile(item)}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>

          {/* Estado verificado / no verificado */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.verified ? "#28a745" : "#ffc107" },
            ]}
          >
            <Text style={styles.statusText}>
              {item.verified ? "✓ Verificado" : "Sin verificar"}
            </Text>
          </View>

          {/* Estado bloqueado */}
          {isBlocked && (
            <Text style={styles.blockedText}>
              🚫 Usuario bloqueado hasta{" "}
              {new Date(item.blockedUntil!).toLocaleDateString()}
            </Text>
          )}
        </View>

        <MaterialIcons name="arrow-forward-ios" size={20} color="#E20613" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel de Administración</Text>
          <Text style={styles.headerSubtitle}>👤 {adminName}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <MaterialIcons name="logout" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* TOTAL USERS */}
      <View style={styles.usersInfoCard}>
        <Text style={styles.totalUsersText}>
          Usuarios visibles: {users.length}
        </Text>
      </View>

      {/* USERS LIST */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.email}
        renderItem={renderUser}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay usuarios registrados.</Text>
        }
        // refrescar manualmente con pull-to-refresh
        onRefresh={loadUsers}
        refreshing={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F8",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  /* HEADER */
  header: {
    backgroundColor: "#E20615",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#ffdddd",
    marginTop: 4,
  },

  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 10,
    borderRadius: 30,
  },

  usersInfoCard: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    elevation: 5,
    marginTop: 20,
    marginBottom: 10,
  },

  totalUsersText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  userCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  userEmail: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },

  statusBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  blockedText: {
    marginTop: 6,
    color: "#c40000",
    fontWeight: "700",
    fontSize: 13,
  },

  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 50,
    alignSelf: "center",
  },
});
