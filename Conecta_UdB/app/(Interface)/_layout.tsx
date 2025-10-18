import React from "react";
import { Tabs } from "expo-router";
import { StyleSheet, View, TouchableOpacity, Text, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ corrección

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="home" />
      <Tabs.Screen name="notifications" />
    </Tabs>
  );
}

/* -----------------------
   Componente CustomTabBar
   ----------------------- */
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
         });

        if (!isFocused && !event.defaultPrevented) {
             navigation.navigate(route.name as never);
            }
        };


          let iconName = "home-outline";
          if (route.name === "profile") iconName = "person-outline";
          if (route.name === "notifications") iconName = "notifications-outline";

          const isCenter = route.name === "home";

          return (
  <TouchableOpacity
    key={route.key}
    onPress={onPress}
    activeOpacity={0.8}
    style={styles.tabButtonWrapper}
  >
    {isCenter ? (
      // Botón central (Home)
      <View style={[styles.centerButton, isFocused && styles.centerButtonActive]}>
        <Ionicons
          name={isFocused ? "home" : "home-outline"}
          size={28}
          color={isFocused ? "#fff" : "#0b5fff"}
        />
      </View>
    ) : (
      // Botones laterales (Perfil, Notificaciones)
      <View style={styles.sideButton}>
        <Ionicons
          name={
            route.name === "profile"
              ? isFocused
                ? "person"
                : "person-outline"
              : isFocused
              ? "notifications"
              : "notifications-outline"
          }
          size={22}
          color={isFocused ? "#0b5fff" : "#8892A6"}
        />
      </View>
    )}
    {/* Etiqueta del botón */}
    <Text style={[styles.label, isFocused && styles.labelActive]}>
      {route.name === "home"
        ? "Home"
        : route.name === "profile"
        ? "Perfil"
        : "Notifs"}
    </Text>
  </TouchableOpacity>
);

        })}
      </View>
    </SafeAreaView>
  );
}

/* -----------------------
   Estilos
   ----------------------- */
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
  },
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "android" ? 14 : 18,
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
    elevation: 8,
  },
  tabButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 90,
  },
  sideButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    marginBottom: 12,
    width: 76,
    height: 76,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#e6eefb",
    shadowColor: "#0b5fff",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 10,
  },
  centerButtonActive: {
    backgroundColor: "#0b5fff",
    borderColor: "#0b5fff",
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    color: "#8892A6",
  },
  labelActive: {
    color: "#0b5fff",
    fontWeight: "600",
  },
});