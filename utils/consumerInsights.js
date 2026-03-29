import { supabase } from "../lib/supabase";

export const CONSUMER_INSIGHT_VIEWS = [
  "Tips Given",
  "Reviews Given",
  "Following",
];

export const CONSUMER_TIPS_TIME_FRAMES = ["Weekly", "Monthly", "Yearly"];

export const CONSUMER_REVIEWS_FILTER_OPTIONS = [
  "All Reviews",
  "5 Stars",
  "4 Stars",
  "3 Stars",
  "2 Stars",
  "1 Star",
];

/** @returns {number|null} star count, or null for "All Reviews" */
export function parseReviewsFilterStars(label) {
  if (!label || label === "All Reviews") return null;
  const n = parseInt(String(label), 10);
  return Number.isFinite(n) ? n : null;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Buckets `consumer_tips` rows into chart series + total for Weekly / Monthly / Yearly.
 * @param {{ amount: number|string, created_at: string }[]} rows
 * @param {'Weekly'|'Monthly'|'Yearly'} timeFrame
 * @returns {{ labels: string[], values: number[], total: number }}
 */
export function aggregateConsumerTipsByTimeFrame(rows, timeFrame) {
  const today = startOfDay(new Date());

  if (timeFrame === "Weekly") {
    const labels = [];
    const buckets = Array(7).fill(0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    }
    for (const r of rows) {
      const dayStart = startOfDay(new Date(r.created_at));
      const offset = Math.round(
        (today.getTime() - dayStart.getTime()) / 86400000
      );
      if (offset >= 0 && offset <= 6) {
        const idx = 6 - offset;
        buckets[idx] += Number(r.amount) || 0;
      }
    }
    const total = buckets.reduce((a, b) => a + b, 0);
    return { labels, values: buckets, total };
  }

  if (timeFrame === "Monthly") {
    const windowStart = new Date(today);
    windowStart.setDate(windowStart.getDate() - 29);
    windowStart.setHours(0, 0, 0, 0);
    const labels = Array.from({ length: 30 }, (_, i) => String(i + 1));
    const buckets = Array(30).fill(0);
    for (const r of rows) {
      const dayStart = startOfDay(new Date(r.created_at));
      if (dayStart < windowStart) continue;
      const dayIdx = Math.floor(
        (dayStart.getTime() - windowStart.getTime()) / 86400000
      );
      if (dayIdx >= 0 && dayIdx < 30) {
        buckets[dayIdx] += Number(r.amount) || 0;
      }
    }
    const total = buckets.reduce((a, b) => a + b, 0);
    return { labels, values: buckets, total };
  }

  // Yearly — rolling 12 calendar months ending current month
  const monthShort = [
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
  const ym = (d) => d.getFullYear() * 12 + d.getMonth();
  const currentYm = ym(today);
  const labels = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
    labels.push(monthShort[d.getMonth()]);
  }
  const buckets = Array(12).fill(0);
  for (const r of rows) {
    const t = new Date(r.created_at);
    const k = ym(t);
    const idx = k - (currentYm - 11);
    if (idx >= 0 && idx < 12) {
      buckets[idx] += Number(r.amount) || 0;
    }
  }
  const total = buckets.reduce((a, b) => a + b, 0);
  return { labels, values: buckets, total };
}

export async function fetchConsumerTipsRows(consumerId) {
  if (!consumerId) {
    return { rows: [], error: null };
  }
  const { data, error } = await supabase
    .from("consumer_tips")
    .select("amount, created_at")
    .eq("consumer_id", consumerId)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("fetchConsumerTipsRows:", error.message);
    return { rows: [], error };
  }
  return { rows: data ?? [], error: null };
}

export async function fetchConsumerReviewsGiven(consumerId) {
  if (!consumerId) {
    return { reviews: [], error: null };
  }
  const { data, error } = await supabase
    .from("consumer_reviews")
    .select("id, rating, review_text, created_at")
    .eq("consumer_id", consumerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("fetchConsumerReviewsGiven:", error.message);
    return { reviews: [], error };
  }
  return { reviews: data ?? [], error: null };
}

export async function fetchConsumerFollowingRows(consumerId) {
  if (!consumerId) {
    return { follows: [], error: null };
  }
  let { data, error } = await supabase
    .from("consumer_follows")
    .select(
      "id, musician_id, created_at, musicians ( artist_name, username )"
    )
    .eq("consumer_id", consumerId)
    .order("created_at", { ascending: false });

  if (error) {
    const retry = await supabase
      .from("consumer_follows")
      .select("id, musician_id, created_at")
      .eq("consumer_id", consumerId)
      .order("created_at", { ascending: false });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.warn("fetchConsumerFollowingRows:", error.message);
    return { follows: [], error };
  }
  return { follows: data ?? [], error: null };
}
