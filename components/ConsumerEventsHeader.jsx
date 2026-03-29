import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/** Top bar for consumer My Events (Back + centered title). */
export default function ConsumerEventsHeader() {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/musicConsumerHomepage");
    }
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.backBtn} onPress={handleBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>My Events</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    minHeight: 44,
  },
  backBtn: {
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 88,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    pointerEvents: "none",
  },
  spacer: {
    minWidth: 88,
  },
});
