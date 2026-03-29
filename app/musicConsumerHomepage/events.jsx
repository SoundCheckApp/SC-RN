import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConsumerEventsHeader from "../../components/ConsumerEventsHeader";
import ConsumerEventsSortDropdown from "../../components/ConsumerEventsSortDropdown";
import { supabase } from "../../lib/supabase";
import {
  CONSUMER_EVENT_SORT_OPTIONS,
  fetchConsumerEvents,
  formatCheckinEventDate,
  sortConsumerEvents,
  summarizeEvents,
} from "../../utils/events";

export default function EventsScreen() {
  const [sortMode, setSortMode] = useState(CONSUMER_EVENT_SORT_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setEvents([]);
        return;
      }
      const { events: rows } = await fetchConsumerEvents(user.id);
      setEvents(rows);
    } catch (e) {
      console.error("Consumer EventsScreen load:", e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => summarizeEvents(events), [events]);
  const sortedEvents = useMemo(
    () => sortConsumerEvents(events, sortMode),
    [events, sortMode]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ConsumerEventsHeader />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sort Events</Text>
          <ConsumerEventsSortDropdown selected={sortMode} onSelect={setSortMode} />
        </View>

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" style={styles.loader} />
          ) : (
            <View style={styles.summaryRow}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryValue}>{summary.totalEvents}</Text>
                <Text style={styles.summaryLabel}>Total Events</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryValue}>
                  ${summary.totalTips.toFixed(2)}
                </Text>
                <Text style={styles.summaryLabel}>Total Tips Given</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.listCard}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" style={styles.loader} />
          ) : sortedEvents.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptySubtitle}>
                Start attending events to see them here!
              </Text>
            </View>
          ) : (
            sortedEvents.map((ev, index) => (
              <View
                key={ev.id}
                style={[styles.eventBlock, index > 0 && styles.eventBlockDivider]}
              >
                <Text style={styles.eventDate}>
                  {formatCheckinEventDate(ev.eventDate)}
                </Text>
                <Text style={styles.artistName} numberOfLines={2}>
                  {ev.artistName}
                </Text>
                <Text style={styles.tipsLine}>
                  Tips Given During Event:{" "}
                  <Text style={styles.tipsAmount}>
                    ${(Number(ev.tipsAmount) || 0).toFixed(2)}
                  </Text>
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 100,
  },
  card: {
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
    minHeight: 140,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  loader: {
    paddingVertical: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  summaryCol: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
  emptyBlock: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D1D5DB",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  eventBlock: {
    paddingBottom: 16,
  },
  eventBlockDivider: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 16,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  artistName: {
    fontSize: 15,
    color: "#E5E7EB",
    marginBottom: 8,
  },
  tipsLine: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  tipsAmount: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
