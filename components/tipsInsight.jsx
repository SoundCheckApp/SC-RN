import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import TimeFrameDropdown from "./TimeFrameDropdown";

export default function TipsInsight() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("Monthly");
  const [totalTips, setTotalTips] = useState(null);
  const [tipsData, setTipsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTipsData();
  }, [selectedTimeFrame]);

  const loadTipsData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Supabase query
      // Simulating API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API call
      setTotalTips(null); // Set to null to show "--" as in screenshot
      setTipsData(generateMockChartData(selectedTimeFrame));
    } catch (error) {
      console.error("Error loading tips data:", error);
      setTotalTips(null);
      setTipsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockChartData = (timeFrame) => {
    // Generate empty data array to show empty chart initially
    // In production, this would fetch real data from Supabase
    const dataPoints = timeFrame === "Weekly" ? 7 : timeFrame === "Monthly" ? 30 : 12;
    return Array.from({ length: dataPoints }, () => 0);
  };

  const chartData = {
    labels: selectedTimeFrame === "Weekly" 
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : selectedTimeFrame === "Monthly"
      ? Array.from({ length: 30 }, (_, i) => (i + 1).toString())
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        data: tipsData,
        color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#1F2937",
    backgroundGradientFrom: "#1F2937",
    backgroundGradientTo: "#1F2937",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#FF6B35",
    },
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: "#374151",
      strokeWidth: 1,
    },
    // Configure Y-axis to show 1000, 1500, 2000 as in screenshot
    yAxisInterval: 500,
    yAxisMin: 0,
    yAxisMax: 2000,
    // Format Y-axis labels to only show 1000, 1500, 2000
    formatYLabel: (value) => {
      const num = parseInt(value);
      if (num === 1000 || num === 1500 || num === 2000) {
        return num.toString();
      }
      return "";
    },
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <>
      <TimeFrameDropdown
        selected={selectedTimeFrame}
        onSelect={setSelectedTimeFrame}
      />

      {/* Total Tips Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Tips</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#FF6B35" style={styles.loader} />
        ) : (
          <Text style={styles.totalAmount}>
            {totalTips !== null ? `$${totalTips.toFixed(2)}` : "--"}
          </Text>
        )}
      </View>

      {/* Tips Over Time Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tips Over Time</Text>
        {isLoading ? (
          <View style={styles.chartPlaceholder}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={false}
              withShadow={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              withInnerLines={true}
              segments={4}
              fromZero={true}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
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
  totalAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  loader: {
    marginVertical: 20,
  },
  chartContainer: {
    alignItems: "center",
    marginTop: 10,
    overflow: "hidden",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartPlaceholder: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#374151",
  },
});
