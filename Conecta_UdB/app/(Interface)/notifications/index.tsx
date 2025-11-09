import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

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
    message: "Confirmaste tu asistencia al evento de Juan Pérez (Animación y Arte)",
    date: "2025-11-08 10:00",
    read: false,
    type: "confirmation",
  },
  {
    id: "2",
    message: "Recordatorio: Evento  de Ana Gómez (Tecnología y Programación)",
    date: "2025-11-07 15:30",
    read: false,
    type: "reminder",
  },
  {
    id: "3",
    message: "Nueva invitación: Únete al evento de Luis Martínez (Música y Cine)",
    date: "2025-11-06 12:45",
    read: true,
    type: "invitation",
  },
  {
    id: "4",
    message: "Anuncio: Cambios de horarario para el evento de Sofía Hernández (Moda y Videojuegos)",
    date: "2025-11-05 08:00",
    read: true,
    type: "announcement",
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAsRead = (id: string) => {
    const updated = notifications.map((notif) =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, item.read ? styles.read : styles.unread]}
      onPress={() => markAsRead(item.id)}
    >
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Notificaciones</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={styles.noNotifications}>No tienes notificaciones nuevas.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFF9F9", 
    padding: 20 
  },
  title: { 
    fontSize: 26, 
    fontWeight: "700", 
    marginBottom: 12, 
    color: "#6b2b2b" 
  },
  notificationCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  unread: {
    borderLeftWidth: 6,
    borderLeftColor: "#e20613",
  },
  read: {
    opacity: 0.6,
  },
  message: {
    fontSize: 16,
    color: "#4a2f2f",
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: "#a08c8c",
  },
  noNotifications: {
    fontSize: 16,
    color: "#a08c8c",
    marginTop: 50,
    alignSelf: "center",
  },
});
