import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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

// NUEVO: Datos de ejemplo para generar notificaciones aleatorias
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
        color: "#28a745",
        bgColor: "#e8f5e9",
        borderColor: "#28a745",
        label: "Confirmación",
      };
    case "reminder":
      return {
        icon: "schedule",
        color: "#ff9800",
        bgColor: "#fff3e0",
        borderColor: "#ff9800",
        label: "Recordatorio",
      };
    case "invitation":
      return {
        icon: "mail",
        color: "#2196f3",
        bgColor: "#e3f2fd",
        borderColor: "#2196f3",
        label: "Invitación",
      };
    case "announcement":
      return {
        icon: "notifications",
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        borderColor: "#9c27b0",
        label: "Anuncio",
      };
    default:
      return {
        icon: "info",
        color: "#666",
        bgColor: "#f5f5f5",
        borderColor: "#ddd",
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

// NUEVO: Función para generar notificación aleatoria
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

  // NUEVO: Efecto para generar notificación cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = generateRandomNotification();
      setNotifications((prev) => [newNotification, ...prev]);
      
      // Opcional: mostrar alerta visual cuando llega una notificación
      Alert.alert(
        "Nueva notificación",
        newNotification.message,
        [{ text: "Aceptar", style: "default" }],
        { cancelable: false }
      );
    }, 5 * 60 * 1000); // 5 minutos en milisegundos

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    const updated = notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((notif) => notif.id !== id);
    setNotifications(updated);
    Alert.alert("Notificación eliminada", "La notificación ha sido removida.");
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
      <TouchableOpacity
        style={[
          styles.notificationCard,
          { borderLeftColor: config.borderColor, backgroundColor: config.bgColor },
          isSelected && styles.selectedCard,
        ]}
        onPress={() => {
          setSelectedNotificationId(item.id);
          markAsRead(item.id);
        }}
        delayLongPress={500}
        onLongPress={() => deleteNotification(item.id)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.headerRow}>
            <View style={styles.iconBadge}>
              <MaterialIcons name={config.icon as any} size={20} color={config.color} />
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
            >
              <MaterialIcons name="delete-outline" size={18} color="#e20613" />
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.title}>🔔 Notificaciones</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadCounter}>
                {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
              </Text>
            )}
          </View>
          {notifications.length > 0 && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <MaterialIcons
                  name="done-all"
                  size={22}
                  color={unreadCount === 0 ? "#ccc" : "#e20613"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={deleteAll}
              >
                <MaterialIcons name="delete-sweep" size={22} color="#e20613" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* LISTA DE NOTIFICACIONES */}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={60} color="#ddd" />
              <Text style={styles.noNotifications}>
                No tienes notificaciones
              </Text>
              <Text style={styles.noNotificationsSubtitle}>
                Aquí aparecerán tus actualizaciones
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafb",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafb",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#222",
    marginBottom: 4,
  },
  unreadCounter: {
    fontSize: 13,
    color: "#e20613",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  listContent: {
    paddingBottom: 30,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 5,
    overflow: "hidden",
  },
  selectedCard: {
    elevation: 4,
    shadowOpacity: 0.15,
  },
  notificationContent: {
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(226, 6, 19, 0.1)",
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e20613",
    marginLeft: 8,
  },
  message: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(226, 6, 19, 0.1)",
    marginTop: 8,
  },
  deleteButtonText: {
    marginLeft: 6,
    color: "#e20613",
    fontWeight: "600",
    fontSize: 13,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  noNotifications: {
    fontSize: 18,
    fontWeight: "700",
    color: "#999",
    marginTop: 16,
  },
  noNotificationsSubtitle: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 6,
  },
});