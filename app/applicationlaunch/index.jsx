import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../components/Logo";

export default function ApplicationLaunchScreen() {
  useEffect(() => {
    // Navigate to login screen after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo />
        </View>
        <Text style={styles.tagline}>Music Anytime... Anywhere</Text>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 32,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
