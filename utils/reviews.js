import { supabase } from "../lib/supabase";

function consumerDisplayName(row) {
  let c = row?.consumers;
  if (Array.isArray(c)) c = c[0];
  if (!c) return "Consumer";
  const { first_name, last_name, username } = c;
  const name = [first_name, last_name].filter(Boolean).join(" ").trim();
  if (name) return name;
  return username || "Consumer";
}

/** @typedef {'past_week' | 'past_month' | 'past_year' | 'all_time'} ReviewTimeFilter */

/**
 * @param {string} label UI label from ReviewTimeFrameDropdown
 * @returns {ReviewTimeFilter}
 */
export function reviewTimeLabelToKey(label) {
  const map = {
    "Past Week": "past_week",
    "Past Month": "past_month",
    "Past Year": "past_year",
    "All Time": "all_time",
  };
  return map[label] ?? "all_time";
}

/** Rolling window start (UTC) for Supabase `.gte('created_at', …)`; `all_time` → null */
export function reviewTimeFilterCutoffIso(key) {
  if (key === "all_time") return null;
  const d = new Date();
  if (key === "past_week") d.setDate(d.getDate() - 7);
  else if (key === "past_month") d.setDate(d.getDate() - 30);
  else if (key === "past_year") d.setDate(d.getDate() - 365);
  return d.toISOString();
}

/**
 * Loads `consumer_reviews` for the musician, optionally since a rolling cutoff.
 */
export async function fetchReviewsForMusician(musicianId, timeKey) {
  if (!musicianId) {
    return { reviews: [], error: null };
  }

  const cutoff = reviewTimeFilterCutoffIso(timeKey);

  let q = supabase
    .from("consumer_reviews")
    .select(
      "id, rating, review_text, created_at, consumers ( first_name, last_name, username )"
    )
    .eq("musician_id", musicianId);

  if (cutoff) {
    q = q.gte("created_at", cutoff);
  }

  const { data, error } = await q.order("created_at", { ascending: false });

  if (error) {
    console.warn("fetchReviewsForMusician:", error.message);
    return { reviews: [], error };
  }

  const reviews = (data ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    reviewText: row.review_text?.trim() || "",
    createdAt: row.created_at,
    consumerName: consumerDisplayName(row),
  }));

  return { reviews, error: null };
}
