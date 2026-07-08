import React, { useMemo, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import TimeFrameDropdown from "./TimeFrameDropdown";

const MONTH_LABELS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Single-letter months so chart-kit never clips labels on narrow widths. */
const YEARLY_CHART_LABELS = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];

const WEEKLY_LABELS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** X labels for monthly line chart — length must match datasets[].data (chart-kit). */
const MONTHLY_CHART_LABELS = ["1", "5", "10", "15", "20", "25", "30"];

/**
 * Sample tips per chart point until Supabase aggregation exists.
 * react-native-chart-kit collapses Y scale when every value is 0 (flat line + 0–1 ticks).
 */
const TIPS_MONTHLY_SAMPLE = [0, 18, 30, 20, 25, 12, 18];
const TIPS_YEARLY_SAMPLE = [
  140, 180, 200, 220, 260, 280, 240, 300, 260, 320, 460, 480,
];
const TIPS_WEEKLY_SAMPLE = [12, 22, 18, 28, 35, 20, 16];

/** Matches TimeFrameDropdown / insights cards so charts sit flush inside the card. */
const INSIGHTS_SCROLL_PADDING = 24;
const CARD_PADDING = 16;
const CHART_SURFACE = "#1F2937";

function formatUsdInt(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatUsd2(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function sum(arr) {
  return arr.reduce((a, b) => a + (Number(b) || 0), 0);
}

/**
 * Shared chart-kit config. Dollar sign only in formatYLabel (yAxisLabel stays "").
 */
function makeChartBaseConfig() {
  return {
    backgroundColor: CHART_SURFACE,
    backgroundGradientFrom: CHART_SURFACE,
    backgroundGradientTo: CHART_SURFACE,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: { borderRadius: 16 },
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: "rgba(255,255,255,0.08)",
      strokeWidth: 1,
    },
    formatYLabel: (value) => {
      const n = Number(value);
      if (Number.isNaN(n)) return "";
      return `$${Math.round(n)}`;
    },
  };
}

/**
 * Musician Tips insights. Charts use sample series until tips are loaded from the API.
 */
export default function TipsInsight() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("Monthly");

  const weeklyValues = useMemo(() => [...TIPS_WEEKLY_SAMPLE], []);
  const monthlyValues = useMemo(() => [...TIPS_MONTHLY_SAMPLE], []);
  const yearlyValues = useMemo(() => [...TIPS_YEARLY_SAMPLE], []);

  const activeValues =
    selectedTimeFrame === "Weekly"
      ? weeklyValues
      : selectedTimeFrame === "Monthly"
        ? monthlyValues
        : yearlyValues;

  const totalTips = useMemo(() => sum(activeValues), [activeValues]);
  const hasTips = totalTips > 0;

  const avgPerDay = useMemo(() => {
    if (selectedTimeFrame === "Weekly") {
      return weeklyValues.length ? sum(weeklyValues) / 7 : 0;
    }
    if (selectedTimeFrame === "Monthly") {
      return monthlyValues.length ? sum(monthlyValues) / monthlyValues.length : 0;
    }
    return 0;
  }, [selectedTimeFrame, weeklyValues, monthlyValues]);

  const maxYearVal = useMemo(
    () => Math.max(0, ...yearlyValues),
    [yearlyValues]
  );
  const peakMonthIdx =
    maxYearVal > 0 ? yearlyValues.indexOf(maxYearVal) : -1;

  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.max(
    280,
    screenWidth - 2 * (INSIGHTS_SCROLL_PADDING + CARD_PADDING)
  );

  const chartBaseConfig = useMemo(() => makeChartBaseConfig(), []);

  const barChartConfig = useMemo(
    () => ({
      ...chartBaseConfig,
      barPercentage: 0.65,
      barRadius: 8,
      color: () => "rgba(59, 130, 246, 1)",
    }),
    [chartBaseConfig]
  );

  const lineMax = useMemo(() => {
    const raw = Math.max(
      1,
      ...activeValues,
      selectedTimeFrame === "Monthly" ? avgPerDay || 0 : 0
    );
    return raw * 1.15;
  }, [activeValues, avgPerDay, selectedTimeFrame]);

  const monthlyAvgLine = useMemo(() => {
    const avg = monthlyValues.length
      ? sum(monthlyValues) / monthlyValues.length
      : 0;
    return Array(monthlyValues.length).fill(Number(avg.toFixed(2)));
  }, [monthlyValues]);

  const lineChartData = useMemo(() => {
    if (selectedTimeFrame === "Weekly") {
      return {
        labels: WEEKLY_LABELS_SHORT,
        datasets: [
          {
            data: weeklyValues.map((v) => Math.max(0, v)),
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    }
    if (selectedTimeFrame === "Monthly") {
      return {
        labels: MONTHLY_CHART_LABELS,
        datasets: [
          {
            data: monthlyValues.map((v) => Math.max(0, v)),
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            strokeWidth: 2,
          },
          {
            data: monthlyAvgLine.map((v) => Math.min(v, lineMax)),
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
            strokeWidth: 2,
            strokeDashArray: "6 8",
            withDots: false,
          },
        ],
      };
    }
    return { labels: [], datasets: [{ data: [0] }] };
  }, [
    selectedTimeFrame,
    weeklyValues,
    monthlyValues,
    monthlyAvgLine,
    lineMax,
  ]);

  const barColors = useMemo(() => {
    return yearlyValues.map((_, i) => {
      if (hasTips && peakMonthIdx === i && maxYearVal > 0) {
        return (opacity = 1) => `rgba(245, 158, 11, ${opacity})`;
      }
      return (opacity = 1) => `rgba(59, 130, 246, ${opacity})`;
    });
  }, [yearlyValues, peakMonthIdx, maxYearVal, hasTips]);

  const barChartData = useMemo(
    () => ({
      labels: YEARLY_CHART_LABELS,
      datasets: [
        {
          data: yearlyValues.map((v) => Math.max(0, v)),
          colors: barColors,
        },
      ],
    }),
    [yearlyValues, barColors]
  );

  const currentYear = new Date().getFullYear();

  return (
    <>
      <TimeFrameDropdown
        selected={selectedTimeFrame}
        onSelect={setSelectedTimeFrame}
      />

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Tips</Text>
          <Text style={styles.summaryValue}>
            {hasTips ? formatUsdInt(totalTips) : "—"}
          </Text>
          {selectedTimeFrame === "Yearly" ? (
            hasTips ? (
              <Text style={styles.summaryTrend}>↑ vs prior year</Text>
            ) : (
              <Text style={styles.summaryMuted}>—</Text>
            )
          ) : hasTips ? (
            <Text style={styles.summaryTrend}>↑ vs last period</Text>
          ) : (
            <Text style={styles.summaryMuted}>—</Text>
          )}
        </View>

        <View style={styles.summaryCard}>
          {selectedTimeFrame === "Yearly" ? (
            <>
              <Text style={styles.summaryTitle}>Best month</Text>
              <Text style={styles.summaryValue}>
                {peakMonthIdx >= 0 ? MONTH_LABELS_SHORT[peakMonthIdx] : "—"}
              </Text>
              <Text style={styles.summaryPeak}>
                {maxYearVal > 0 ? `${formatUsdInt(maxYearVal)} peak` : "—"}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.summaryTitle}>Avg per day</Text>
              <Text style={styles.summaryValue}>
                {hasTips ? formatUsd2(avgPerDay) : "—"}
              </Text>
              <Text style={styles.summaryMuted}>
                {selectedTimeFrame === "Weekly" ? "7 days" : "30 days"}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartCardHeader}>
          <Text style={styles.chartCardTitle}>Tips over time</Text>
          {selectedTimeFrame === "Yearly" ? (
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>{currentYear}</Text>
            </View>
          ) : selectedTimeFrame === "Monthly" ? (
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>
                Avg {formatUsd2(avgPerDay)}/day
              </Text>
            </View>
          ) : (
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>7-day</Text>
            </View>
          )}
        </View>

        {selectedTimeFrame === "Yearly" ? (
          <View style={styles.chartInner}>
            <BarChart
              data={barChartData}
              width={chartWidth}
              height={220}
              chartConfig={barChartConfig}
              style={[styles.chart, styles.barChart]}
              fromZero
              showValuesOnTopOfBars={false}
              showBarTops={false}
              withInnerLines
              withOuterLines={false}
              segments={4}
              yAxisLabel=""
              yAxisSuffix=""
              flatColor
              withCustomBarColorFromData
              verticalLabelRotation={0}
              xLabelsOffset={0}
            />
            <Text style={styles.axisCaption}>Month</Text>
          </View>
        ) : (
          <View style={styles.chartInner}>
            <LineChart
              data={lineChartData}
              width={chartWidth}
              height={220}
              chartConfig={{
                ...chartBaseConfig,
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#3B82F6",
                  fill: "#FFFFFF",
                },
              }}
              style={[
                styles.chart,
                styles.lineChart,
                selectedTimeFrame === "Monthly" && styles.lineChartMonthly,
              ]}
              bezier
              withDots={hasTips}
              withShadow={false}
              withScrollableDot={false}
              withVerticalLines={false}
              withHorizontalLines
              withInnerLines
              withOuterLines={false}
              fromZero
              segments={4}
              yAxisLabel=""
              yAxisSuffix=""
              horizontalLabelRotation={0}
              verticalLabelRotation={0}
              yLabelsOffset={10}
              xLabelsOffset={4}
            />
            <Text style={styles.axisCaption}>
              {selectedTimeFrame === "Monthly"
                ? "Day of month"
                : "Day of week"}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: CHART_SURFACE,
    borderRadius: 16,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  summaryTrend: {
    fontSize: 13,
    fontWeight: "600",
    color: "#22C55E",
  },
  summaryPeak: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FBBF24",
  },
  summaryMuted: {
    fontSize: 13,
    color: "#6B7280",
  },
  chartCard: {
    backgroundColor: CHART_SURFACE,
    borderRadius: 16,
    padding: CARD_PADDING,
    marginBottom: 20,
    overflow: "hidden",
  },
  chartCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  chartCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    paddingRight: 8,
  },
  badgeGreen: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeGreenText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4ADE80",
  },
  chartInner: {
    alignItems: "center",
    width: "100%",
  },
  chart: {
    marginVertical: 4,
    marginLeft: -10,
    borderRadius: 12,
    paddingTop: 12,
    paddingRight: 52,
  },
  lineChart: {
    paddingBottom: 14,
  },
  lineChartMonthly: {
    paddingBottom: 18,
  },
  barChart: {
    paddingBottom: 4,
  },
  axisCaption: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    alignSelf: "center",
  },
});
