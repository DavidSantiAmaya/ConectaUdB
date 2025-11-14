// app/(Interface)/_layout.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Tabs } from "expo-router";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Animated,
  Platform,
} from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout(): React.ReactElement {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      <Tabs.Screen name="home" options={{ title: "Inicio" }} />
      <Tabs.Screen name="notifications" options={{ title: "Notificaciones" }} />
      <Tabs.Screen name="admin" options={{ title: "Admin" }} />
      <Tabs.Screen name="user-profile" options={{ href: null }} />
    </Tabs>
  );
}

/* -----------------------
   Helpers
----------------------- */
function getBaseRouteName(routeName: string): string {
  if (!routeName) return "";
  const clean = routeName.split("?")[0];
  const parts = clean.split("/");
  const last = parts[parts.length - 1];
  if (last === "index" && parts.length > 1) return parts[parts.length - 2];
  return last;
}

/* -----------------------
   Barra personalizada
----------------------- */
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkIfAdmin();
  }, []);

  const checkIfAdmin = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem("currentUser");
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        setIsAdmin(currentUser.isAdmin || false);
      }
    } catch (e) {
      console.error("Error checking admin:", e);
    }
  };

  const centerIndex = useMemo(
    () => state.routes.findIndex((r) => getBaseRouteName(r.name).toLowerCase() === "home"),
    [state.routes]
  );

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const isCenterFocused = state.index === centerIndex;
    Animated.spring(scaleAnim, {
      toValue: isCenterFocused ? 1.12 : 1,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [state.index, centerIndex, scaleAnim]);

  // 🔥 ORDEN FORZADO SEGÚN ROL
  const orderedRoutes = [...state.routes]
    .filter((route) => {
      const baseName = getBaseRouteName(route.name).toLowerCase();
      // Ocultar rutas que no corresponden al rol
      if (isAdmin) {
        return ["admin", "home", "notifications"].includes(baseName);
      } else {
        return ["profile", "home", "notifications"].includes(baseName);
      }
    })
    .sort((a, b) => {
      const order: Record<string, number> = isAdmin ? { admin: 0, home: 1, notifications: 2 } : { profile: 0, home: 1, notifications: 2 };

      const nameA = getBaseRouteName(a.name).toLowerCase();
      const nameB = getBaseRouteName(b.name).toLowerCase();

      const indexA = order[nameA] ?? Infinity;
      const indexB = order[nameB] ?? Infinity;
      return indexA - indexB;
    });

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.tabBarContainer}>
        {orderedRoutes.map((route) => {
          const baseName = getBaseRouteName(route.name).toLowerCase();
          const isFocused = state.index === state.routes.indexOf(route);
          const isCenter = baseName === "home";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              (navigation as any).navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          let iconName: string;
          let label: string;

          if (baseName === "profile") {
            iconName = isFocused ? "person" : "person-outline";
            label = "Perfil";
          } else if (baseName === "admin") {
            iconName = isFocused ? "shield" : "shield-outline";
            label = "Admin";
          } else if (baseName === "notifications") {
            iconName = isFocused ? "notifications" : "notifications-outline";
            label = "Notificaciones";
          } else {
            iconName = isFocused ? "home" : "home-outline";
            label = "Inicio";
          }

          return (
            <View key={route.key} style={styles.tabFlex}>
              {isCenter ? (
                <View style={styles.centerWrapper}>
                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={[styles.centerButton, isFocused && styles.centerButtonActive]}>
                      <Ionicons name={iconName as any} size={30} color={isFocused ? "#fff" : "#e20613"} />
                    </TouchableOpacity>
                  </Animated.View>
                  <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
                </View>
              ) : (
                <View style={styles.sideWrapper}>
                  <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={styles.sideButton}>
                    <Ionicons name={iconName as any} size={24} color={isFocused ? "#e20613" : "#8892A6"} />
                  </TouchableOpacity>
                  <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
                </View>
              )}
            </View>
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
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 12,
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
  tabFlex: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sideWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  centerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  centerButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#e6eefb",
    shadowColor: "#e20613",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 12,
  },
  centerButtonActive: {
    backgroundColor: "#e20613",
    borderColor: "#e20613",
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    color: "#8892A6",
  },
  labelActive: {
    color: "#e20613",
    fontWeight: "600",
  },
});
