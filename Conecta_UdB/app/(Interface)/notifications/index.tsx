import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function NotificationsScreen() {
  return (
    <View style={notifStyles.container}>
      <Text style={notifStyles.title}>🔔 Notificaciones</Text>
      <Text style={notifStyles.info}>Aquí verás las notificaciones de la app.</Text>
    </View>
  );
}

const notifStyles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "#FFF9F9" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 8, color: "#6b2b2b" },
  info: { color: "#7a6060" },
});
