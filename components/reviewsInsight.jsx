import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import {
  fetchReviewsForMusician,
  reviewTimeLabelToKey,
} from "../utils/reviews";
import ReviewTimeFrameDropdown, {
  REVIEW_TIME_OPTIONS,
} from "./ReviewTimeFrameDropdown";

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

function StarRow({ value }) {
  return (
    <View
      style={styles.starRow}
      accessibilityRole="image"
      accessibilityLabel={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= value ? "star" : "star-outline"}
          size={16}
          color="#FBBF24"
        />
      ))}
    </View>
  );
}

export default function ReviewsInsight() {
  const [timeLabel, setTimeLabel] = useState(
    REVIEW_TIME_OPTIONS[1]
  );
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRows([]);
        return;
      }
      const key = reviewTimeLabelToKey(timeLabel);
      const { reviews } = await fetchReviewsForMusician(user.id, key);
      setRows(reviews);
    } catch (e) {
      console.error("ReviewsInsight load:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [timeLabel]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <ReviewTimeFrameDropdown selected={timeLabel} onSelect={setTimeLabel} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reviews Received</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#9CA3AF" style={styles.loader} />
        ) : rows.length === 0 ? (
          <Text style={styles.emptyText}>No reviews received yet</Text>
        ) : (
          rows.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.listRow,
                index < rows.length - 1 && styles.listRowBorder,
              ]}
            >
              <View style={styles.listRowTop}>
                <Text style={styles.consumerName}>{item.consumerName}</Text>
                <Text style={styles.dateText}>{formatShortDate(item.createdAt)}</Text>
              </View>
              <StarRow value={item.rating} />
              {item.reviewText ? (
                <Text style={styles.reviewBody}>{item.reviewText}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  loader: {
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  listRow: {
    paddingVertical: 12,
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  listRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  consumerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 12,
  },
  dateText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  starRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  reviewBody: {
    fontSize: 15,
    color: "#D1D5DB",
    lineHeight: 22,
  },
});
