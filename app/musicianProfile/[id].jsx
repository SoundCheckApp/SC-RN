import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMusicianProfileById } from "../../utils/musician";

export default function MusicianProfileScreen() {
  const { id } = useLocalSearchParams();
  const [musician, setMusician] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMusicianProfile();
  }, [id]);

  const loadMusicianProfile = async () => {
    try {
      // TODO: Replace with actual API call
      const { profile, error } = await getMusicianProfileById(id);
      
      if (error) {
        console.error("Error loading musician profile:", error);
        // For now, use mock data
        setMusician({
          id,
          name: "Jazz Player",
          artistName: "Jazz Player",
          genre: "Jazz",
          bio: "Professional jazz musician performing in the area",
          location: "New York, NY",
        });
      } else {
        setMusician(profile);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!musician) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Musician not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoPlaceholder}>
            <Ionicons name="musical-notes" size={48} color="#9CA3AF" />
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoSection}>
          <Text style={styles.artistName}>{musician.artistName || musician.name}</Text>
          <Text style={styles.genre}>Genre: {musician.genre}</Text>
          <Text style={styles.location}>
            <Ionicons name="location" size={16} color="#9CA3AF" /> {musician.location}
          </Text>

          {/* Bio */}
          <View style={styles.bioSection}>
            <Text style={styles.bioLabel}>Bio</Text>
            <Text style={styles.bioText}>{musician.bio}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.tipButton} activeOpacity={0.8}>
              <Ionicons name="heart" size={20} color="#FFFFFF" />
              <Text style={styles.tipButtonText}>Send Tip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followButton} activeOpacity={0.8}>
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    alignSelf: "flex-start",
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#374151",
  },
  infoSection: {
    paddingHorizontal: 24,
  },
  artistName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  genre: {
    fontSize: 18,
    color: "#9CA3AF",
    marginBottom: 8,
    textAlign: "center",
  },
  location: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 24,
    textAlign: "center",
  },
  bioSection: {
    marginBottom: 32,
  },
  bioLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: "#D1D5DB",
    lineHeight: 24,
  },
  actionsSection: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  tipButton: {
    flex: 1,
    backgroundColor: "#A855F7",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  followButton: {
    flex: 1,
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
