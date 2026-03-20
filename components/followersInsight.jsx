import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { fetchFollowersForMusician } from "../utils/followers";
import FollowerFilterDropdown, {
  FOLLOWER_FILTER_OPTIONS,
} from "./FollowerFilterDropdown";

export default function FollowersInsight() {
  const [filterLabel, setFilterLabel] = useState(FOLLOWER_FILTER_OPTIONS[0]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setFollowers([]);
        return;
      }
      const { followers: rows } = await fetchFollowersForMusician(user.id);
      setFollowers(rows);
    } catch (e) {
      console.error("FollowersInsight load:", e);
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <FollowerFilterDropdown selected={filterLabel} onSelect={setFilterLabel} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Followers</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#9CA3AF" style={styles.loader} />
        ) : followers.length === 0 ? (
          <Text style={styles.emptyText}>No followers yet</Text>
        ) : (
          followers.map((item) => (
            <View key={item.followId} style={styles.followerCard}>
              <View style={styles.followerCardContent}>
                <View style={styles.followerInfo}>
                  <Text style={styles.followerName}>{item.displayName}</Text>
                  {item.subtitle ? (
                    <Text style={styles.followerMeta}>{item.subtitle}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.viewButton}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="View profile"
                  onPress={() => {
                    /* Consumer profile route can be wired here */
                  }}
                >
                  <Text style={styles.viewButtonText}>VIEW</Text>
                </TouchableOpacity>
              </View>
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
  followerCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  followerCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  followerInfo: {
    flex: 1,
    marginRight: 12,
  },
  followerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  followerMeta: {
    fontSize: 14,
    color: "#9CA3AF",
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
