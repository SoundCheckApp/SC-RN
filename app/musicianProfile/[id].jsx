import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  followMusician,
  isFollowingMusician,
  unfollowMusician,
} from "../../utils/follows";
import { getMusicianProfileById } from "../../utils/musician";

export default function MusicianProfileScreen() {
  const { id } = useLocalSearchParams();
  const musicianId = Array.isArray(id) ? id[0] : id;

  const [musician, setMusician] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const loadFollowState = useCallback(async () => {
    const { following } = await isFollowingMusician(musicianId);
    setIsFollowing(following);
  }, [musicianId]);

  const loadMusicianProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const { profile, error } = await getMusicianProfileById(musicianId);

      if (error || !profile) {
        console.error("Error loading musician profile:", error);
        setMusician(null);
      } else {
        setMusician(profile);
      }
    } catch (error) {
      console.error("Error:", error);
      setMusician(null);
    } finally {
      setIsLoading(false);
    }
  }, [musicianId]);

  useEffect(() => {
    loadMusicianProfile();
    loadFollowState();
  }, [loadMusicianProfile, loadFollowState]);

  const handleToggleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await unfollowMusician(musicianId);
        if (error) {
          Alert.alert("Unfollow failed", error.message || "Please try again.");
          return;
        }
        setIsFollowing(false);
      } else {
        const { error } = await followMusician(musicianId);
        if (error) {
          Alert.alert(
            "Follow failed",
            error.message || "Sign in as a consumer to follow musicians."
          );
          return;
        }
        setIsFollowing(true);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A855F7" />
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
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.photoSection}>
          {musician.avatar_url ? (
            <Image source={{ uri: musician.avatar_url }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="musical-notes" size={48} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.artistName}>
            {musician.artistName || musician.name}
          </Text>
          {musician.genre ? (
            <Text style={styles.genre}>Genre: {musician.genre}</Text>
          ) : null}
          {musician.location ? (
            <Text style={styles.location}>
              <Ionicons name="location" size={16} color="#9CA3AF" />{" "}
              {musician.location}
            </Text>
          ) : null}

          {musician.bio ? (
            <View style={styles.bioSection}>
              <Text style={styles.bioLabel}>Bio</Text>
              <Text style={styles.bioText}>{musician.bio}</Text>
            </View>
          ) : null}

          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.tipButton} activeOpacity={0.8}>
              <Ionicons name="heart" size={20} color="#FFFFFF" />
              <Text style={styles.tipButtonText}>Send Tip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followButtonActive,
              ]}
              activeOpacity={0.8}
              onPress={handleToggleFollow}
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={isFollowing ? "checkmark-circle" : "add-circle"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.followButtonText}>
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </>
              )}
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
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
  },
  backLink: {
    marginTop: 8,
    padding: 8,
  },
  backLinkText: {
    color: "#A855F7",
    fontSize: 16,
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
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#374151",
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
  followButtonActive: {
    backgroundColor: "#4B5563",
    borderWidth: 1,
    borderColor: "#A855F7",
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
