import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchConsumerFollowingRows } from "../utils/consumerInsights";

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

/** Consumer-only: musicians the user follows (`consumer_follows`). */
export default function ConsumerFollowingSection({ consumerId }) {
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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Following</Text>
      <Text style={styles.count}>
        {loading ? "…" : `${follows.length} musicians`}
      </Text>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" style={styles.loader} />
      ) : follows.length === 0 ? (
        <Text style={styles.empty}>You are not following anyone yet.</Text>
      ) : (
        follows.slice(0, 30).map((f) => {
          let m = f.musicians;
          if (Array.isArray(m)) m = m[0];
          const name =
            m?.artist_name?.trim() ||
            m?.username?.trim() ||
            `Musician ${String(f.musician_id).slice(0, 8)}…`;
          return (
            <View key={f.id} style={styles.row}>
              <Text style={styles.musicianName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.date}>{formatShortDate(f.created_at)}</Text>
            </View>
          );
        })
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
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingVertical: 12,
  },
  musicianName: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    marginRight: 12,
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
