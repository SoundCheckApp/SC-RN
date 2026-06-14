import { supabase } from "../lib/supabase";

const BASIC_FIELDS =
  "id, artist_name, username, genres, location, first_name, last_name";

const EXTENDED_FIELDS = `${BASIC_FIELDS}, latitude, longitude, is_live`;

const SEARCH_COLUMNS = [
  "artist_name",
  "username",
  "genres",
  "location",
  "first_name",
  "last_name",
];

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

/** PostgREST .or() ilike filter — quote pattern so spaces/% are parsed correctly. */
function buildOrIlikeFilter(query) {
  const term = query.replace(/"/g, "").replace(/\\/g, "");
  const pattern = `"%${term}%"`;
  return SEARCH_COLUMNS.map((col) => `${col}.ilike.${pattern}`).join(",");
}

async function runSearch(query, selectFields) {
  return supabase
    .from("musicians")
    .select(selectFields)
    .or(buildOrIlikeFilter(query))
    .order("artist_name", { ascending: true })
    .limit(50);
}

/**
 * Checks whether the signed-in user can read any musicians (RLS / migration).
 * @returns {Promise<{ count: number, error: object|null, hint: string|null }>}
 */
export async function probeMusicianDiscoveryAccess() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      count: 0,
      error: null,
      hint: "Sign in as a consumer to search musicians.",
    };
  }

  const { count, error } = await supabase
    .from("musicians")
    .select("id", { count: "exact", head: true });

  if (error) {
    return {
      count: 0,
      error,
      hint:
        "Could not read musicians table. Check Supabase connection and RLS policies.",
    };
  }

  if (count === 0) {
    return {
      count: 0,
      error: null,
      hint:
        "No musicians are visible to your account. Run supabase_consumer_discovery.sql in the Supabase SQL Editor (adds discovery RLS policy), then reload the app.",
    };
  }

  return { count, error: null, hint: null };
}

/**
 * Text search across artist_name, username, genres, location, first/last name.
 * @returns {Promise<{ musicians: array, error: object|null }>}
 */
export async function searchMusicians(query) {
  try {
    const q = String(query ?? "").trim();
    if (q.length < 2) {
      return { musicians: [], error: null };
    }

    let { data, error } = await runSearch(q, EXTENDED_FIELDS);

    // Geo columns may not exist until supabase_consumer_discovery.sql is run.
    if (error?.code === "42703") {
      ({ data, error } = await runSearch(q, BASIC_FIELDS));
    }

    if (error) {
      console.error("searchMusicians:", error.message, error.code, error.details);
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
