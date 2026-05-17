import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NearbyMusiciansMap from "../../components/NearbyMusiciansMap";
import {
  formatLiveMusicianForUI,
  getNearbyLiveMusicians,
} from "../../utils/consumer";
import { getCurrentCoordinates } from "../../utils/location";

export default function MusicConsumerHomepage() {
  const [radius, setRadius] = useState(5);
  const [nearbyMusicians, setNearbyMusicians] = useState([]);
  const [selectedMusician, setSelectedMusician] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef(null);

  const loadNearbyMusicians = useCallback(async () => {
    setIsLoading(true);
    setLocationError(null);

    try {
      const { coords, error: locError } = await getCurrentCoordinates();
      if (locError || !coords) {
        setUserLocation(null);
        setNearbyMusicians([]);
        setLocationError(locError?.message ?? "Location unavailable.");
        return;
      }

      setUserLocation(coords);

      const { musicians, error } = await getNearbyLiveMusicians(
        coords.latitude,
        coords.longitude,
        radius
      );

      if (error) {
        console.error("getNearbyLiveMusicians:", error);
        if (
          error.message?.includes("latitude") ||
          error.message?.includes("is_live") ||
          error.code === "42703"
        ) {
          setLocationError(
            "Map database is not ready. Run supabase_musicians_live_location.sql in Supabase."
          );
        } else {
          setLocationError(error.message ?? "Could not load nearby musicians.");
        }
        setNearbyMusicians([]);
        return;
      }

      setNearbyMusicians(musicians.map(formatLiveMusicianForUI));
    } catch (error) {
      console.error("Error loading nearby musicians:", error);
      setLocationError("Something went wrong loading nearby musicians.");
    } finally {
      setIsLoading(false);
    }
  }, [radius]);

  useEffect(() => {
    loadNearbyMusicians();
  }, [loadNearbyMusicians]);

  const handleMarkerPress = ({ id }) => {
    setSelectedMusician(id);
    const index = nearbyMusicians.findIndex((m) => m.id === id);
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

  const handleRetryLocation = () => {
    loadNearbyMusicians();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Nearby Musicians</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

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

        <View style={styles.mapContainer}>
          {locationError ? (
            <View style={styles.locationErrorBox}>
              <Text style={styles.locationErrorText}>{locationError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetryLocation}
              >
                <Text style={styles.retryButtonText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <NearbyMusiciansMap
              userLocation={userLocation}
              musicians={nearbyMusicians}
              radiusMiles={radius}
              selectedMusicianId={selectedMusician}
              onMarkerPress={handleMarkerPress}
            />
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>Loading nearby musicians...</Text>
          ) : locationError ? null : nearbyMusicians.length === 0 ? (
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
                    <Text style={styles.musicianGenre}>
                      Genre: {musician.genre || "—"}
                    </Text>
                    {musician.distance != null && (
                      <Text style={styles.distanceText}>
                        {musician.distance.toFixed(1)} mi away
                      </Text>
                    )}
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
  locationErrorBox: {
    flex: 1,
    backgroundColor: "#374151",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  locationErrorText: {
    fontSize: 14,
    color: "#FCA5A5",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
  distanceText: {
    fontSize: 12,
    color: "#6B7280",
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
