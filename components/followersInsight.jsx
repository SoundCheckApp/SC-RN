import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function FollowersInsight() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>
        Followers insights coming soon
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
