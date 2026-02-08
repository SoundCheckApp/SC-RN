import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../components/Logo";
import { saveAccountType } from "../../utils/profile";

export default function SelectAccountTypeScreen() {
  const [selectedType, setSelectedType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSelectAccountType = async (accountType) => {
    setSelectedType(accountType);
    setError("");

    setIsSaving(true);

    try {
      // Save account type to user profile in Supabase
      const { error: saveError } = await saveAccountType(accountType);

      if (saveError) {
        setError(saveError.message || "Failed to save account type. Please try again.");
        setIsSaving(false);
        return;
      }

      // Navigate to main app after successful save
      router.replace("/(tabs)");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Save account type error:", err);
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Logo />
          <Text style={styles.title}>Select Account Type</Text>
          <Text style={styles.subtitle}>Choose the type of account you want to create</Text>
        </View>

        {/* Account Type Options */}
        <View style={styles.optionsContainer}>
          {/* Musician Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === "musician" && styles.optionCardSelected,
              isSaving && styles.optionCardDisabled,
            ]}
            onPress={() => handleSelectAccountType("musician")}
            activeOpacity={0.7}
            disabled={isSaving}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="musical-notes" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Musician</Text>
              <Text style={styles.optionDescription}>For artists and performers</Text>
            </View>
            {selectedType === "musician" && (
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
            )}
          </TouchableOpacity>

          {/* Music Consumer Option */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === "consumer" && styles.optionCardSelected,
              isSaving && styles.optionCardDisabled,
            ]}
            onPress={() => handleSelectAccountType("consumer")}
            activeOpacity={0.7}
            disabled={isSaving}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="headset" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Music Consumer</Text>
              <Text style={styles.optionDescription}>For music listeners and fans</Text>
            </View>
            {selectedType === "consumer" && (
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Back to Login Link */}
        <TouchableOpacity
          style={styles.backToLoginButton}
          onPress={() => router.push("/login")}
          activeOpacity={0.7}
          disabled={isSaving}
        >
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
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
    paddingVertical: 40,
    justifyContent: "space-between",
  },
  logoSection: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "400",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    marginVertical: 40,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardSelected: {
    borderColor: "#10B981",
    backgroundColor: "#1F2937",
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  checkmarkContainer: {
    marginLeft: 12,
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
  backToLoginButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  backToLoginText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
