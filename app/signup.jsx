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
import Logo from "../components/Logo";
import { supabase } from "../lib/supabase";
import { signUp } from "../utils/auth";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Check if user is already signed in on mount
  // Only redirect if they have a complete profile
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Check if user has a complete profile
          const { checkUserProfile } = await import("../utils/profile");
          const { hasProfile, accountType } = await checkUserProfile();
          
          if (hasProfile) {
            // User has a complete profile, navigate to appropriate homepage
            if (accountType === "musician") {
              router.replace("/musicianHomepage");
            } else if (accountType === "consumer") {
              router.replace("/musicConsumerHomepage");
            } else {
              // Has session but no profile type, go to account type selection
              router.replace("/selectAccountType");
            }
          }
          // If no profile, stay on signup page - user might want to sign out first
        }
        // If no session, show the signup form normally
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    checkSession();
  }, []);

  const handleSignUp = async () => {
    // Validate inputs
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsSigningUp(true);
    setError("");

    try {
      // Check if there's an existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // If session exists, validate it and handle appropriately
      if (session && session.user) {
        const sessionEmail = session.user?.email?.toLowerCase();
        const signupEmail = email.trim().toLowerCase();
        
        // If the session email doesn't match the signup email, sign out automatically
        if (sessionEmail && sessionEmail !== signupEmail) {
          console.log("Session exists for different email, signing out to allow new signup...");
          await supabase.auth.signOut();
        } else if (sessionEmail === signupEmail) {
          // Same email - check if user actually has a complete profile in database
          try {
            const { checkUserProfile } = await import("../utils/profile");
            const { hasProfile } = await checkUserProfile();
            
            if (hasProfile) {
              // User has a complete profile - they should sign in instead
              setError("An account with this email already exists. Please sign in instead.");
              setIsSigningUp(false);
              return;
            }
            // If no profile exists, this might be a stale/incomplete signup
            // Sign out and allow fresh signup to proceed
            console.log("Session exists but no profile found, signing out to allow fresh signup...");
            await supabase.auth.signOut();
          } catch (profileError) {
            // If profile check fails, sign out and proceed with signup
            console.log("Error checking profile, signing out to allow signup...", profileError);
            await supabase.auth.signOut();
          }
        } else {
          // Session exists but email is missing or invalid - sign out
          console.log("Invalid session detected, signing out...");
          await supabase.auth.signOut();
        }
      } else if (sessionError) {
        // If there's an error getting the session, try to clear it
        console.log("Error getting session, attempting to clear...", sessionError);
        await supabase.auth.signOut();
      }

      // Sign up with Supabase
      const { user, error: authError, needsConfirmation } = await signUp(email.trim(), password, name.trim());

      if (authError) {
        // Check if the error is "user already exists"
        const isUserExistsError = 
          authError.message?.toLowerCase().includes("already exists") ||
          authError.message?.toLowerCase().includes("already registered") ||
          authError.code === "user_already_exists" ||
          authError.status === 422;

        if (isUserExistsError) {
          // User exists in Supabase Auth - try to sign them in
          // They might have started signup but didn't complete profile
          console.log("User already exists in Auth, attempting sign-in...");
          const { signIn } = await import("../utils/auth");
          const { user: signedInUser, error: signInError } = await signIn(email.trim(), password);

          if (signInError) {
            // Sign-in failed - wrong password or other issue
            setError("An account with this email already exists. Please sign in with your password or reset it if you forgot.");
            setIsSigningUp(false);
            return;
          }

          // Sign-in successful - check if they have a profile
          if (signedInUser) {
            const { checkUserProfile } = await import("../utils/profile");
            const { hasProfile, accountType } = await checkUserProfile();

            if (hasProfile) {
              // User has a complete profile - navigate to their homepage
              if (accountType === "musician") {
                router.replace("/musicianHomepage");
              } else if (accountType === "consumer") {
                router.replace("/musicConsumerHomepage");
              } else {
                router.replace("/selectAccountType");
              }
              setIsSigningUp(false);
              return;
            } else {
              // User signed in but no profile - navigate to account type selection
              console.log("User signed in successfully but no profile found, navigating to account type selection...");
              router.replace("/selectAccountType");
              setIsSigningUp(false);
              return;
            }
          }
        }

        // For other errors, show the error message
        console.log("Signup error details:", authError);
        setError(authError.message || "Failed to create account. Please try again.");
        setIsSigningUp(false);
        return;
      }

      // Signup was successful - navigate to account type selection
      // Even if email confirmation is required (user might be null), we still proceed
      // The account was created successfully in Supabase Auth
      console.log("Signup successful, navigating to account type selection");
      router.replace("/selectAccountType");
    } catch (err) {
      console.error("Sign up exception:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSigningUp(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        enabled={Platform.OS === "ios"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={false}
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
                <View style={[styles.inputWrapper, nameFocused && styles.inputWrapperFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setError("");
                    }}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    clearButtonMode="never"
                    editable={true}
                    selectTextOnFocus={false}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError("");
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    clearButtonMode="never"
                    editable={true}
                    selectTextOnFocus={false}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError("");
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType={Platform.OS === "ios" ? "newPassword" : "none"}
                    autoComplete={Platform.OS === "android" ? "password-new" : "off"}
                    keyboardType="default"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    clearButtonMode="never"
                    editable={true}
                    selectTextOnFocus={false}
                  />
                  <TouchableOpacity
                    style={styles.inputIconButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#F97316"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputWrapper, confirmPasswordFocused && styles.inputWrapperFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setError("");
                    }}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType={Platform.OS === "ios" ? "newPassword" : "none"}
                    autoComplete={Platform.OS === "android" ? "password-new" : "off"}
                    keyboardType="default"
                    returnKeyType="done"
                    clearButtonMode="never"
                    editable={true}
                    selectTextOnFocus={false}
                  />
                  <TouchableOpacity
                    style={styles.inputIconButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={22}
                      color="#F97316"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButton, isSigningUp && styles.signUpButtonDisabled]}
                onPress={handleSignUp}
                activeOpacity={0.8}
                disabled={isSigningUp}
              >
                <Text style={styles.signUpButtonText}>
                  {isSigningUp ? "CREATING ACCOUNT..." : "SIGN UP"}
                </Text>
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
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: "#000000",
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
    borderWidth: 2,
    borderColor: "#FFFFFF",
    minHeight: 52,
    overflow: "hidden",
  },
  inputWrapperFocused: {
    borderColor: "#4F46E5",
    backgroundColor: "#FFFFFF",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingVertical: 14,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    minHeight: 20,
    height: "100%",
  },
  inputIconButton: {
    padding: 8,
    marginLeft: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
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
  signUpButtonDisabled: {
    backgroundColor: "#6B7280",
    opacity: 0.6,
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
