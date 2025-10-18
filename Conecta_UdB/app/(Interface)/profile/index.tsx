import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={profileStyles.container}>
      <Image
        source={{ uri: "https://placehold.co/100x100/0b5fff/ffffff?text=U" }}
        style={profileStyles.avatar}
      />
      <Text style={profileStyles.name}>Nombre de Usuario</Text>
      <Text style={profileStyles.email}>usuario@uniboyaca.edu.co</Text>
    </View>
  );
}

const profileStyles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "#FFFDF7" },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: "700", color: "#2b2b2b" },
  email: { color: "#6b6b6b", marginTop: 6 },
});