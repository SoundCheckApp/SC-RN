import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  aggregateConsumerTipsByTimeFrame,
  fetchConsumerTipsRows,
} from "../utils/consumerInsights";
import ConsumerTipsOverTimeCard from "./ConsumerTipsOverTimeCard";
import ConsumerTipsSummaryCard from "./ConsumerTipsSummaryCard";
import ConsumerTipsTimeFrameDropdown from "./ConsumerTipsTimeFrameDropdown";

/**
 * Consumer-only: time range + summary + chart for tips from `consumer_tips`.
 */
export default function ConsumerTipsGivenInsights({ consumerId }) {
  const [timeFrame, setTimeFrame] = useState("Weekly");
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    if (!consumerId) {
      setLabels([]);
      setValues([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { rows } = await fetchConsumerTipsRows(consumerId);
      const agg = aggregateConsumerTipsByTimeFrame(rows, timeFrame);
      setLabels(agg.labels);
      setValues(agg.values);
      setTotal(agg.total);
    } catch (e) {
      console.error("ConsumerTipsGivenInsights:", e);
      setLabels([]);
      setValues([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [consumerId, timeFrame]);

  useEffect(() => {
    load();
  }, [load]);

  const hasAnyTips = !loading && total > 0;

  return (
    <>
      <View style={styles.card}>
        <ConsumerTipsTimeFrameDropdown
          selected={timeFrame}
          onSelect={setTimeFrame}
        />
      </View>
      <ConsumerTipsSummaryCard total={total} loading={loading} />
      <ConsumerTipsOverTimeCard
        labels={labels}
        values={values}
        loading={loading}
        hasAnyTips={hasAnyTips}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
});
