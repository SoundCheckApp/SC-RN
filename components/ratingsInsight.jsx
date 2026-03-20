import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { fetchRatingsForMusician } from "../utils/ratings";
import RatingFilterDropdown, {
  RATING_FILTER_OPTIONS,
  ratingFilterToStars,
} from "./RatingFilterDropdown";

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
    <View style={styles.starRow} accessibilityRole="image" accessibilityLabel={`${value} out of 5 stars`}>
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

export default function RatingsInsight() {
  const [filterLabel, setFilterLabel] = useState(RATING_FILTER_OPTIONS[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRows([]);
        return;
      }
      const { ratings } = await fetchRatingsForMusician(user.id);
      setRows(ratings);
    } catch (e) {
      console.error("RatingsInsight load:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const starFilter = ratingFilterToStars(filterLabel);

  const visibleRows = useMemo(() => {
    if (starFilter == null) return rows;
    return rows.filter((r) => r.rating === starFilter);
  }, [rows, starFilter]);

  return (
    <>
      <RatingFilterDropdown selected={filterLabel} onSelect={setFilterLabel} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ratings Received</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#9CA3AF" style={styles.loader} />
        ) : visibleRows.length === 0 ? (
          <Text style={styles.emptyText}>No ratings received yet</Text>
        ) : (
          visibleRows.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.listRow,
                index < visibleRows.length - 1 && styles.listRowBorder,
              ]}
            >
              <View style={styles.listRowTop}>
                <Text style={styles.consumerName}>{item.consumerName}</Text>
                <Text style={styles.dateText}>{formatShortDate(item.createdAt)}</Text>
              </View>
              <StarRow value={item.rating} />
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
  },
});
