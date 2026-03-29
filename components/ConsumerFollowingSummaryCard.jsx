import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

/** Consumer-only: count of followed musicians for the active sort. */
export default function ConsumerFollowingSummaryCard({ total, loading }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="star-outline" size={40} color="#3B82F6" style={styles.star} />
        <View style={styles.textCol}>
          <Text style={styles.label}>Musicians Following</Text>
          {loading ? (
            <ActivityIndicator color="#3B82F6" style={styles.loader} />
          ) : (
            <Text style={styles.amount}>{total}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 16,
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loader: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
});
