import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { saveConsumerProfile } from "../../utils/consumer";

const GENRES = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Country",
  "Jazz",
  "Electronic",
  "Classical",
  "Folk",
  "Reggae",
  "Blues",
  "Metal",
  "Punk",
  "Indie",
  "Alternative",
  "Latin",
  "Gospel",
  "Soul",
  "Funk",
  "Disco",
  "World",
];

export default function MusicConsumerCreateAccountPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [birthday, setBirthday] = useState("");
  const [preferredGenre, setPreferredGenre] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load user email on mount
  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setEmail(user.email);
        }
      } catch (err) {
        console.error("Error loading user email:", err);
      }
    };
    loadUserEmail();
  }, []);

  const formatDate = (text) => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, "");
    
    // Format as mm/dd/yyyy
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  };

  const handleBirthdayChange = (text) => {
    const formatted = formatDate(text);
    if (formatted.length <= 10) {
      setBirthday(formatted);
    }
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!location.trim()) {
      setError("Location is required");
      return false;
    }
    if (!birthday.trim()) {
      setError("Birthday is required");
      return false;
    }
    if (birthday.length !== 10) {
      setError("Please enter a valid birthday (mm/dd/yyyy)");
      return false;
    }
    if (!preferredGenre) {
      setError("Please select a preferred genre");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password,
        username: username.trim(),
        location: location.trim(),
        birthday: birthday.trim(),
        preferredGenre: preferredGenre,
      };

      const { error: saveError } = await saveConsumerProfile(profileData);

      if (saveError) {
        setError(saveError.message || "Failed to save profile. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Navigate to music consumer homepage after successful save
      router.replace("/musicConsumerHomepage");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Save profile error:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Music Fan Profile</Text>
              <Text style={styles.subtitle}>Create your music consumer profile</Text>
            </View>

            {/* Profile Photo Upload */}
            <View style={styles.photoSection}>
              <TouchableOpacity style={styles.photoContainer} activeOpacity={0.7}>
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={32} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.photoLabel}>Upload Profile Photo</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              {/* First Name and Last Name - Side by Side */}
              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>First Name</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="John"
                      placeholderTextColor="#9CA3AF"
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        setError("");
                      }}
                      autoCapitalize="words"
                    />
                    <TouchableOpacity style={styles.inputIcon}>
                      <Ionicons name="ellipsis-vertical" size={20} color="#F97316" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Last Name</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Doe"
                      placeholderTextColor="#9CA3AF"
                      value={lastName}
                      onChangeText={(text) => {
                        setLastName(text);
                        setError("");
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError("");
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.inputIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#F97316"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Username */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="your_username"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setError("");
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Location */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Location</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="City, State"
                    placeholderTextColor="#9CA3AF"
                    value={location}
                    onChangeText={(text) => {
                      setLocation(text);
                      setError("");
                    }}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Birthday */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Birthday</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="mm/dd/yyyy"
                    placeholderTextColor="#9CA3AF"
                    value={birthday}
                    onChangeText={handleBirthdayChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  <TouchableOpacity style={styles.inputIcon}>
                    <Ionicons name="calendar" size={20} color="#F97316" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Preferred Genre */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Preferred Genre</Text>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  onPress={() => setShowGenreModal(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.input,
                      !preferredGenre && styles.placeholderText,
                    ]}
                  >
                    {preferredGenre || "Select"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#F97316" />
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Genre Selection Modal */}
      <Modal
        visible={showGenreModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Preferred Genre</Text>
              <TouchableOpacity
                onPress={() => setShowGenreModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={GENRES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.genreItem,
                    preferredGenre === item && styles.genreItemSelected,
                  ]}
                  onPress={() => {
                    setPreferredGenre(item);
                    setShowGenreModal(false);
                    setError("");
                  }}
                >
                  <Text
                    style={[
                      styles.genreText,
                      preferredGenre === item && styles.genreTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {preferredGenre === item && (
                    <Ionicons name="checkmark" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  content: {
    width: "100%",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 8,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  photoContainer: {
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#374151",
    borderWidth: 2,
    borderColor: "#6B7280",
    justifyContent: "center",
    alignItems: "center",
  },
  photoLabel: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  formSection: {
    width: "100%",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingVertical: 0,
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  inputIcon: {
    padding: 4,
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: "#6B7280",
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
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
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalCloseButton: {
    padding: 4,
  },
  genreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  genreItemSelected: {
    backgroundColor: "#1F2937",
  },
  genreText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  genreTextSelected: {
    color: "#10B981",
    fontWeight: "600",
  },
});
