import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={homeStyles.container}>
      <Text style={homeStyles.title}>🏠 Home</Text>
      <Text style={homeStyles.subtitle}>Pantalla principal — contenido aquí</Text>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "#F7FAFF" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8, color: "#0b2f66" },
  subtitle: { color: "#56637a", fontSize: 16 },
});