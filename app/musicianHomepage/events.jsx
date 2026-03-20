import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventTimeFrameDropdown from "../../components/EventTimeFrameDropdown";
import { supabase } from "../../lib/supabase";
import {
  EVENT_TIME_FRAME_OPTIONS,
  fetchMusicianEvents,
  summarizeEvents,
} from "../../utils/events";

function formatEventDate(isoDate) {
  if (!isoDate) return "";
  const parts = String(isoDate).split("-").map(Number);
  if (parts.length < 3) return isoDate;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EventsScreen() {
  const [timeFrame, setTimeFrame] = useState(EVENT_TIME_FRAME_OPTIONS[0]);
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
      const { events: rows } = await fetchMusicianEvents(user.id, timeFrame);
      setEvents(rows);
    } catch (e) {
      console.error("EventsScreen load:", e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [timeFrame]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => summarizeEvents(events), [events]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Events</Text>
          <View style={styles.separator} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Events Summary</Text>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" style={styles.loader} />
          ) : (
            <View style={styles.summaryRow}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Total Events</Text>
                <Text style={styles.summaryValue}>{summary.totalEvents}</Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Total Tips</Text>
                <Text style={styles.summaryValue}>
                  ${summary.totalTips.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Avg Rating</Text>
                <Text style={styles.summaryValue}>
                  {summary.avgRating == null
                    ? "N/A"
                    : summary.avgRating.toFixed(1)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <EventTimeFrameDropdown selected={timeFrame} onSelect={setTimeFrame} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Past Events</Text>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" style={styles.loader} />
          ) : events.length === 0 ? (
            <Text style={styles.emptyText}>
              No events found. Start performing to see your event history here!
            </Text>
          ) : (
            events.map((ev, index) => (
              <View
                key={ev.id}
                style={[styles.eventRow, index === 0 && styles.eventRowFirst]}
              >
                <View style={styles.eventRowHeader}>
                  <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
                  <Text style={styles.eventDate}>
                    {formatEventDate(ev.eventDate)}
                  </Text>
                </View>
                {ev.location ? (
                  <Text style={styles.eventLocation} numberOfLines={2}>
                    {ev.location}
                  </Text>
                ) : null}
                <View style={styles.eventMeta}>
                  <Text style={styles.eventMetaText}>
                    Tips:{" "}
                    <Text style={styles.eventMetaEm}>
                      ${(Number(ev.tipsAmount) || 0).toFixed(2)}
                    </Text>
                  </Text>
                  <Text style={styles.eventMetaText}>
                    Rating:{" "}
                    <Text style={styles.eventMetaEm}>
                      {ev.rating == null || Number.isNaN(Number(ev.rating))
                        ? "N/A"
                        : Number(ev.rating).toFixed(1)}
                    </Text>
                  </Text>
                </View>
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
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#374151",
    width: "100%",
  },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  loader: {
    paddingVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  summaryCol: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 6,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
    paddingVertical: 8,
  },
  eventRow: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 14,
    paddingBottom: 6,
  },
  eventRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  eventRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  eventLocation: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 8,
    paddingLeft: 26,
  },
  eventMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 26,
  },
  eventMetaText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  eventMetaEm: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
