import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConsumerFollowingSection from "../../components/ConsumerFollowingSection";
import ConsumerInsightsHeader from "../../components/ConsumerInsightsHeader";
import ConsumerInsightsViewDropdown from "../../components/ConsumerInsightsViewDropdown";
import ConsumerReviewsGivenSection from "../../components/ConsumerReviewsGivenSection";
import ConsumerTipsGivenInsights from "../../components/ConsumerTipsGivenInsights";
import { supabase } from "../../lib/supabase";

const TIPS_GIVEN = "Tips Given";
const REVIEWS_GIVEN = "Reviews Given";
const FOLLOWING = "Following";

export default function ConsumerInsightsScreen() {
  const [view, setView] = useState(TIPS_GIVEN);
  const [consumerId, setConsumerId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!cancelled) setConsumerId(user?.id ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const renderBody = () => {
    switch (view) {
      case TIPS_GIVEN:
        return <ConsumerTipsGivenInsights consumerId={consumerId} />;
      case REVIEWS_GIVEN:
        return <ConsumerReviewsGivenSection consumerId={consumerId} />;
      case FOLLOWING:
        return <ConsumerFollowingSection consumerId={consumerId} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ConsumerInsightsHeader />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>View Insights</Text>
          <ConsumerInsightsViewDropdown selected={view} onSelect={setView} />
        </View>

        {renderBody()}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
});
