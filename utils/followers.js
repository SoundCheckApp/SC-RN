import { supabase } from "../lib/supabase";

function consumerDisplayName(c) {
  if (!c) return "Consumer";
  const { first_name, last_name, username } = c;
  const name = [first_name, last_name].filter(Boolean).join(" ").trim();
  if (name) return name;
  return username || "Consumer";
}

function consumerSubtitle(c) {
  if (!c) return "";
  if (c.preferred_genre?.trim()) return `Genre: ${c.preferred_genre.trim()}`;
  if (c.location?.trim()) return `Location: ${c.location.trim()}`;
  return "";
}

/**
 * Followers for a musician from `consumer_follows`, with consumer profile fields.
 */
export async function fetchFollowersForMusician(musicianId) {
  if (!musicianId) {
    return { followers: [], error: null };
  }

  const { data, error } = await supabase
    .from("consumer_follows")
    .select(
      "id, created_at, consumers ( id, first_name, last_name, username, preferred_genre, location )"
    )
    .eq("musician_id", musicianId);

  if (error) {
    console.warn("fetchFollowersForMusician:", error.message);
    return { followers: [], error };
  }

  const rows = (data ?? []).map((row) => {
    let c = row.consumers;
    if (Array.isArray(c)) c = c[0];
    return {
      id: row.id,
      followId: row.id,
      consumerId: c?.id,
      sortName: consumerDisplayName(c).toLowerCase(),
      displayName: consumerDisplayName(c),
      subtitle: consumerSubtitle(c),
      createdAt: row.created_at,
    };
  });

  rows.sort((a, b) => a.sortName.localeCompare(b.sortName));

  return { followers: rows, error: null };
}
