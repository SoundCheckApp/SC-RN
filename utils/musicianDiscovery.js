import { supabase } from "../lib/supabase";

const MUSICIAN_LIST_FIELDS =
  "id, artist_name, username, genres, location, latitude, longitude, is_live, first_name, last_name";

/** Display name for musician cards and profile headers. */
export function musicianDisplayName(m) {
  if (!m) return "Musician";
  if (m.artist_name?.trim()) return m.artist_name.trim();
  if (m.username?.trim()) return m.username.trim();
  const full = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return full || "Musician";
}

/** Normalize a musicians row for list/card UI. */
export function normalizeMusicianCard(m) {
  return {
    id: m.id,
    name: musicianDisplayName(m),
    genre: m.genres?.trim() || "",
    location: m.location?.trim() || "",
    latitude: m.latitude ?? null,
    longitude: m.longitude ?? null,
    distance: m.distance ?? null,
    isLive: Boolean(m.is_live),
    avatarUrl: m.avatar_url ?? null,
  };
}

/**
 * Text search across artist_name, username, genres, and location.
 * @returns {Promise<{ musicians: array, error: object|null }>}
 */
export async function searchMusicians(query) {
  try {
    const q = String(query ?? "").trim();
    if (q.length < 2) {
      return { musicians: [], error: null };
    }

    const pattern = `%${q.replace(/"/g, "")}%`;
    const { data, error } = await supabase
      .from("musicians")
      .select(MUSICIAN_LIST_FIELDS)
      .or(
        `artist_name.ilike."${pattern}",username.ilike."${pattern}",genres.ilike."${pattern}",location.ilike."${pattern}"`
      )
      .order("artist_name", { ascending: true })
      .limit(50);

    if (error) {
      return { musicians: [], error };
    }

    return {
      musicians: (data ?? []).map(normalizeMusicianCard),
      error: null,
    };
  } catch (error) {
    console.error("searchMusicians:", error);
    return { musicians: [], error: { message: error.message } };
  }
}
