import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ReviewsInsight() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>
        Reviews insights coming soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
