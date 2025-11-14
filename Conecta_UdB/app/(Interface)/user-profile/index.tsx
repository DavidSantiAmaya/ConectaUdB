import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  name: string;
  email: string;
  verified: boolean;
  blocked?: boolean;
  blockedUntil?: number;
  // profileImage removed on purpose
}

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userEmail = (params.userEmail as string) || "";

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const loadUserData = async () => {
    try {
      const saved = await AsyncStorage.getItem("users");
      if (saved) {
        const users: User[] = JSON.parse(saved);
        const foundUser = users.find((u) => u.email === userEmail);
        console.log("USER LOADED:", foundUser);
        if (foundUser) setUser(foundUser);
      }
    } catch (e) {
      console.error("Error loading user data:", e);
    }
  };

  // Toggle verification (verify / unverify)
  const toggleVerified = async () => {
    if (!user) return;

    const willVerify = !user.verified;
    const title = willVerify ? "Verificar usuario" : "Quitar verificación";
    const message = willVerify
      ? "¿Deseas verificar este usuario? Esto marcará su cuenta como verificada."
      : "¿Deseas quitar la verificación de este usuario?";

    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      {
        text: willVerify ? "Verificar" : "Quitar",
        style: "default",
        onPress: async () => {
          try {
            const saved = await AsyncStorage.getItem("users");
            if (!saved) return;

            const users: User[] = JSON.parse(saved);
            const updatedUsers = users.map((u) =>
              u.email === userEmail ? { ...u, verified: willVerify } : u
            );

            await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));

            // También actualizar currentUser si coincide (por seguridad)
            const currentUserJson = await AsyncStorage.getItem("currentUser");
            if (currentUserJson) {
              try {
                const currentUser = JSON.parse(currentUserJson) as User;
                if (currentUser.email === userEmail) {
                  const updatedCurrent = { ...currentUser, verified: willVerify };
                  await AsyncStorage.setItem(
                    "currentUser",
                    JSON.stringify(updatedCurrent)
                  );
                }
              } catch (e) {
                console.error("Error actualizando currentUser:", e);
              }
            }

            // Actualizar estado local
            setUser(updatedUsers.find((u) => u.email === userEmail) || null);
          } catch (e) {
            console.error("Error toggling verified:", e);
            Alert.alert("Error", "No se pudo actualizar el estado. Revisa la consola.");
          }
        },
      },
    ]);
  };

  const blockUser = async () => {
    Alert.alert(
      "Bloquear usuario",
      "¿Seguro que deseas bloquear este usuario por 1 año?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Bloquear",
          style: "destructive",
          onPress: async () => {
            try {
              const saved = await AsyncStorage.getItem("users");
              if (!saved) return;

              const users: User[] = JSON.parse(saved);
              const updatedUsers = users.map((u) =>
                u.email === userEmail
                  ? {
                      ...u,
                      blocked: true,
                      blockedUntil: Date.now() + 365 * 24 * 60 * 60 * 1000,
                    }
                  : u
              );

              await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));
              setUser(updatedUsers.find((u) => u.email === userEmail) || null);
            } catch (e) {
              console.error("Error blocking user:", e);
            }
          },
        },
      ]
    );
  };

  const unblockUser = async () => {
    Alert.alert(
      "Desbloquear usuario",
      "¿Quieres desbloquear este usuario de manera provisional?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desbloquear",
          onPress: async () => {
            try {
              const saved = await AsyncStorage.getItem("users");
              if (!saved) return;

              const users: User[] = JSON.parse(saved);

              const updatedUsers = users.map((u) =>
                u.email === userEmail ? { ...u, blocked: false, blockedUntil: 0 } : u
              );

              await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));
              setUser(updatedUsers.find((u) => u.email === userEmail) || null);
            } catch (e) {
              console.error("Error unblocking user:", e);
            }
          },
        },
      ]
    );
  };

  const deleteUser = async () => {
    Alert.alert(
      "Eliminar usuario",
      "¿Seguro que deseas eliminar esta cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const saved = await AsyncStorage.getItem("users");
              if (!saved) return;

              const users: User[] = JSON.parse(saved);
              const updatedUsers = users.filter((u) => u.email !== userEmail);

              await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));

              await AsyncStorage.setItem(
                "accountDeletedMessage",
                "Tu cuenta fue eliminada por un administrador."
              );

              router.back();
            } catch (e) {
              console.error("Error deleting user:", e);
            }
          },
        },
      ]
    );
  };

  if (!user)
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#666" }}>Cargando...</Text>
      </View>
    );

  const isBlocked =
    user.blocked && user.blockedUntil && user.blockedUntil > Date.now();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Aviso: ya no mostramos imagen. Se deja un ícono placeholder */}
        <View style={styles.avatarWrapper}>
          <MaterialIcons name="person" size={72} color="#fff" />
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        {/* Badge de estado (sigue mostrando texto) */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: user.verified ? "#28a745" : "#ffc107" },
          ]}
        >
          <Text style={styles.statusText}>
            {user.verified ? "✓ Verificado" : "Sin verificar"}
          </Text>
        </View>

        {isBlocked && (
          <View style={[styles.statusBadge, { backgroundColor: "#d9534f" }]}>
            <Text style={styles.statusText}>
              Cuenta bloqueada hasta: {new Date(user.blockedUntil!).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* ACCIONES DEL ADMIN */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Acciones del Administrador</Text>
        <View style={styles.cardDivider} />

        {/* Botón de verificar / desverificar */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: user.verified ? "#6c757d" : "#28a745" },
          ]}
          onPress={toggleVerified}
        >
          <MaterialIcons
            name={user.verified ? "highlight-off" : "check-circle"}
            size={22}
            color="#fff"
          />
          <Text style={styles.actionText}>
            {user.verified ? "Quitar verificación" : "Verificar usuario"}
          </Text>
        </TouchableOpacity>

        {!isBlocked && (
          <TouchableOpacity style={styles.actionBtn} onPress={blockUser}>
            <MaterialIcons name="block" size={22} color="#fff" />
            <Text style={styles.actionText}>Bloquear usuario (1 año)</Text>
          </TouchableOpacity>
        )}

        {isBlocked && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#0a7cff" }]}
            onPress={unblockUser}
          >
            <MaterialIcons name="lock-open" size={22} color="#fff" />
            <Text style={styles.actionText}>Desbloquear usuario</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#c40000" }]}
          onPress={deleteUser}
        >
          <MaterialIcons name="delete" size={22} color="#fff" />
          <Text style={styles.actionText}>Eliminar usuario</Text>
        </TouchableOpacity>
      </View>

      {/* INFORMACIÓN */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información del Usuario</Text>
        <View style={styles.cardDivider} />

        <Text style={styles.cardText}>
          Este usuario está registrado dentro de la plataforma.
        </Text>
        <Text style={styles.cardText}>Solo el administrador puede ver esta información.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f8" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f8",
  },

  header: {
    backgroundColor: "#E20615",
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 10,
    marginBottom: 20,
  },

  backButton: {
    position: "absolute",
    top: 45,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 30,
    padding: 8,
  },

  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },

  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginTop: 10,
  },

  email: {
    fontSize: 14,
    color: "#ffeeee",
    marginBottom: 10,
  },

  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 8,
  },

  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  card: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    marginBottom: 30,
  },

  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1d1d1d" },

  cardDivider: {
    height: 1.5,
    backgroundColor: "#e3e3e3",
    marginVertical: 10,
  },

  cardText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
    lineHeight: 22,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E20615",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
  },

  actionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 10,
  },
});
