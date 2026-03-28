import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

/** Consumer-only: total tips given in the selected period. */
export default function ConsumerTipsSummaryCard({ total, loading }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.dollar}>$</Text>
        <View style={styles.textCol}>
          <Text style={styles.label}>Total Tips Given</Text>
          {loading ? (
            <ActivityIndicator color="#22C55E" style={styles.loader} />
          ) : (
            <Text style={styles.amount}>${Number(total).toFixed(2)}</Text>
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
  dollar: {
    fontSize: 44,
    fontWeight: "800",
    color: "#22C55E",
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
