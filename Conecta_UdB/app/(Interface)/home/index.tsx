import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface Event {
  id: string;
  creator: string;
  date: string;
  time: string;
  place: string;
  interests: string[];
  attending: boolean;
}

const initialEvents: Event[] = [
  {
    id: "1",
    creator: "Juan Pérez",
    date: "2025-12-01",
    time: "16:00",
    place: "Auditorio Principal",
    interests: ["Animación", "Arte"],
    attending: false,
  },
  {
    id: "2",
    creator: "Ana Gómez",
    date: "2025-12-03",
    time: "18:30",
    place: "Salón 101",
    interests: ["Tecnología", "Programación"],
    attending: false,
  },
  {
    id: "3",
    creator: "Luis Martínez",
    date: "2025/12/05",
    time: "14:00",
    place: "Sala de Conferencias",
    interests: ["Música", "Cine"],
    attending: false,
  },
  {
    id: "4",
    creator: "María Rodríguez",
    date: "2025/12/07",
    time: "10:00",
    place: "Auditorio Secundario",
    interests: ["Deportes", "Educación"],
    attending: false,
  }, 
  {
    id: "5",
    creator: "Carlos López",
    date: "2025/12/09",
    time: "12:00",
    place: "Sala de Reuniones",
    interests: ["Literatura", "Ciencia"],
    attending: false,
  },
  {
    id: "6",
    creator: "Sofía Hernández",
    date: "2025/12/11",
    time: "15:00",
    place: "Auditorio Principal",
    interests: ["Moda", "Videojuegos"],
    attending: false,
  },
];

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

export default function HomeScreen() {
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>(initialEvents);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleAttendance = (id: string) => {
    const updatedEvents = events.map((event) =>
      event.id === id ? { ...event, attending: !event.attending } : event
    );
    setEvents(updatedEvents);
  };

  const filteredEvents = selectedInterests.length > 0
    ? events.filter((event) =>
        event.interests.some((interest) => selectedInterests.includes(interest))
      )
    : events;

  const renderEvent = ({ item }: { item: Event }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.creator}>{item.creator}</Text>
        <Text style={styles.date}>
          {item.date} • {item.time}
        </Text>
      </View>
      <Text style={styles.place}>Lugar: {item.place}</Text>
      <View style={styles.interestsContainer}>
        {item.interests.slice(0, 2).map((interest, idx) => (
          <View key={idx} style={styles.interestTag}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.attendButton, item.attending && styles.attending]}
        onPress={() => toggleAttendance(item.id)}
      >
        {item.attending ? (
          <MaterialIcons name="check" size={24} color="#fff" />
        ) : (
          <MaterialIcons name="add" size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Conecta UdB</Text>

      <TouchableOpacity
        style={styles.accordionToggle}
        onPress={() => setIsInterestsOpen(!isInterestsOpen)}
      >
        <Text style={styles.accordionLabel}>
          Filtrar por intereses {isInterestsOpen ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

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

      {/* Feed de eventos */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.feed}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay eventos para mostrar.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
    color: "#6b2b2b",
  },
  accordionToggle: {
    paddingVertical: 8,
    marginBottom: 6,
  },
  accordionLabel: {
    color: "#e20613",
    fontWeight: "700",
    fontSize: 16,
  },
  interestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  interestOption: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  feed: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: "relative",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  creator: {
    fontWeight: "700",
    fontSize: 16,
    color: "#e20613",
  },
  date: {
    fontSize: 14,
    color: "#6e7c96",
  },
  place: {
    fontSize: 14,
    color: "#6e7c96",
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  interestTag: {
    backgroundColor: "#e20613",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  interestText: {
    color: "#fff",
    fontSize: 12,
  },
  attendButton: {
    position: "absolute",
    right: 15,
    bottom: 15,
    backgroundColor: "#e20613",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  attending: {
    backgroundColor: "#28a745",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    alignSelf: "center",
    marginTop: 50,
  },
});
