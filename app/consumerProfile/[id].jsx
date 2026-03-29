import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getConsumerProfileById } from "../../utils/consumer";

export default function ConsumerProfileScreen() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { profile: p, error } = await getConsumerProfileById(id);
      if (error || !p) {
        console.warn("Consumer profile:", error?.message);
        setProfile(null);
        return;
      }
      setProfile(p);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Profile not found</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={56} color="#9CA3AF" />
            </View>
          )}
        </View>

        <Text style={styles.displayName}>{profile.displayName}</Text>
        {profile.username ? (
          <Text style={styles.username}>@{profile.username}</Text>
        ) : null}

        {profile.location ? (
          <Text style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#9CA3AF" />{" "}
            {profile.location}
          </Text>
        ) : null}

        {profile.preferredGenre ? (
          <Text style={styles.metaRow}>
            Preferred genre: {profile.preferredGenre}
          </Text>
        ) : null}

        <View style={styles.bioSection}>
          <Text style={styles.bioLabel}>Bio</Text>
          <Text style={styles.bioText}>
            {profile.bio?.trim() || "No bio yet."}
          </Text>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 4,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 12,
  },
  metaRow: {
    fontSize: 15,
    color: "#D1D5DB",
    textAlign: "center",
    marginBottom: 8,
  },
  bioSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
  },
  errorText: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 16,
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    color: "#A855F7",
    fontSize: 16,
    fontWeight: "600",
  },
});
