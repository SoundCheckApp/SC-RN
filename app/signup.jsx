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
import Logo from "../components/Logo";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = () => {
    // TODO: Implement sign up logic
    console.log("Sign up:", { name, email, password });
    
    // Validate passwords match
    if (password !== confirmPassword) {
      // TODO: Show error message
      console.log("Passwords do not match");
      return;
    }
    
    // Navigate to login or main app after successful signup
    // router.replace("/login");
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Name Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>

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

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={setPassword}
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

              {/* Confirm Password Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#6B7280"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.inputIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#F97316"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}
                activeOpacity={0.8}
              >
                <Text style={styles.signUpButtonText}>SIGN UP</Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")} activeOpacity={0.7}>
                  <Text style={styles.loginLink}>Sign in</Text>
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
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "400",
  },
  formSection: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
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
  inputIcon: {
    padding: 4,
  },
  signUpButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  loginLink: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
});
