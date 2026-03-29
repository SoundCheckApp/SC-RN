import { supabase } from "../lib/supabase";

/** Same list as consumer signup — used for Preferred Genre picker in Account settings. */
export const CONSUMER_GENRE_OPTIONS = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Country",
  "Jazz",
  "Electronic",
  "Classical",
  "Folk",
  "Reggae",
  "Blues",
  "Metal",
  "Punk",
  "Indie",
  "Alternative",
  "Latin",
  "Gospel",
  "Soul",
  "Funk",
  "Disco",
  "World",
];

const BIO_MAX_LEN = 500;

/**
 * Consumer row + profile email/avatar for Account settings.
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export const getConsumerAccountForSettings = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: { message: "User not authenticated" } };
    }

    const [consumerRes, profileRes] = await Promise.all([
      supabase.from("consumers").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("profiles").select("email, avatar_url").eq("id", user.id).maybeSingle(),
    ]);

    if (consumerRes.error) {
      return { data: null, error: consumerRes.error };
    }

    const c = consumerRes.data;
    const p = profileRes.data;

    return {
      data: {
        first_name: c?.first_name ?? "",
        last_name: c?.last_name ?? "",
        username: c?.username ?? "",
        location: c?.location ?? "",
        preferred_genre: c?.preferred_genre ?? "",
        bio: (c?.bio ?? "").slice(0, BIO_MAX_LEN),
        email: user.email ?? p?.email ?? "",
        avatar_url: p?.avatar_url ?? null,
      },
      error: null,
    };
  } catch (error) {
    console.error("getConsumerAccountForSettings:", error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Updates editable consumer fields. Email is not written (read-only in UI; use Auth flows to change).
 */
export const updateConsumerEditableAccount = async ({
  firstName,
  lastName,
  username,
  location,
  preferredGenre,
  bio,
}) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: { message: "User not authenticated" } };
    }

    const payload = {
      first_name: (firstName ?? "").trim(),
      last_name: (lastName ?? "").trim(),
      username: (username ?? "").trim(),
      location: (location ?? "").trim(),
      preferred_genre: (preferredGenre ?? "").trim(),
      bio: (bio ?? "").trim().slice(0, BIO_MAX_LEN),
    };

    const { error } = await supabase
      .from("consumers")
      .update(payload)
      .eq("id", user.id);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error("updateConsumerEditableAccount:", error);
    return { error: { message: error.message } };
  }
};

/**
 * Public-style consumer profile by id (preview / future deep links).
 */
export const getConsumerProfileById = async (profileId) => {
  try {
    if (!profileId) {
      return { profile: null, error: null };
    }

    const [consumerRes, profileRes] = await Promise.all([
      supabase
        .from("consumers")
        .select(
          "id, first_name, last_name, username, location, preferred_genre, bio"
        )
        .eq("id", profileId)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", profileId)
        .maybeSingle(),
    ]);

    if (consumerRes.error) {
      return { profile: null, error: consumerRes.error };
    }

    const c = consumerRes.data;
    if (!c) {
      return { profile: null, error: { message: "Profile not found" } };
    }

    const name =
      `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() ||
      c.username ||
      "Consumer";

    return {
      profile: {
        id: c.id,
        displayName: name,
        username: c.username ?? "",
        location: c.location ?? "",
        preferredGenre: c.preferred_genre ?? "",
        bio: c.bio ?? "",
        avatar_url: profileRes.data?.avatar_url ?? null,
      },
      error: null,
    };
  } catch (error) {
    console.error("getConsumerProfileById:", error);
    return { profile: null, error: { message: error.message } };
  }
};

export const CONSUMER_BIO_MAX_LENGTH = BIO_MAX_LEN;

/**
 * Save consumer profile data
 * @param {object} profileData - Consumer profile data
 * @returns {Promise<{error: object|null}>}
 */
export const saveConsumerProfile = async (profileData) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: { message: "User not authenticated" } };
    }

    // Ensure profile exists first
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist (email only - full_name is stored in consumers table)
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          // Note: created_at and updated_at will be auto-generated if your table has defaults
        });

      if (profileError) {
        return { error: profileError };
      }
    } else {
      // Update profile with email (full_name is stored in consumers table, not profiles)
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          email: user.email || existingProfile.email || "",
          // Note: updated_at will be auto-generated if your table has a trigger
        })
        .eq("id", user.id);

      if (updateError) {
        return { error: updateError };
      }
    }

    // Check if consumer record exists
    // consumers.id should match profiles.id (same UUID)
    const { data: existingConsumer } = await supabase
      .from("consumers")
      .select("id")
      .eq("id", user.id)
      .single();

    // Prepare consumer data
    const consumerData = {
      id: user.id, // Use the same ID as profiles.id
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      username: profileData.username,
      location: profileData.location,
      birthday: profileData.birthday,
      preferred_genre: profileData.preferredGenre,
      bio: profileData.bio != null ? String(profileData.bio).slice(0, BIO_MAX_LEN) : "",
      // Note: created_at and updated_at will be auto-generated if your table has defaults/triggers
    };

    if (existingConsumer) {
      // Update existing consumer record
      // Add updated_at only if your table doesn't have an auto-update trigger
      const updateData = {
        ...consumerData,
        // updated_at: new Date().toISOString(), // Uncomment if needed
      };
      const { error: updateError } = await supabase
        .from("consumers")
        .update(updateData)
        .eq("id", user.id);

      if (updateError) {
        return { error: updateError };
      }
    } else {
      // Create new consumer record
      // Note: Don't include created_at if your database auto-generates it
      // If your table has a default value for created_at, remove this line
      const { error: insertError } = await supabase
        .from("consumers")
        .insert(consumerData);

      if (insertError) {
        return { error: insertError };
      }
    }

    // Note: Password update should be handled separately through Supabase Auth
    if (profileData.password) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: profileData.password,
      });

      if (passwordError) {
        console.warn("Password update error:", passwordError);
        // Don't fail the whole operation if password update fails
      }
    }

    return { error: null };
  } catch (error) {
    console.error("Error saving consumer profile:", error);
    return { error: { message: error.message } };
  }
};

/**
 * Get nearby live musicians within a radius
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radiusMiles - Radius in miles (1-5)
 * @returns {Promise<{musicians: array, error: object|null}>}
 */
export const getNearbyLiveMusicians = async (latitude, longitude, radiusMiles) => {
  try {
    // Convert miles to approximate degrees (rough approximation)
    // 1 degree latitude ≈ 69 miles
    // 1 degree longitude ≈ 69 * cos(latitude) miles
    const latRadius = radiusMiles / 69;
    const lngRadius = radiusMiles / (69 * Math.cos(latitude * Math.PI / 180));

    // Calculate bounding box
    const minLat = latitude - latRadius;
    const maxLat = latitude + latRadius;
    const minLng = longitude - lngRadius;
    const maxLng = longitude + lngRadius;

    // TODO: This query assumes you have latitude/longitude columns in musicians table
    // and an is_live boolean column. Adjust based on your actual schema.
    
    // For now, returning a structure that shows what the query should look like
    // You'll need to:
    // 1. Add latitude, longitude, and is_live columns to musicians table
    // 2. Update this query to filter by location and is_live status
    
    const { data: musicians, error } = await supabase
      .from("musicians")
      .select(`
        *,
        profiles:profile_id (
          id,
          full_name
        )
      `)
      .eq("is_live", true)
      .gte("latitude", minLat)
      .lte("latitude", maxLat)
      .gte("longitude", minLng)
      .lte("longitude", maxLng);

    if (error) {
      return { musicians: [], error };
    }

    // Calculate distance for each musician and sort
    const musiciansWithDistance = musicians
      .map((musician) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          musician.latitude,
          musician.longitude
        );
        return {
          ...musician,
          distance,
        };
      })
      .filter((musician) => musician.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);

    return { musicians: musiciansWithDistance, error: null };
  } catch (error) {
    console.error("Error getting nearby musicians:", error);
    return { musicians: [], error: { message: error.message } };
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in miles
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
