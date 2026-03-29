import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

/** Consumer-only: total reviews matching the active star filter. */
export default function ConsumerReviewsSummaryCard({ total, loading }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="star-outline" size={40} color="#FBBF24" style={styles.star} />
        <View style={styles.textCol}>
          <Text style={styles.label}>Total Reviews Given</Text>
          {loading ? (
            <ActivityIndicator color="#FBBF24" style={styles.loader} />
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
