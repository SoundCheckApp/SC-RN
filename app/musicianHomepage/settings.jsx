import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
  ageFromBirthday,
  formatBirthdayDisplay,
  getMusicianAccountForSettings,
  updateMusicianEditableAccount,
  uploadMusicianAvatar,
} from "../../utils/musician";

function ReadOnlySuffix() {
  return (
    <Ionicons name="lock-closed" size={18} color="#EF4444" style={styles.lockIcon} />
  );
}

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [userId, setUserId] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [artistName, setArtistName] = useState("");
  const [location, setLocation] = useState("");
  const [genre, setGenre] = useState("");
  const [bio, setBio] = useState("");
  const [birthdayDisplay, setBirthdayDisplay] = useState("");
  const [ageDisplay, setAgeDisplay] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data, error } = await getMusicianAccountForSettings();
      if (error || !data) {
        console.warn("Account settings load:", error?.message);
        return;
      }

      setFirstName(data.first_name ?? "");
      setLastName(data.last_name ?? "");
      setEmail(data.email ?? "");
      setUsername(data.username ?? "");
      setArtistName(data.artist_name ?? "");
      setLocation(data.location ?? "");
      setGenre((data.genres ?? "").trim());
      setBio(data.bio ?? "");
      setAvatarUrl(data.avatar_url ?? null);

      const b = data.birthday;
      setBirthdayDisplay(formatBirthdayDisplay(b));
      const computed = ageFromBirthday(b);
      setAgeDisplay(
        computed != null ? String(computed) : data.age != null ? String(data.age) : ""
      );
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
      router.replace("/musicianHomepage");
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
            "Could not upload photo. Create a public Storage bucket named \"avatars\" in Supabase (or check policies)."
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
      const { error } = await updateMusicianEditableAccount({
        email,
        username,
        artistName,
        location,
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
    router.push(`/musicianProfile/${userId}`);
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

          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputDisabled, styles.inputFlex]}
              value={firstName}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
            <ReadOnlySuffix />
          </View>

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={lastName}
            editable={false}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputEditable]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
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

          <Text style={styles.label}>Artist Name</Text>
          <TextInput
            style={[styles.input, styles.inputEditable]}
            value={artistName}
            onChangeText={setArtistName}
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={[styles.input, styles.inputEditable]}
            value={location}
            onChangeText={setLocation}
            placeholderTextColor="#6B7280"
          />

          <Text style={styles.label}>Genre</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={genre}
            editable={false}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.inputEditable, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="Insert Bio"
            placeholderTextColor="#6B7280"
            textAlignVertical="top"
          />

          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>Profile Information</Text>

          <View style={styles.rowTwo}>
            <View style={styles.half}>
              <Text style={styles.label}>Birthday</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={birthdayDisplay}
                editable={false}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={ageDisplay}
                editable={false}
              />
            </View>
          </View>
          <Text style={styles.helperMuted}>These fields cannot be changed</Text>

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
            style={[styles.btn, styles.btnPreview]}
            onPress={handlePreview}
            activeOpacity={0.85}
          >
            <Ionicons name="eye-outline" size={22} color="#3B82F6" />
            <Text style={styles.btnPreviewText}>Preview Artist Profile</Text>
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
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    zIndex: 0,
    pointerEvents: "none",
  },
  topBarSpacer: {
    minWidth: 88,
  },
  avatarBlock: {
    alignItems: "center",
    marginBottom: 28,
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
  inputDisabled: {
    backgroundColor: "#2C2C2E",
    color: "#FFFFFF",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  inputFlex: {
    flex: 1,
    marginBottom: 0,
  },
  lockIcon: {},
  bioInput: {
    minHeight: 120,
    paddingTop: Platform.OS === "ios" ? 14 : 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  rowTwo: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  helperMuted: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    marginBottom: 24,
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
    borderColor: "#3B82F6",
  },
  btnPreviewText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#3B82F6",
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
});
