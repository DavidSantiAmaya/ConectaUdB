// app/_layout.tsx
import React, { useEffect, useMemo, useRef } from "react";
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

/**
 * RootLayout principal para Expo Router
 * - Define 3 pestañas: profile, home, notifications
 * - Usa CustomTabBar para la barra inferior personalizada
 */
export default function RootLayout(): React.ReactElement {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
    >
      {/* Asegúrate de tener archivos: app/profile.tsx, app/home.tsx, app/notifications.tsx */}
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="home" />
      <Tabs.Screen name="notifications" />
    </Tabs>
  );
}

/* -----------------------
   Helpers
   ----------------------- */
/**
 * Extrae la "base" del nombre de ruta que entrega expo-router.
 * Ejemplos:
 *  - "home" -> "home"
 *  - "(tabs)/home" -> "home"
 *  - "home/index" -> "index" (por eso hacemos pop y luego normalizamos)
 */
function getBaseRouteName(routeName: string): string {
  if (!routeName) return "";
  // eliminar query params después de '?'
  const clean = routeName.split("?")[0];
  // tomar el último segmento después de '/'
  const parts = clean.split("/");
  const last = parts[parts.length - 1];
  // si el último es 'index' y hay un penúltimo, preferimos el penúltimo
  if (last === "index" && parts.length > 1) return parts[parts.length - 2];
  return last;
}

/* -----------------------
   Barra personalizada
   ----------------------- */
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Índice de la pestaña que corresponde a "home"
  const centerIndex = useMemo(
    () => state.routes.findIndex((r) => getBaseRouteName(r.name).toLowerCase() === "home"),
    [state.routes]
  );

  // Animación (scale) para el botón central
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animar cuando la pestaña central está activa
  useEffect(() => {
    const isCenterFocused = state.index === centerIndex;
    Animated.spring(scaleAnim, {
      toValue: isCenterFocused ? 1.12 : 1,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [state.index, centerIndex, scaleAnim]);

  // Renderizado de botones
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const baseName = getBaseRouteName(route.name).toLowerCase();
          const isFocused = state.index === index;
          const isCenter = index === centerIndex;

          // Evento de press estándar
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              // cast a any para compatibilidad con expo-router
              (navigation as any).navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          // Mapear iconos de forma explícita por baseName
          let iconName: string;
          if (baseName === "profile" || baseName === "perfil") iconName = isFocused ? "person" : "person-outline";
          else if (baseName === "notifications" || baseName === "notificaciones") iconName = isFocused ? "notifications" : "notifications-outline";
          else iconName = isFocused ? "home" : "home-outline";

          // Label legible
          const label = baseName === "profile" ? "Perfil" : baseName === "notifications" ? "Alertas" : "Inicio";

          // Cada botón ocupa la misma fracción de ancho (flex:1)
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.85}
              style={styles.tabFlex}
            >
              {isCenter ? (
                // Botón central destacado (con scale animado)
                <Animated.View style={[styles.centerWrapper, { transform: [{ translateY: -8 }, { scale: scaleAnim }] }]}>
                  <View style={[styles.centerButton, isFocused && styles.centerButtonActive]}>
                    <Ionicons name={iconName as any} size={28} color={isFocused ? "#fff" : "#0b5fff"} />
                  </View>
                  <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
                </Animated.View>
              ) : (
                // Botón lateral
                <View style={styles.sideWrapper}>
                  <View style={styles.sideButton}>
                    <Ionicons name={iconName as any} size={22} color={isFocused ? "#0b5fff" : "#8892A6"} />
                  </View>
                  <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
                </View>
              )}
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
    alignItems: "flex-end",
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

  // Cada botón ocupa la misma fracción (mejora la distribución)
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
    shadowColor: "#0b5fff",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 12,
  },

  centerButtonActive: {
    backgroundColor: "#0b5fff",
    borderColor: "#0b5fff",
  },

  label: {
    marginTop: 6,
    fontSize: 11,
    color: "#8892A6",
  },

  labelActive: {
    color: "#0b5fff",
    fontWeight: "600",
  },
});
