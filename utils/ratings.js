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

/**
 * Loads star ratings from `consumer_reviews` for the signed-in musician.
 * (Schema: consumer_reviews.rating, musician_id, consumer_id → consumers.)
 */
export async function fetchRatingsForMusician(musicianId) {
  if (!musicianId) {
    return { ratings: [], error: null };
  }

  const { data, error } = await supabase
    .from("consumer_reviews")
    .select("id, rating, created_at, consumers ( first_name, last_name, username )")
    .eq("musician_id", musicianId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("fetchRatingsForMusician:", error.message);
    return { ratings: [], error };
  }

  const rows = (data ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    createdAt: row.created_at,
    consumerName: consumerDisplayName(row),
  }));

  return { ratings: rows, error: null };
}
