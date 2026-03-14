import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FollowersInsight from "../../components/followersInsight";
import InsightTypeDropdown from "../../components/InsightTypeDropdown";
import RatingsInsight from "../../components/ratingsInsight";
import ReviewsInsight from "../../components/reviewsInsight";
import TipsInsight from "../../components/tipsInsight";

export default function InsightsScreen() {
  const [selectedInsightType, setSelectedInsightType] = useState("Tips");

  const renderInsightContent = () => {
    switch (selectedInsightType) {
      case "Tips":
        return <TipsInsight />;
      case "Ratings":
        return <RatingsInsight />;
      case "Review":
        return <ReviewsInsight />;
      case "Followers":
        return <FollowersInsight />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <View style={styles.separator} />
        </View>

        {/* Insight Type Dropdown */}
        <InsightTypeDropdown
          selected={selectedInsightType}
          onSelect={setSelectedInsightType}
        />

        {/* Dynamic Content Based on Selection */}
        {renderInsightContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100, // Space for bottom tab bar
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#374151",
    width: "100%",
  },
});
