import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { clearCredentials, loadCredentials, saveCredentials } from "../../utils/storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved credentials on mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const saved = await loadCredentials();
        if (saved.rememberMe) {
          setEmail(saved.email);
          setPassword(saved.password);
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedCredentials();
  }, []);

  const handleSignIn = async () => {
    // TODO: Implement actual authentication logic
    console.log("Sign in:", { email, password, rememberMe });
    
    // Save or clear credentials based on remember me
    if (rememberMe) {
      await saveCredentials(email, password);
      console.log("Credentials saved for quick access");
    } else {
      await clearCredentials();
      console.log("Credentials cleared");
    }
    
    // Navigate to main app after successful login
    // router.replace("/(tabs)");
  };

  const handleRememberMeToggle = () => {
    setRememberMe(!rememberMe);
    // If unchecking, clear saved credentials
    if (rememberMe) {
      clearCredentials();
    }
  };

  const handleForgotPassword = () => {
    router.push("/login/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/signup");
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
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Logo />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
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
                  <TouchableOpacity style={styles.inputIcon}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#F97316" />
                  </TouchableOpacity>
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

              {/* Remember Me Checkbox */}
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={handleRememberMeToggle}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color="#000" />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignIn}
                activeOpacity={0.8}
              >
                <Text style={styles.signInButtonText}>SIGN IN</Text>
              </TouchableOpacity>

              {/* Links Section */}
              <View style={styles.linksSection}>
                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                  <Text style={styles.forgotPasswordLink}>Forgot your password?</Text>
                </TouchableOpacity>
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
                    <Text style={styles.signUpLink}>Sign up</Text>
                  </TouchableOpacity>
                </View>
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
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#FFFFFF",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  signInButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  linksSection: {
    alignItems: "center",
  },
  forgotPasswordLink: {
    fontSize: 14,
    color: "#3B82F6",
    marginBottom: 16,
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  signUpLink: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
});
