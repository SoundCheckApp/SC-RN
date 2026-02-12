import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MusicConsumerHomepage() {
  const [radius, setRadius] = useState(5); // Default 5 miles
  const [nearbyMusicians, setNearbyMusicians] = useState([]);
  const [selectedMusician, setSelectedMusician] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadNearbyMusicians();
  }, [radius]);

  const loadNearbyMusicians = async () => {
    setIsLoading(true);
    try {
      // TODO: Get user's current location
      // For now, using mock data structure
      // In production, you'll:
      // 1. Get user location using expo-location
      // 2. Query musicians table for those within radius
      // 3. Filter by is_live = true

      // Mock data structure - replace with actual Supabase query
      const mockMusicians = [
        {
          id: "1",
          name: "Jazz Player",
          genre: "Jazz",
          location: { lat: 40.7128, lng: -74.006 },
          isOfficial: false,
        },
        {
          id: "2",
          name: "SoundCheck Music",
          genre: "World",
          location: { lat: 40.715, lng: -74.008 },
          isOfficial: true,
        },
      ];

      // TODO: Replace with actual query:
      // const { data, error } = await supabase
      //   .from("musicians")
      //   .select("*")
      //   .eq("is_live", true)
      //   .within("location", userLocation, radius);

      setNearbyMusicians(mockMusicians);
    } catch (error) {
      console.error("Error loading nearby musicians:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerPress = (musician) => {
    setSelectedMusician(musician.id);
    // Scroll to the musician's listing
    const index = nearbyMusicians.findIndex((m) => m.id === musician.id);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: index * 100, animated: true });
    }
  };

  const handleViewProfile = (musicianId) => {
    router.push(`/musicianProfile/${musicianId}`);
  };

  const handleListingPress = (musician) => {
    setSelectedMusician(musician.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nearby Musicians</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Radius Selector */}
        <View style={styles.radiusContainer}>
          <Text style={styles.radiusLabel}>Radius:</Text>
          <View style={styles.radiusButtons}>
            {[1, 2, 3, 4, 5].map((mile) => (
              <TouchableOpacity
                key={mile}
                style={[
                  styles.radiusButton,
                  radius === mile && styles.radiusButtonActive,
                ]}
                onPress={() => setRadius(mile)}
              >
                <Text
                  style={[
                    styles.radiusButtonText,
                    radius === mile && styles.radiusButtonTextActive,
                  ]}
                >
                  {mile} mi
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>
              Map showing musicians within {radius} miles
            </Text>

            {/* User Location Marker */}
            <View style={styles.userMarker}>
              <Ionicons name="location" size={24} color="#3B82F6" />
              <View style={styles.userMarkerCircle} />
            </View>

            {/* Musician Markers */}
            {nearbyMusicians.map((musician, index) => (
              <TouchableOpacity
                key={musician.id}
                style={[
                  styles.musicianMarker,
                  {
                    left: `${30 + index * 20}%`,
                    top: `${40 + index * 15}%`,
                  },
                  selectedMusician === musician.id && styles.musicianMarkerSelected,
                ]}
                onPress={() => handleMarkerPress(musician)}
              >
                <View style={styles.musicianMarkerDot} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Musicians List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>Loading nearby musicians...</Text>
          ) : nearbyMusicians.length === 0 ? (
            <Text style={styles.emptyText}>
              No musicians live in your area within {radius} miles
            </Text>
          ) : (
            nearbyMusicians.map((musician) => (
              <TouchableOpacity
                key={musician.id}
                style={[
                  styles.musicianCard,
                  selectedMusician === musician.id && styles.musicianCardSelected,
                ]}
                onPress={() => handleListingPress(musician)}
                activeOpacity={0.7}
              >
                <View style={styles.musicianCardContent}>
                  <View style={styles.musicianInfo}>
                    <Text style={styles.musicianName}>{musician.name}</Text>
                    <Text style={styles.musicianGenre}>Genre: {musician.genre}</Text>
                    {musician.isOfficial && (
                      <Text style={styles.officialBadge}>
                        Official SoundCheck Account
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewProfile(musician.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewButtonText}>VIEW</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  searchButton: {
    padding: 8,
  },
  radiusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  radiusLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 12,
  },
  radiusButtons: {
    flexDirection: "row",
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  radiusButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  radiusButtonText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  radiusButtonTextActive: {
    color: "#FFFFFF",
  },
  mapContainer: {
    height: 300,
    marginBottom: 20,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#374151",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  mapText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    zIndex: 1,
  },
  userMarker: {
    position: "absolute",
    top: "45%",
    left: "45%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  userMarkerCircle: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  musicianMarker: {
    position: "absolute",
    zIndex: 5,
  },
  musicianMarkerSelected: {
    zIndex: 15,
  },
  musicianMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#A855F7",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  musicianCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  musicianCardSelected: {
    borderColor: "#A855F7",
    backgroundColor: "#1F2937",
  },
  musicianCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  musicianInfo: {
    flex: 1,
  },
  musicianName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  musicianGenre: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  officialBadge: {
    fontSize: 12,
    color: "#A855F7",
    fontWeight: "500",
  },
  viewButton: {
    backgroundColor: "#A855F7",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 40,
  },
});
