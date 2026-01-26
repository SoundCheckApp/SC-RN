import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import Logo from "../../components/Logo";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    // TODO: Implement password reset logic
    console.log("Reset password for:", email);
    // Show success message and navigate back
    router.back();
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
            </TouchableOpacity>

            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Logo />
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Email Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                activeOpacity={0.8}
              >
                <Text style={styles.resetButtonText}>SEND RESET LINK</Text>
              </TouchableOpacity>

              {/* Back to Login */}
              <View style={styles.backToLoginContainer}>
                <Text style={styles.backToLoginText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                  <Text style={styles.backToLoginLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: "100%",
  },
  backButton: {
    marginBottom: 24,
    padding: 8,
    alignSelf: "flex-start",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
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
  formSection: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
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
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingVertical: 0,
  },
  resetButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  backToLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backToLoginText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  backToLoginLink: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
});
