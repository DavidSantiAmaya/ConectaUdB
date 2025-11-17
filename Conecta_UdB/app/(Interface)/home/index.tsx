// HomeScreen Mejorado para Gestión de Eventos en React Native
// ----------- Dependencias (instala antes de usar) -------------
// expo install expo-image-picker @react-native-async-storage/async-storage @react-native-community/datetimepicker @react-native-picker/picker
// npm install @expo/vector-icons
//---------------------------------------------------------------

import React, { useEffect, useState } from "react";
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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

// --- Constantes / Usuario demo ---
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
    capacity: 2,
    tags: ["Animación", "Arte"],
    imageUri: null,
    organizerId: "user1",
    organizerName: "Juan Pérez",
    attendees: [],
  },
  {
    id: "2",
    title: "Taller de Programación",
    description: "Hands-on con frameworks modernos y buenas prácticas.",
    datetime: "2025-12-03T18:30:00.000Z",
    place: "Salón 101",
    capacity: 3,
    tags: ["Tecnología", "Programación"],
    imageUri: null,
    organizerId: "user2",
    organizerName: "Ana Gómez",
    attendees: [],
  },
  {
    id: "3",
    title: "Encuentro de Cine y Música",
    description: "Proyección y conversación sobre bandas sonoras.",
    datetime: "2025-12-05T14:00:00.000Z",
    place: "Sala de Conferencias",
    capacity: 1,
    tags: ["Música", "Cine"],
    imageUri: null,
    organizerId: "user3",
    organizerName: "Luis Martínez",
    attendees: [],
  },
];

export default function HomeScreen() {
  const [events, setEvents] = useState([]);
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterPlace, setFilterPlace] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Obtener fechas únicas de eventos existentes
  const dateOptions = Array.from(
    new Set(events.map((ev) => ev.datetime.slice(0, 10)))
  ).sort();

  useEffect(() => {
    loadEvents();
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permisos",
            "Se requieren permisos para acceder a la galería si quieres añadir imágenes."
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
        ev.description.toLowerCase().includes(searchQuery.toLowerCase());
      const dateOk = !filterDate || ev.datetime.slice(0, 10) === filterDate;
      const placeOk = !filterPlace || ev.place === filterPlace;
      const availableOk =
        !showOnlyAvailable || ev.attendees.length < ev.capacity;
      return interestOk && textOk && dateOk && placeOk && availableOk;
    });
  }

  // CRUD
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

  // --- UI ---
  function renderEvent({ item }) {
    const date = new Date(item.datetime);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const attending = item.attendees.some((a) => a.userId === currentUser.id);
    const eventFull = item.attendees.length >= item.capacity;
    return (
      <View style={styles.eventCard}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.eventImage} />
        ) : null}
        <View style={{ flex: 1 }}>
          <View style={styles.eventHeader}>
            <Text style={styles.titleCard}>{item.title}</Text>
            <Text style={styles.dateText}>
              {dateStr} • {timeStr}
            </Text>
          </View>
          <Text style={styles.creatorText}>
            Organizador: {item.organizerName}
          </Text>
          <Text style={styles.placeText}>Lugar: {item.place}</Text>
          <Text style={styles.descText} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.tagsRow}>
            {item.tags?.slice(0, 4).map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.capacityText}>
            Asistentes: {item.attendees.length}/{item.capacity}
          </Text>
          {item.attendees.length > 0 && (
            <View style={styles.attendeeList}>
              {item.attendees.slice(0, 6).map((at) => (
                <View key={at.userId} style={styles.attendeeChip}>
                  <Text style={styles.attendeeText}>{at.userName}</Text>
                </View>
              ))}
              {item.attendees.length > 6 && (
                <Text style={styles.attendeeText}>y más...</Text>
              )}
            </View>
          )}
        </View>
        <View style={styles.actionColumn}>
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
              <MaterialIcons name="check" size={22} color="#fff" />
            ) : eventFull ? (
              <MaterialIcons name="block" size={22} color="#fff" />
            ) : (
              <MaterialIcons name="add" size={22} color="#fff" />
            )}
          </TouchableOpacity>
          <Text style={styles.rsvpTxt}>
            {attending ? "Asistiendo" : eventFull ? "Lleno" : "Asistir"}
          </Text>
          {item.organizerId === currentUser.id && (
            <>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => openEditModal(item)}
              >
                <MaterialIcons name="edit" size={18} color="#e20613" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => confirmDelete(item)}
              >
                <MaterialIcons name="delete" size={18} color="#e20613" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>🏠 Conecta UdB</Text>
      {/* Barra de búsqueda y filtros */}
      <View style={{ marginBottom: 6 }}>
        <TextInput
          style={styles.inputSearch}
          placeholder="Buscar (nombre, descripción)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.filterRow}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Picker
            selectedValue={filterPlace}
            style={styles.picker}
            onValueChange={setFilterPlace}
          >
            <Picker.Item label="Todos los lugares" value="" />
            {allPlaces.map((place) => (
              <Picker.Item label={place} value={place} key={place} />
            ))}
          </Picker>
        </View>
        <View style={{ flex: 1 }}>
          <Picker
            selectedValue={filterDate}
            style={styles.picker}
            onValueChange={setFilterDate}
          >
            <Picker.Item label="Todas las fechas" value="" />
            {dateOptions.map((date) => (
              <Picker.Item label={date} value={date} key={date} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.availableBtn}
          onPress={() => setShowOnlyAvailable((v) => !v)}
        >
          <Text style={styles.availableBtnText}>
            {showOnlyAvailable ? "✓ Solo disponibles" : "Mostrar todos"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.createBtn} onPress={openCreateModal}>
          <MaterialIcons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.createBtnText}>Crear evento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setIsInterestsOpen((s) => !s)}
        >
          <Text style={styles.filterText}>
            Filtrar por intereses {isInterestsOpen ? "▲" : "▼"}
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
                  { backgroundColor: selected ? "#e20613" : "#ddd" },
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={{ color: selected ? "#fff" : "#333" }}>
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      {/* Feed eventos */}
      <FlatList
        data={filteredEvents()}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay eventos para mostrar.</Text>
        }
        extraData={[events, currentUser]}
      />
      {/* Modal crear/editar */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingEventId ? "Editar evento" : "Crear nuevo evento"}
          </Text>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            placeholder="Nombre del evento"
          />
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Descripción completa"
            multiline
          />
          <Text style={styles.label}>Fecha y hora</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: "center" }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>
              {form.datetime.toLocaleDateString()} •{" "}
              {form.datetime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.datetime}
              mode="datetime"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(ev, selected) => {
                if (Platform.OS === "android") setShowDatePicker(false);
                if (selected) setForm((f) => ({ ...f, datetime: selected }));
              }}
            />
          )}
          <Text style={styles.label}>Ubicación</Text>
          <View style={styles.input}>
            <Picker
              selectedValue={form.place}
              onValueChange={(v) => setForm((f) => ({ ...f, place: v }))}
            >
              {allPlaces.map((place) => (
                <Picker.Item label={place} value={place} key={place} />
              ))}
            </Picker>
          </View>
          <Text style={styles.label}>Capacidad</Text>
          <TextInput
            style={styles.input}
            value={form.capacity}
            onChangeText={(v) => setForm((f) => ({ ...f, capacity: v }))}
            placeholder="Número máximo de asistentes"
            keyboardType="numeric"
          />
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
                    { backgroundColor: selected ? "#e20613" : "#ddd" },
                  ]}
                  onPress={() => toggleTagInForm(tag)}
                >
                  <Text style={{ color: selected ? "#fff" : "#333" }}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.label}>Imagen</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <TouchableOpacity style={styles.redButton} onPress={pickImage}>
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
      </Modal>
    </View>
  );
}

// --------- Estilos ---------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    padding: 16,
    paddingTop: 40,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
    color: "#6b2b2b",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e20613",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createBtnText: { marginLeft: 8, color: "#fff", fontWeight: "700" },
  filterToggle: { padding: 6 },
  filterText: { color: "#e20613", fontWeight: "700", marginLeft: 8 },
  interestsList: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  interestOption: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: "row",
    position: "relative",
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#eee",
  },
  eventHeader: { flexDirection: "row", justifyContent: "space-between" },
  titleCard: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    maxWidth: 150,
  },
  dateText: { fontSize: 12, color: "#6e7c96" },
  creatorText: { fontSize: 12, color: "#444", marginTop: 4 },
  placeText: { fontSize: 13, color: "#6e7c96", marginTop: 6 },
  descText: { marginTop: 8, color: "#333", fontSize: 13 },
  tagsRow: { flexDirection: "row", marginTop: 8, flexWrap: "wrap" },
  tag: {
    backgroundColor: "#e20613",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 6,
  },
  tagText: { color: "#fff", fontSize: 12 },
  attendeeList: { flexDirection: "row", marginTop: 4, flexWrap: "wrap" },
  attendeeChip: {
    backgroundColor: "#eecdbe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9,
    marginRight: 6,
    marginTop: 2,
  },
  attendeeText: { color: "#bf6235", fontSize: 12 },
  capacityText: {
    marginTop: 4,
    color: "#e20613",
    fontWeight: "700",
    fontSize: 12,
  },
  actionColumn: {
    justifyContent: "flex-end",
    alignItems: "center",
    marginLeft: 8,
  },
  attendButton: {
    marginTop: 5,
    backgroundColor: "#e20613",
    borderRadius: 14,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  attending: { backgroundColor: "#28a745" },
  eventFullBtn: { backgroundColor: "#c7c7c7" },
  iconBtn: { marginTop: 10, padding: 5 },
  rsvpTxt: { fontSize: 10, color: "#333" },
  emptyText: {
    color: "#999",
    fontSize: 16,
    alignSelf: "center",
    marginTop: 50,
  },
  modalContent: { padding: 16, paddingTop: 48, backgroundColor: "#fff" },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#222",
  },
  label: { marginTop: 8, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  previewImage: { width: 64, height: 64, marginLeft: 12, borderRadius: 8 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
    gap: 12,
  },
  inputSearch: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fafafa",
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  availableBtn: {
    backgroundColor: "#e20613",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  availableBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  redButton: {
    backgroundColor: "#e20613",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  redButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: "#777",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
