import { supabase } from "../lib/supabase";

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
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: `${profileData.firstName} ${profileData.lastName}`,
          // Note: created_at and updated_at will be auto-generated if your table has defaults
        });

      if (profileError) {
        return { error: profileError };
      }
    } else {
      // Update profile with full name
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: `${profileData.firstName} ${profileData.lastName}`,
          // Note: updated_at will be auto-generated if your table has a trigger
        })
        .eq("id", user.id);

      if (updateError) {
        return { error: updateError };
      }
    }

    // Check if consumer record exists
    const { data: existingConsumer } = await supabase
      .from("consumers")
      .select("profile_id")
      .eq("profile_id", user.id)
      .single();

    // Prepare consumer data
    const consumerData = {
      profile_id: user.id,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      username: profileData.username,
      location: profileData.location,
      birthday: profileData.birthday,
      preferred_genre: profileData.preferredGenre,
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
        .eq("profile_id", user.id);

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
