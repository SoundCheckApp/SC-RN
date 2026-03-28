import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchConsumerReviewsGiven } from "../utils/consumerInsights";

function formatShortDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/** Consumer-only: reviews the user left on musicians. */
export default function ConsumerReviewsGivenSection({ consumerId }) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  const load = useCallback(async () => {
    if (!consumerId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { reviews: rows } = await fetchConsumerReviewsGiven(consumerId);
      setReviews(rows);
    } catch (e) {
      console.error("ConsumerReviewsGivenSection:", e);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [consumerId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Reviews Given</Text>
      <Text style={styles.count}>
        {loading ? "…" : `${reviews.length} total`}
      </Text>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" style={styles.loader} />
      ) : reviews.length === 0 ? (
        <Text style={styles.empty}>No reviews yet.</Text>
      ) : (
        reviews.slice(0, 20).map((r) => (
          <View key={r.id} style={styles.row}>
            <Text style={styles.stars}>{"★".repeat(r.rating || 0)}</Text>
            <View style={styles.rowText}>
              <Text style={styles.preview} numberOfLines={2}>
                {r.review_text?.trim() || "(No text)"}
              </Text>
              <Text style={styles.date}>{formatShortDate(r.created_at)}</Text>
            </View>
          </View>
        ))
      )}
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  count: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 16,
  },
  loader: {
    marginVertical: 24,
  },
  empty: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 32,
  },
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 12,
    paddingBottom: 8,
  },
  stars: {
    fontSize: 12,
    color: "#FBBF24",
    width: 72,
    marginTop: 2,
  },
  rowText: {
    flex: 1,
  },
  preview: {
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
