import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

/** Consumer-only: tips over time chart or empty state. */
export default function ConsumerTipsOverTimeCard({
  labels,
  values,
  loading,
  hasAnyTips,
}) {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.max(280, screenWidth - 48);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: values.length ? values : [0],
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    }),
    [labels, values]
  );

  const maxVal = useMemo(
    () => Math.max(1, ...values, 0.01),
    [values]
  );

  const chartConfig = {
    backgroundColor: "#1C1C1E",
    backgroundGradientFrom: "#1C1C1E",
    backgroundGradientTo: "#1C1C1E",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "3",
      strokeWidth: "2",
      stroke: "#22C55E",
    },
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: "#374151",
      strokeWidth: 1,
    },
    yAxisMin: 0,
    yAxisMax: maxVal * 1.15,
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tips Over Time</Text>
      {loading ? (
        <View style={styles.placeholder}>
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      ) : !hasAnyTips ? (
        <Text style={styles.empty}>No tips data available for this period</Text>
      ) : (
        <View style={styles.chartWrap}>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={values.filter((v) => v > 0).length <= 14}
            withShadow={false}
            withVerticalLines={false}
            withHorizontalLines
            withInnerLines
            fromZero
            segments={4}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>
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
    marginBottom: 12,
  },
  empty: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 48,
    lineHeight: 22,
  },
  placeholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  chartWrap: {
    alignItems: "center",
    overflow: "hidden",
  },
  chart: {
    marginVertical: 4,
    borderRadius: 16,
  },
});
