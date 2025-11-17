import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Notification {
  id: string;
  message: string;
  date: string;
  read: boolean;
  type: "confirmation" | "reminder" | "invitation" | "announcement";
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    message: "Confirmaste tu asistencia al evento de Juan Pérez",
    date: "2025-11-08 10:00",
    read: false,
    type: "confirmation",
  },
  {
    id: "2",
    message: "Recordatorio: Evento de Ana Gómez en 2 horas",
    date: "2025-11-07 15:30",
    read: false,
    type: "reminder",
  },
  {
    id: "3",
    message: "Nueva invitación: Únete al evento de Luis Martínez",
    date: "2025-11-06 12:45",
    read: true,
    type: "invitation",
  },
  {
    id: "4",
    message: "Anuncio: Cambios de horario para el evento de Sofía Hernández",
    date: "2025-11-05 08:00",
    read: true,
    type: "announcement",
  },
];

const sampleMessages = {
  confirmation: [
    "Confirmaste tu asistencia al evento de Juan Pérez",
    "Confirmaste tu asistencia al evento de Ana Gómez",
    "Confirmaste tu asistencia al evento de Luis Martínez",
    "Confirmaste tu asistencia al evento de María Rodríguez",
    "Confirmaste tu asistencia al evento de Carlos López",
  ],
  reminder: [
    "Recordatorio: Evento de Ana Gómez en 2 horas",
    "Recordatorio: Evento de Luis Martínez en 1 hora",
    "Recordatorio: Evento de Sofía Hernández mañana",
    "Recordatorio: Charla de tecnología en 30 minutos",
    "Recordatorio: Taller de programación en 3 horas",
  ],
  invitation: [
    "Nueva invitación: Únete al evento de Luis Martínez",
    "Nueva invitación: Charla sobre Animación",
    "Nueva invitación: Taller de Diseño Gráfico",
    "Nueva invitación: Evento de Música y Cine",
    "Nueva invitación: Conferencia de Tecnología",
  ],
  announcement: [
    "Anuncio: Cambios de horario para el evento de Sofía Hernández",
    "Anuncio: Nuevo evento disponible - Charla de Arte",
    "Anuncio: Actualización en ubicación del evento",
    "Anuncio: Ampliación de capacidad en evento",
    "Anuncio: Cancelación de evento por causa mayor",
  ],
};

const types: Array<"confirmation" | "reminder" | "invitation" | "announcement"> = [
  "confirmation",
  "reminder",
  "invitation",
  "announcement",
];

const getNotificationConfig = (type: string) => {
  switch (type) {
    case "confirmation":
      return {
        icon: "check-circle",
        color: "#E63946",
        bgColor: "#FFEBEE",
        borderColor: "#E63946",
        label: "Confirmación",
      };
    case "reminder":
      return {
        icon: "schedule",
        color: "#E63946",
        bgColor: "#FFEBEE",
        borderColor: "#E63946",
        label: "Recordatorio",
      };
    case "invitation":
      return {
        icon: "mail",
        color: "#E63946",
        bgColor: "#FFEBEE",
        borderColor: "#E63946",
        label: "Invitación",
      };
    case "announcement":
      return {
        icon: "notifications",
        color: "#E63946",
        bgColor: "#FFEBEE",
        borderColor: "#E63946",
        label: "Anuncio",
      };
    default:
      return {
        icon: "info",
        color: "#666",
        bgColor: "#F5F5F5",
        borderColor: "#DDD",
        label: "Notificación",
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Hace unos segundos";
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString("es-ES");
};

const generateRandomNotification = (): Notification => {
  const randomType = types[Math.floor(Math.random() * types.length)];
  const messages = sampleMessages[randomType];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  const now = new Date();
  const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(
    2,
    "0"
  )}:${String(now.getMinutes()).padStart(2, "0")}`;

  return {
    id: Date.now().toString(),
    message: randomMessage,
    date: dateString,
    read: false,
    type: randomType,
  };
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications
  );
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = generateRandomNotification();
      setNotifications((prev) => [newNotification, ...prev]);

      Alert.alert(
        "Nueva notificación",
        newNotification.message,
        [{ text: "Aceptar", style: "default" }],
        { cancelable: false }
      );
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    const updated = notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    const updated = notifications.filter((notif) => notif.id !== id);
    setNotifications(updated);
    setSelectedNotificationId(null);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));
    setNotifications(updated);
    Alert.alert("Éxito", "Todas las notificaciones marcadas como leídas.");
  };

  const deleteAll = () => {
    Alert.alert(
      "Eliminar todas",
      "¿Estás seguro de que deseas eliminar todas las notificaciones?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setNotifications([]);
            Alert.alert("Éxito", "Todas las notificaciones han sido eliminadas.");
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = getNotificationConfig(item.type);
    const isSelected = selectedNotificationId === item.id;

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.notificationCard,
            { borderLeftColor: config.borderColor },
            isSelected && styles.selectedCard,
          ]}
          onPress={() => {
            setSelectedNotificationId(item.id);
            markAsRead(item.id);
            Animated.timing(scaleAnim, {
              toValue: 1.02,
              duration: 100,
              useNativeDriver: true,
            }).start(() => {
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }).start();
            });
          }}
          delayLongPress={500}
          onLongPress={() => deleteNotification(item.id)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[config.bgColor, "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.notificationGradient}
          >
            <View style={styles.notificationContent}>
              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: "rgba(230, 57, 70, 0.15)" },
                  ]}
                >
                  <MaterialIcons
                    name={config.icon as any}
                    size={22}
                    color={config.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.typeLabel}>{config.label}</Text>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </View>

              <Text style={styles.message}>{item.message}</Text>

              {isSelected && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteNotification(item.id)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="delete-outline" size={16} color="#E63946" />
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={["#FFFFFF", "#F7F7F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.title}>Notificaciones</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCounter}>
                    {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
                  </Text>
                </View>
              )}
            </View>
            {notifications.length > 0 && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    unreadCount === 0 && styles.iconButtonDisabled,
                  ]}
                  onPress={markAllAsRead}
                  disabled={unreadCount === 0}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="done-all"
                    size={22}
                    color={unreadCount === 0 ? "#CCC" : "#E63946"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={deleteAll}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="delete-sweep" size={22} color="#E63946" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={60} color="#DDD" />
              <Text style={styles.noNotifications}>
                No tienes notificaciones
              </Text>
              <Text style={styles.noNotificationsSubtitle}>
                Aquí aparecerán tus actualizaciones
              </Text>
            </View>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#E63946",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#121212",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  unreadBadge: {
    backgroundColor: "#E63946",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  unreadCounter: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 12,
    shadowColor: "#121212",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 30,
  },
  notificationCard: {
    marginVertical: 10,
    borderRadius: 18,
    overflow: "hidden",
    borderLeftWidth: 6,
    shadowColor: "#121212",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  selectedCard: {
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
  },
  notificationGradient: {
    padding: 0,
  },
  notificationContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#121212",
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  dateText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E63946",
    marginLeft: 10,
    shadowColor: "#E63946",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  message: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(230, 57, 70, 0.1)",
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: "rgba(230, 57, 70, 0.2)",
  },
  deleteButtonText: {
    marginLeft: 6,
    color: "#E63946",
    fontWeight: "700",
    fontSize: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  noNotifications: {
    fontSize: 18,
    fontWeight: "800",
    color: "#121212",
    marginTop: 16,
    marginBottom: 6,
  },
  noNotificationsSubtitle: {
    fontSize: 13,
    color: "#999",
    fontWeight: "600",
  },
});