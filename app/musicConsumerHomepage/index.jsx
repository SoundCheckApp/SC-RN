import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NearbyMusiciansMap from "../../components/NearbyMusiciansMap";
import { getNearbyLiveMusicians } from "../../utils/consumer";
import { getCurrentCoordinates } from "../../utils/location";
import {
  probeMusicianDiscoveryAccess,
  searchMusicians,
} from "../../utils/musicianDiscovery";

function MusicianCard({ musician, selected, onSelect, onViewProfile }) {
  return (
    <TouchableOpacity
      style={[styles.musicianCard, selected && styles.musicianCardSelected]}
      onPress={() => onSelect(musician)}
      activeOpacity={0.7}
    >
      <View style={styles.musicianCardContent}>
        <View style={styles.musicianInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.musicianName}>{musician.name}</Text>
            {musician.isLive && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            )}
          </View>
          {musician.genre ? (
            <Text style={styles.musicianGenre}>Genre: {musician.genre}</Text>
          ) : null}
          {musician.location ? (
            <Text style={styles.musicianLocation}>{musician.location}</Text>
          ) : null}
          {musician.distance != null && (
            <Text style={styles.distanceText}>
              {musician.distance.toFixed(1)} mi away
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onViewProfile(musician.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewButtonText}>VIEW</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function MusicConsumerHomepage() {
  const [radius, setRadius] = useState(5);
  const [nearbyMusicians, setNearbyMusicians] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingNearby, setIsLoadingNearby] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchAccessHint, setSearchAccessHint] = useState(null);
  const scrollViewRef = useRef(null);

  const loadNearbyMusicians = useCallback(async () => {
    setIsLoadingNearby(true);
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

      setNearbyMusicians(musicians);
    } catch (error) {
      console.error("Error loading nearby musicians:", error);
      setLocationError("Something went wrong loading nearby musicians.");
    } finally {
      setIsLoadingNearby(false);
    }
  }, [radius]);

  useEffect(() => {
    loadNearbyMusicians();
  }, [loadNearbyMusicians]);

  useEffect(() => {
    if (!searchOpen) return;

    probeMusicianDiscoveryAccess().then(({ error, hint }) => {
      if (error) {
        setSearchAccessHint(
          error.message || "Could not verify musician search access."
        );
      } else {
        setSearchAccessHint(hint);
      }
    });
  }, [searchOpen]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    const timer = setTimeout(async () => {
      const { musicians, error } = await searchMusicians(q);
      if (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setSearchError(
          error.message ||
            "Search failed. Check Metro logs and Supabase RLS policies."
        );
      } else {
        setSearchResults(musicians);
        setSearchError(null);
        if (musicians.length === 0 && !searchAccessHint) {
          const { hint } = await probeMusicianDiscoveryAccess();
          if (hint) setSearchAccessHint(hint);
        }
      }
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const showSearchResults = searchQuery.trim().length >= 2;

  const handleRetryLocation = () => {
    loadNearbyMusicians();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover Musicians</Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setSearchOpen((v) => !v)}
          >
            <Ionicons
              name={searchOpen ? "close" : "search"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {searchOpen && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, genre, or location..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.radiusContainer}>
          <Text style={styles.radiusLabel}>Nearby radius:</Text>
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
          keyboardShouldPersistTaps="handled"
        >
          {showSearchResults && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {searchAccessHint ? (
                <Text style={styles.hintText}>{searchAccessHint}</Text>
              ) : null}
              {searchError ? (
                <Text style={styles.errorText}>{searchError}</Text>
              ) : null}
              {isSearching ? (
                <ActivityIndicator color="#A855F7" style={styles.loader} />
              ) : searchResults.length === 0 ? (
                <Text style={styles.emptyText}>
                  No musicians match &quot;{searchQuery.trim()}&quot;
                </Text>
              ) : (
                searchResults.map((musician) => (
                  <MusicianCard
                    key={`search-${musician.id}`}
                    musician={musician}
                    selected={selectedMusician === musician.id}
                    onSelect={(m) => setSelectedMusician(m.id)}
                    onViewProfile={handleViewProfile}
                  />
                ))
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearby Live</Text>
            {isLoadingNearby ? (
              <ActivityIndicator color="#A855F7" style={styles.loader} />
            ) : locationError ? (
              <Text style={styles.emptyText}>{locationError}</Text>
            ) : nearbyMusicians.length === 0 ? (
              <Text style={styles.emptyText}>
                No live musicians within {radius} miles
              </Text>
            ) : (
              nearbyMusicians.map((musician) => (
                <MusicianCard
                  key={`nearby-${musician.id}`}
                  musician={musician}
                  selected={selectedMusician === musician.id}
                  onSelect={(m) => setSelectedMusician(m.id)}
                  onViewProfile={handleViewProfile}
                />
              ))
            )}
          </View>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  radiusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  radiusLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 4,
  },
  radiusButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
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
    height: 220,
    marginBottom: 16,
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
    paddingHorizontal: 16,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
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
  },
  musicianCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  musicianInfo: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  musicianName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  liveBadge: {
    backgroundColor: "#DC2626",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  musicianGenre: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  musicianLocation: {
    fontSize: 13,
    color: "#6B7280",
  },
  distanceText: {
    fontSize: 13,
    color: "#A855F7",
    marginTop: 4,
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
  loader: {
    marginTop: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 16,
  },
  hintText: {
    fontSize: 14,
    color: "#F59E0B",
    marginBottom: 12,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#F87171",
    marginBottom: 12,
    lineHeight: 20,
  },
});
