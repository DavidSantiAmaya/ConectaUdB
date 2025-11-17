import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";

const EVENTS_KEY = "UDb_EVENTS_V2";
const currentUser = { id: "user1", name: "Juan Pérez" };

const allInterests = [
  "Animación",
  "Narrativas Digitales",
  "Arte",
  "Música",
  "Tecnología",
  "Deportes",
  "Literatura",
  "Programación",
  "Fotografía",
  "Videojuegos",
  "Cine",
  "Educación",
  "Ciencia",
  "Sostenibilidad",
];

const allPlaces = [
  "Auditorio Principal",
  "Salón 101",
  "Sala de Conferencias",
  "Auditorio Secundario",
  "Sala de Reuniones",
  "Biblioteca Central",
  "Cafetería",
];

const initialEventsSeed = [
  {
    id: "1",
    title: "Charla sobre Animación",
    description: "Conversación sobre pipeline y técnicas en animación 2D/3D.",
    datetime: "2025-12-01T16:00:00.000Z",
    place: "Auditorio Principal",
    capacity: 25,
    tags: ["Animación", "Arte"],
    imageUri: null,
    organizerId: "user1",
    organizerName: "Juan Pérez",
    attendees: [
      { userId: "user2", userName: "Ana Gómez" },
      { userId: "user3", userName: "Luis Martínez" },
      { userId: "user4", userName: "María López" },
    ],
  },
  {
    id: "2",
    title: "Taller de Programación",
    description: "Hands-on con frameworks modernos y buenas prácticas.",
    datetime: "2025-12-03T18:30:00.000Z",
    place: "Salón 101",
    capacity: 30,
    tags: ["Tecnología", "Programación"],
    imageUri: null,
    organizerId: "user2",
    organizerName: "Ana Gómez",
    attendees: [
      { userId: "user1", userName: "Juan Pérez" },
      { userId: "user5", userName: "Carlos Ruiz" },
    ],
  },
  {
    id: "3",
    title: "Encuentro de Cine y Música",
    description: "Proyección y conversación sobre bandas sonoras.",
    datetime: "2025-12-05T14:00:00.000Z",
    place: "Sala de Conferencias",
    capacity: 40,
    tags: ["Música", "Cine"],
    imageUri: null,
    organizerId: "user3",
    organizerName: "Luis Martínez",
    attendees: [
      { userId: "user1", userName: "Juan Pérez" },
      { userId: "user4", userName: "María López" },
      { userId: "user6", userName: "Sandra González" },
      { userId: "user7", userName: "Roberto García" },
    ],
  },
  {
    id: "4",
    title: "Conferencia de Sostenibilidad",
    description: "Debatiremos sobre prácticas sostenibles en tecnología.",
    datetime: "2025-12-02T10:00:00.000Z",
    place: "Biblioteca Central",
    capacity: 50,
    tags: ["Sostenibilidad", "Ciencia"],
    imageUri: null,
    organizerId: "user4",
    organizerName: "María López",
    attendees: [
      { userId: "user2", userName: "Ana Gómez" },
      { userId: "user3", userName: "Luis Martínez" },
      { userId: "user5", userName: "Carlos Ruiz" },
    ],
  },
  {
    id: "5",
    title: "Taller de Fotografía Digital",
    description: "Aprende técnicas de composición y edición profesional.",
    datetime: "2025-12-04T15:00:00.000Z",
    place: "Salón 101",
    capacity: 20,
    tags: ["Fotografía", "Arte"],
    imageUri: null,
    organizerId: "user5",
    organizerName: "Carlos Ruiz",
    attendees: [
      { userId: "user1", userName: "Juan Pérez" },
      { userId: "user4", userName: "María López" },
    ],
  },
  {
    id: "6",
    title: "Noche de Literatura",
    description: "Lecturas de autores contemporáneos y debate abierto.",
    datetime: "2025-12-06T19:00:00.000Z",
    place: "Cafetería",
    capacity: 35,
    tags: ["Literatura", "Educación"],
    imageUri: null,
    organizerId: "user6",
    organizerName: "Sandra González",
    attendees: [
      { userId: "user2", userName: "Ana Gómez" },
      { userId: "user7", userName: "Roberto García" },
    ],
  },
  {
    id: "7",
    title: "Competencia de Videojuegos",
    description: "Torneo amistoso de juegos clásicos y modernos.",
    datetime: "2025-12-07T17:00:00.000Z",
    place: "Auditorio Secundario",
    capacity: 45,
    tags: ["Videojuegos", "Deportes"],
    imageUri: null,
    organizerId: "user7",
    organizerName: "Roberto García",
    attendees: [
      { userId: "user1", userName: "Juan Pérez" },
      { userId: "user3", userName: "Luis Martínez" },
      { userId: "user5", userName: "Carlos Ruiz" },
      { userId: "user6", userName: "Sandra González" },
    ],
  },
  {
    id: "8",
    title: "Masterclass de Música Electrónica",
    description: "Producción musical con software profesional.",
    datetime: "2025-12-08T16:30:00.000Z",
    place: "Sala de Conferencias",
    capacity: 25,
    tags: ["Música", "Tecnología"],
    imageUri: null,
    organizerId: "user2",
    organizerName: "Ana Gómez",
    attendees: [
      { userId: "user1", userName: "Juan Pérez" },
      { userId: "user4", userName: "María López" },
      { userId: "user7", userName: "Roberto García" },
    ],
  },
  {
    id: "9",
    title: "Jornada de Ciencia Aplicada",
    description: "Experiencias interactivas de física y química.",
    datetime: "2025-12-09T13:00:00.000Z",
    place: "Auditorio Principal",
    capacity: 60,
    tags: ["Ciencia", "Educación"],
    imageUri: null,
    organizerId: "user3",
    organizerName: "Luis Martínez",
    attendees: [
      { userId: "user2", userName: "Ana Gómez" },
      { userId: "user5", userName: "Carlos Ruiz" },
    ],
  },
  {
    id: "10",
    title: "Taller de Narrativas Digitales",
    description: "Storytelling interactivo para medios digitales.",
    datetime: "2025-12-10T14:30:00.000Z",
    place: "Sala de Reuniones",
    capacity: 28,
    tags: ["Narrativas Digitales", "Educación"],
    imageUri: null,
    organizerId: "user5",
    organizerName: "Carlos Ruiz",
    attendees: [
      { userId: "user1", userName: "Juan Pérez" },
      { userId: "user3", userName: "Luis Martínez" },
      { userId: "user6", userName: "Sandra González" },
    ],
  },
];

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month} ${hours}:${minutes}`;
};

export default function HomeScreen() {
  const [events, setEvents] = useState([]);
  const [isInterestsOpen, setIsInterestsOpen] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlace, setFilterPlace] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadEvents();
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permisos",
            "Se requieren permisos para acceder a la galería."
          );
        }
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events)).catch((e) =>
      console.warn("Error guardando eventos:", e)
    );
  }, [events]);

  async function loadEvents() {
    try {
      const raw = await AsyncStorage.getItem(EVENTS_KEY);
      if (raw) {
        setEvents(JSON.parse(raw));
      } else {
        setEvents(initialEventsSeed);
        await AsyncStorage.setItem(
          EVENTS_KEY,
          JSON.stringify(initialEventsSeed)
        );
      }
    } catch (e) {
      console.warn("Error cargando eventos:", e);
      setEvents(initialEventsSeed);
    }
  }

  function emptyForm() {
    return {
      title: "",
      description: "",
      datetime: new Date(),
      place: allPlaces[0],
      capacity: "",
      tags: [],
      imageUri: null,
    };
  }

  function toggleInterest(interest) {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  }

  function toggleTagInForm(tag) {
    if (form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
    } else {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
  }

  function toggleAttendance(eventId) {
    setEvents((prevEvents) =>
      prevEvents.map((ev) => {
        if (ev.id !== eventId) return ev;
        const alreadyAttending = ev.attendees.some(
          (a) => a.userId === currentUser.id
        );
        let newAttendees;
        if (alreadyAttending) {
          newAttendees = ev.attendees.filter(
            (a) => a.userId !== currentUser.id
          );
        } else {
          if (ev.attendees.length >= ev.capacity) return ev;
          newAttendees = [
            ...ev.attendees,
            { userId: currentUser.id, userName: currentUser.name },
          ];
        }
        return { ...ev, attendees: newAttendees };
      })
    );
  }

  function filteredEvents() {
    return events.filter((ev) => {
      const interestOk =
        selectedInterests.length === 0 ||
        ev.tags.some((t) => selectedInterests.includes(t));
      const textOk =
        !searchQuery ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.place.toLowerCase().includes(searchQuery.toLowerCase());
      const placeOk = !filterPlace || ev.place === filterPlace;
      return interestOk && textOk && placeOk;
    });
  }

  function openCreateModal() {
    setEditingEventId(null);
    setForm(emptyForm());
    setModalVisible(true);
  }

  function openEditModal(event) {
    if (event.organizerId !== currentUser.id) {
      Alert.alert(
        "Acceso denegado",
        "Solo el organizador puede editar este evento."
      );
      return;
    }
    setOpenMenuId(null);
    setEditingEventId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      datetime: new Date(event.datetime),
      place: event.place,
      capacity: String(event.capacity),
      tags: event.tags,
      imageUri: event.imageUri || null,
    });
    setModalVisible(true);
  }

  function confirmDelete(event) {
    if (event.organizerId !== currentUser.id) {
      Alert.alert(
        "Acceso denegado",
        "Solo el organizador puede eliminar este evento."
      );
      return;
    }
    setOpenMenuId(null);
    Alert.alert("Eliminar evento", "¿Seguro quieres eliminar este evento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setEvents((prev) => prev.filter((e) => e.id !== event.id));
        },
      },
    ]);
  }

  function pickImage() {
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    })
      .then((result) => {
        if (!result.canceled) {
          const uri = result.assets ? result.assets[0].uri : result.uri;
          setForm((f) => ({ ...f, imageUri: uri }));
        }
      })
      .catch((e) => console.warn("Error pick image:", e));
  }

  function saveForm() {
    if (!form.title.trim())
      return Alert.alert("Validación", "El título es obligatorio.");
    if (!form.description.trim())
      return Alert.alert("Validación", "La descripción es obligatoria.");
    if (!form.place.trim())
      return Alert.alert("Validación", "La ubicación es obligatoria.");
    const cap = parseInt(form.capacity, 10);
    if (isNaN(cap) || cap <= 0)
      return Alert.alert("Validación", "La capacidad debe ser mayor a 0.");
    if (form.tags.length === 0)
      return Alert.alert(
        "Validación",
        "Debes seleccionar al menos una etiqueta/interés."
      );

    if (editingEventId) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingEventId
            ? {
                ...ev,
                title: form.title.trim(),
                description: form.description.trim(),
                datetime: form.datetime.toISOString(),
                place: form.place,
                capacity: cap,
                tags: form.tags,
                imageUri: form.imageUri,
              }
            : ev
        )
      );
    } else {
      const newEvent = {
        id: Date.now().toString(),
        title: form.title.trim(),
        description: form.description.trim(),
        datetime: form.datetime.toISOString(),
        place: form.place,
        capacity: cap,
        tags: form.tags,
        imageUri: form.imageUri,
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        attendees: [],
      };
      setEvents((prev) => [newEvent, ...prev]);
    }
    setModalVisible(false);
    setEditingEventId(null);
    setForm(emptyForm());
  }

  function AnimatedCard({ item }) {
    const [scaleAnim] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };

    const dateTimeStr = formatDateTime(item.datetime);
    const attending = item.attendees.some((a) => a.userId === currentUser.id);
    const eventFull = item.attendees.length >= item.capacity;
    const availableSpots = item.capacity - item.attendees.length;
    const isOwner = item.organizerId === currentUser.id;
    const isMenuOpen = openMenuId === item.id;

    return (
      <Animated.View
        style={[styles.eventCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{ flex: 1 }}
        >
          <View style={styles.eventCardContent}>
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={["#E63946", "#C1121F"]}
                style={styles.eventImagePlaceholder}
              >
                <MaterialIcons name="event" size={45} color="#FFFFFF" />
              </LinearGradient>
            )}
            <View style={styles.eventInfo}>
              <View style={styles.headerWithMenu}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.titleCard} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.organizerText}>
                    por {item.organizerName}
                  </Text>
                </View>
                {isOwner && (
                  <View style={styles.menuContainer}>
                    <TouchableOpacity
                      onPress={() => setOpenMenuId(isMenuOpen ? null : item.id)}
                      style={styles.gearButton}
                    >
                      <MaterialIcons
                        name="settings"
                        size={20}
                        color="#E63946"
                      />
                    </TouchableOpacity>
                    {isMenuOpen && (
                      <View style={styles.menuDropdown}>
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => openEditModal(item)}
                        >
                          <MaterialIcons
                            name="edit"
                            size={18}
                            color="#E63946"
                          />
                          <Text style={styles.menuItemText}>Editar</Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => confirmDelete(item)}
                        >
                          <MaterialIcons
                            name="delete"
                            size={18}
                            color="#E63946"
                          />
                          <Text style={styles.menuItemText}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
              <View style={styles.dateTimeRow}>
                <MaterialIcons name="schedule" size={14} color="#E63946" />
                <Text style={styles.dateTimeText}>{dateTimeStr}</Text>
              </View>
              <View style={styles.placeRow}>
                <MaterialIcons name="location-on" size={14} color="#E63946" />
                <Text style={styles.placeText} numberOfLines={1}>{item.place}</Text>
              </View>
              <View style={styles.tagsRow}>
                {item.tags?.slice(0, 2).map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.bottomSection}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.capacityTextLabel}>Disponible</Text>
                  <View style={styles.capacityBar}>
                    <View
                      style={[
                        styles.capacityFill,
                        {
                          width: `${(item.attendees.length / item.capacity) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.capacityText}>
                    {availableSpots}/{item.capacity}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.attendButton,
                    attending && styles.attending,
                    eventFull && !attending && styles.eventFullBtn,
                  ]}
                  onPress={() => toggleAttendance(item.id)}
                  disabled={!attending && eventFull}
                >
                  {attending ? (
                    <MaterialIcons name="check" size={20} color="#FFFFFF" />
                  ) : eventFull ? (
                    <MaterialIcons name="block" size={20} color="#FFFFFF" />
                  ) : (
                    <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  function renderEvent({ item }) {
    return <AnimatedCard item={item} />;
  }

  return (
    <LinearGradient colors={["#FFFFFF", "#F7F7F7"]} style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.appTitle}>Conecta UdB</Text>
      </View>

      <View style={{ marginBottom: 10 }}>
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color="#999"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.inputSearch}
            placeholder="Buscar por nombre, ubicación..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.pickerWrapper}>
          <View style={styles.pickerLabel}>
            <MaterialIcons name="location-on" size={16} color="#E63946" />
            <Text style={styles.pickerLabelText}>Ubicación</Text>
          </View>
          <Picker
            selectedValue={filterPlace}
            style={styles.picker}
            onValueChange={setFilterPlace}
          >
            <Picker.Item label="Todos" value="" />
            {allPlaces.map((place) => (
              <Picker.Item label={place} value={place} key={place} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.topRow}>
        <TouchableOpacity style={styles.createBtn} onPress={openCreateModal}>
          <MaterialIcons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.createBtnText}>Crear evento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setIsInterestsOpen((s) => !s)}
        >
          <Text style={styles.filterText}>
            Intereses {isInterestsOpen ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>
      </View>

      {isInterestsOpen && (
        <View style={styles.interestsList}>
          {allInterests.map((interest) => {
            const selected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestOption,
                  selected && styles.interestOptionSelected,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.interestText,
                    selected && styles.interestTextSelected,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <FlatList
        data={filteredEvents()}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay eventos para mostrar
          </Text>
        }
        extraData={[events, currentUser, openMenuId]}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <LinearGradient
          colors={["#FFFFFF", "#F9F9F9"]}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#121212" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {editingEventId ? "Editar evento" : "Crear evento"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Título</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder="Nombre del evento"
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.label}>Descripción</Text>
            <View style={[styles.inputWrapper, { height: 110 }]}>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={form.description}
                onChangeText={(v) =>
                  setForm((f) => ({ ...f, description: v }))
                }
                placeholder="Descripción completa"
                placeholderTextColor="#999"
                multiline
              />
            </View>

            <Text style={styles.label}>Fecha y Hora</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => {
                if (isMountedRef.current) {
                  setShowDatePicker(true);
                }
              }}
            >
              <View style={[styles.input, { justifyContent: "center" }]}>
                <Text style={{ color: "#121212", fontSize: 14, fontWeight: "700" }}>
                  {formatDateTime(form.datetime.toISOString())}
                </Text>
              </View>
            </TouchableOpacity>

            {showDatePicker && isMountedRef.current && (
              <DateTimePicker
                value={form.datetime}
                mode="datetime"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(ev, selected) => {
                  if (!isMountedRef.current) return;
                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }
                  if (selected) {
                    setForm((f) => ({ ...f, datetime: selected }));
                  }
                }}
              />
            )}

            <Text style={styles.label}>Ubicación</Text>
            <View style={styles.inputWrapper}>
              <Picker
                selectedValue={form.place}
                style={styles.input}
                onValueChange={(v) => setForm((f) => ({ ...f, place: v }))}
              >
                {allPlaces.map((place) => (
                  <Picker.Item label={place} value={place} key={place} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Capacidad</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={form.capacity}
                onChangeText={(v) => setForm((f) => ({ ...f, capacity: v }))}
                placeholder="Número máximo de asistentes"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.label}>
              Etiquetas/intereses (selecciona al menos una)
            </Text>
            <View style={styles.interestsList}>
              {allInterests.map((tag) => {
                const selected = form.tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.interestOption,
                      selected && styles.interestOptionSelected,
                    ]}
                    onPress={() => toggleTagInForm(tag)}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        selected && styles.interestTextSelected,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Imagen</Text>
            <View style={{ marginBottom: 12 }}>
              <TouchableOpacity
                style={styles.redButton}
                onPress={pickImage}
              >
                <MaterialIcons
                  name="add-photo-alternate"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.redButtonText}>Elegir imagen</Text>
              </TouchableOpacity>
              {form.imageUri ? (
                <Image
                  source={{ uri: form.imageUri }}
                  style={styles.previewImage}
                />
              ) : null}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.redButton} onPress={saveForm}>
                <Text style={styles.redButtonText}>
                  {editingEventId ? "Guardar" : "Crear"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  headerSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#F0F0F0",
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#E63946",
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#121212",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputSearch: {
    flex: 1,
    fontSize: 15,
    color: "#121212",
    paddingVertical: 10,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#121212",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  pickerLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
  },
  pickerLabelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E63946",
  },
  picker: {
    borderWidth: 0,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  createBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E63946",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 6,
  },
  createBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  filterToggle: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#121212",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  filterText: {
    color: "#E63946",
    fontWeight: "700",
    fontSize: 14,
  },
  interestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 6,
  },
  interestOption: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 4,
    shadowColor: "#121212",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  interestOptionSelected: {
    backgroundColor: "#E63946",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  interestText: {
    color: "#121212",
    fontWeight: "600",
    fontSize: 12,
  },
  interestTextSelected: {
    color: "#FFFFFF",
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#121212",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
  },
  eventCardContent: {
    flexDirection: "row",
    padding: 16,
  },
  eventImage: {
    width: 130,
    height: 170,
    borderRadius: 16,
    marginRight: 16,
    backgroundColor: "#F7F7F7",
  },
  eventImagePlaceholder: {
    width: 130,
    height: 170,
    borderRadius: 16,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  eventInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerWithMenu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  titleCard: {
    fontSize: 17,
    fontWeight: "800",
    color: "#121212",
    marginBottom: 2,
    lineHeight: 22,
    paddingRight: 8,
  },
  organizerText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 8,
  },
  menuContainer: {
    position: "relative",
    zIndex: 10,
  },
  gearButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  menuDropdown: {
    position: "absolute",
    top: 32,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#121212",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
    minWidth: 140,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  menuItemText: {
    fontSize: 14,
    color: "#121212",
    fontWeight: "600",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  dateTimeText: {
    fontSize: 13,
    color: "#E63946",
    fontWeight: "700",
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 4,
  },
  placeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    flex: 1,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: "#E63946",
    fontSize: 11,
    fontWeight: "700",
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  capacityTextLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "700",
    marginBottom: 4,
  },
  capacityBar: {
    width: 80,
    height: 6,
    backgroundColor: "#E5E5E5",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  capacityFill: {
    height: 6,
    backgroundColor: "#E63946",
    borderRadius: 3,
  },
  capacityText: {
    fontSize: 10,
    color: "#E63946",
    fontWeight: "700",
  },
  attendButton: {
    backgroundColor: "#E63946",
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  attending: {
    backgroundColor: "#28a745",
    shadowColor: "#28a745",
  },
  eventFullBtn: {
    backgroundColor: "#999",
    shadowColor: "#999",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    alignSelf: "center",
    marginTop: 60,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#121212",
  },
  modalContent: {
    padding: 20,
  },
  label: {
    marginTop: 14,
    fontWeight: "700",
    color: "#121212",
    fontSize: 14,
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#121212",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 4,
  },
  input: {
    padding: 14,
    fontSize: 14,
    color: "#121212",
  },
  previewImage: {
    width: 100,
    height: 100,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 28,
    gap: 12,
  },
  redButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E63946",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  redButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: "#666",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#666",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
});