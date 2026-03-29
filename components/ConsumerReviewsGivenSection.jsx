import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  fetchConsumerReviewsGiven,
  parseReviewsFilterStars,
} from "../utils/consumerInsights";
import ConsumerReviewsFilterDropdown from "./ConsumerReviewsFilterDropdown";
import ConsumerReviewsSummaryCard from "./ConsumerReviewsSummaryCard";

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

/** Consumer-only: reviews the user left on musicians (filter + summary + list). */
export default function ConsumerReviewsGivenSection({ consumerId }) {
  const [filter, setFilter] = useState("All Reviews");
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

  const starsFilter = parseReviewsFilterStars(filter);
  const filtered = useMemo(() => {
    if (starsFilter == null) return reviews;
    return reviews.filter((r) => Number(r.rating) === starsFilter);
  }, [reviews, starsFilter]);

  const displayList = filtered;

  return (
    <>
      <View style={styles.filterCard}>
        <ConsumerReviewsFilterDropdown selected={filter} onSelect={setFilter} />
      </View>

      <ConsumerReviewsSummaryCard total={filtered.length} loading={loading} />

      <View style={styles.listCard}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" style={styles.loader} />
        ) : displayList.length === 0 ? (
          <Text style={styles.empty}>No reviews found</Text>
        ) : (
          displayList.map((r, i) => (
            <View
              key={r.id}
              style={[styles.row, i > 0 && styles.rowDivider]}
            >
              <Text style={styles.starLine}>{"★".repeat(r.rating || 0)}</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  listCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    minHeight: 120,
  },
  loader: {
    marginVertical: 32,
  },
  empty: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 32,
  },
  row: {
    flexDirection: "row",
    paddingTop: 12,
    paddingBottom: 8,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  starLine: {
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
