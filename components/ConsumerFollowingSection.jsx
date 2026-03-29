import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  fetchConsumerFollowingRows,
  followListDisplayName,
  followRowMusician,
  sortFollowsAlphabetically,
} from "../utils/consumerInsights";
import ConsumerFollowingSortDropdown from "./ConsumerFollowingSortDropdown";
import ConsumerFollowingSummaryCard from "./ConsumerFollowingSummaryCard";

function genreLine(musician) {
  const g = musician?.genres?.trim();
  return g || "Not specified";
}

/**
 * Consumer-only: musicians the user follows — matches Consumer Homepage list styling.
 */
export default function ConsumerFollowingSection({ consumerId }) {
  const [sortMode, setSortMode] = useState("All");
  const [loading, setLoading] = useState(true);
  const [follows, setFollows] = useState([]);

  const load = useCallback(async () => {
    if (!consumerId) {
      setFollows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { follows: rows } = await fetchConsumerFollowingRows(consumerId);
      setFollows(rows);
    } catch (e) {
      console.error("ConsumerFollowingSection:", e);
      setFollows([]);
    } finally {
      setLoading(false);
    }
  }, [consumerId]);

  useEffect(() => {
    load();
  }, [load]);

  const displayFollows = useMemo(() => {
    if (sortMode === "All") {
      return sortFollowsAlphabetically(follows);
    }
    return follows;
  }, [follows, sortMode]);

  const openProfile = (musicianId) => {
    if (!musicianId) return;
    router.push(`/musicianProfile/${musicianId}`);
  };

  return (
    <>
      <View style={styles.filterCard}>
        <ConsumerFollowingSortDropdown selected={sortMode} onSelect={setSortMode} />
      </View>

      <ConsumerFollowingSummaryCard total={displayFollows.length} loading={loading} />

      <View style={styles.listCard}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" style={styles.loader} />
        ) : displayFollows.length === 0 ? (
          <Text style={styles.empty}>You are not following any musicians yet</Text>
        ) : (
          displayFollows.map((row) => {
            const m = followRowMusician(row);
            const musicianId = row.musician_id ?? m?.id;
            const name = followListDisplayName(row);
            return (
              <TouchableOpacity
                key={row.id}
                style={styles.musicianCard}
                onPress={() => openProfile(musicianId)}
                activeOpacity={0.7}
              >
                <View style={styles.musicianCardContent}>
                  <View style={styles.musicianInfo}>
                    <Text style={styles.musicianName} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.musicianGenre}>Genre: {genreLine(m)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => openProfile(musicianId)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewButtonText}>VIEW</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
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
    padding: 16,
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
  // Aligned with `app/musicConsumerHomepage/index.jsx` live musician rows
  musicianCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  musicianCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  musicianInfo: {
    flex: 1,
    marginRight: 12,
  },
  musicianName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  musicianGenre: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  viewButton: {
    backgroundColor: "#A855F7",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
