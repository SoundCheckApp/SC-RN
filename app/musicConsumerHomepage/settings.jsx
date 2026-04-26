import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { signOut } from "../../utils/auth";
import {
  CONSUMER_BIO_MAX_LENGTH,
  CONSUMER_GENRE_OPTIONS,
  CONSUMER_MAX_GENRE_PICKS,
  getConsumerAccountForSettings,
  parsePreferredGenresFromStorage,
  serializePreferredGenres,
  updateConsumerEditableAccount,
} from "../../utils/consumer";
import { uploadMusicianAvatar } from "../../utils/musician";

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showGenreModal, setShowGenreModal] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data, error } = await getConsumerAccountForSettings();
      if (error || !data) {
        console.warn("Consumer account settings load:", error?.message);
        setEmail(user?.email ?? "");
        return;
      }

      setFirstName(data.first_name ?? "");
      setLastName(data.last_name ?? "");
      setEmail(data.email ?? "");
      setUsername(data.username ?? "");
      setLocation(data.location ?? "");
      setSelectedGenres(parsePreferredGenresFromStorage(data.preferred_genre));
      setBio(data.bio ?? "");
      setAvatarUrl(data.avatar_url ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/musicConsumerHomepage");
    }
  };

  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to change your profile photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    setUploadingPhoto(true);
    try {
      const { avatarUrl: url, error } = await uploadMusicianAvatar(
        result.assets[0].uri
      );
      if (error) {
        Alert.alert(
          "Upload failed",
          error.message ??
            'Could not upload photo. Ensure a public Storage bucket named "avatars" exists in Supabase.'
        );
        return;
      }
      if (url) setAvatarUrl(url);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateConsumerEditableAccount({
        email: email.trim(),
        username,
        location,
        preferredGenre: serializePreferredGenres(selectedGenres),
        bio,
      });
      if (error) {
        Alert.alert("Could not save", error.message ?? "Please try again.");
        return;
      }
      Alert.alert("Saved", "Your account changes were saved.");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!userId) return;
    router.push(`/consumerProfile/${userId}`);
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert("Error", error.message ?? "Could not log out.");
            return;
          }
          router.replace("/login");
        },
      },
    ]);
  };

  const onBioChange = (text) => {
    if (text.length <= CONSUMER_BIO_MAX_LENGTH) setBio(text);
  };

  const toggleGenre = (g) => {
    setSelectedGenres((prev) => {
      if (prev.includes(g)) {
        return prev.filter((x) => x !== g);
      }
      if (prev.length >= CONSUMER_MAX_GENRE_PICKS) {
        Alert.alert(
          "Limit reached",
          `You can select up to ${CONSUMER_MAX_GENRE_PICKS} genres.`
        );
        return prev;
      }
      return [...prev, g];
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator color="#FFFFFF" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleBack}
              hitSlop={12}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Account</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <TouchableOpacity
            style={styles.avatarBlock}
            onPress={handlePickAvatar}
            disabled={uploadingPhoto}
            activeOpacity={0.8}
          >
            <View style={styles.avatarRing}>
              {uploadingPhoto ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="camera" size={48} color="#9CA3AF" />
              )}
            </View>
            <Text style={styles.uploadLabel}>Upload Profile Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnPreview]}
            onPress={handlePreview}
            activeOpacity={0.85}
          >
            <Ionicons name="eye-outline" size={22} color="#A855F7" />
            <Text style={styles.btnPreviewText}>Preview Profile Page</Text>
          </TouchableOpacity>

          <View style={styles.rowTwo}>
            <View style={styles.half}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, styles.inputReadOnly]}
                value={firstName}
                editable={false}
                selectTextOnFocus={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, styles.inputReadOnly]}
                value={lastName}
                editable={false}
                selectTextOnFocus={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputEditable]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="your@email.com"
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, styles.inputEditable]}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={[styles.input, styles.inputEditable]}
            value={location}
            onChangeText={setLocation}
            placeholder="City, State"
            placeholderTextColor="#6B7280"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Preferred Genres</Text>
          <Text style={styles.genreHint}>
            Up to {CONSUMER_MAX_GENRE_PICKS} — tap to add or remove
          </Text>
          <TouchableOpacity
            style={[styles.input, styles.genreTrigger]}
            onPress={() => setShowGenreModal(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.genreTriggerText,
                selectedGenres.length === 0 && styles.genrePlaceholder,
              ]}
              numberOfLines={2}
            >
              {selectedGenres.length
                ? selectedGenres.join(", ")
                : "Select up to 3 genres"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.inputEditable, styles.bioInput]}
            value={bio}
            onChangeText={onBioChange}
            multiline
            placeholder="Insert Music Consumer bio"
            placeholderTextColor="#6B7280"
            textAlignVertical="top"
            maxLength={CONSUMER_BIO_MAX_LENGTH}
          />
          <Text style={styles.bioCounter}>
            {bio.length}/{CONSUMER_BIO_MAX_LENGTH} characters
          </Text>

          <TouchableOpacity
            style={[styles.btn, styles.btnSave]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.btnSaveText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnLogout]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.btnLogoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showGenreModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderCol}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalTitleBlock}>
                  <Text style={styles.modalTitle}>Preferred Genres</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedGenres.length}/{CONSUMER_MAX_GENRE_PICKS} selected
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowGenreModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={CONSUMER_GENRE_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = selectedGenres.includes(item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.genreItem,
                      selected && styles.genreItemSelected,
                    ]}
                    onPress={() => toggleGenre(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.genreItemInner}>
                      <Ionicons
                        name={selected ? "checkmark-circle" : "ellipse-outline"}
                        size={22}
                        color={selected ? "#A855F7" : "#9CA3AF"}
                      />
                      <Text
                        style={[
                          styles.genreText,
                          selected && styles.genreTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    paddingTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    minHeight: 44,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    zIndex: 1,
    minWidth: 88,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    pointerEvents: "none",
  },
  topBarSpacer: {
    minWidth: 88,
  },
  avatarBlock: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  uploadLabel: {
    marginTop: 12,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    marginBottom: 16,
  },
  inputEditable: {
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  inputReadOnly: {
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
  },
  genreHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: -4,
    marginBottom: 8,
  },
  rowTwo: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 0,
  },
  half: {
    flex: 1,
  },
  genreTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  genreTriggerText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  genrePlaceholder: {
    color: "#6B7280",
  },
  bioInput: {
    minHeight: 120,
    paddingTop: Platform.OS === "ios" ? 14 : 10,
    marginBottom: 8,
  },
  bioCounter: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: -8,
    marginBottom: 20,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  btnSave: {
    backgroundColor: "#FFFFFF",
  },
  btnSaveText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  btnPreview: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#A855F7",
  },
  btnPreviewText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#A855F7",
  },
  btnLogout: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  btnLogoutText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#EF4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1F2937",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 40,
  },
  modalHeaderCol: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalTitleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalCloseButton: {
    padding: 4,
  },
  genreItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  genreItemInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  genreItemSelected: {
    backgroundColor: "#E5E7EB",
  },
  genreText: {
    fontSize: 16,
    color: "#FFFFFF",
    flex: 1,
  },
  genreTextSelected: {
    color: "#000000",
    fontWeight: "600",
  },
});
