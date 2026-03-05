import { supabase } from "../lib/supabase";

/**
 * Save musician profile data
 * @param {object} profileData - Musician profile data
 * @returns {Promise<{error: object|null}>}
 */
export const saveMusicianProfile = async (profileData) => {
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
      // Create profile if it doesn't exist (email only - full_name is stored in musicians table)
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
      // Update profile with email (full_name is stored in musicians table, not profiles)
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

    // Check if musician record exists
    const { data: existingMusician } = await supabase
      .from("musicians")
      .select("profile_id")
      .eq("profile_id", user.id)
      .single();

    // Prepare musician data
    const musicianData = {
      profile_id: user.id,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      username: profileData.username,
      location: profileData.location,
      birthday: profileData.birthday,
      artist_name: profileData.artistName,
      genres: profileData.genres, // Array of genres
      bio: profileData.bio,
      // Note: created_at and updated_at will be auto-generated if your table has defaults/triggers
    };

    if (existingMusician) {
      // Update existing musician record
      // Add updated_at only if your table doesn't have an auto-update trigger
      const updateData = {
        ...musicianData,
        // updated_at: new Date().toISOString(), // Uncomment if needed
      };
      const { error: updateError } = await supabase
        .from("musicians")
        .update(updateData)
        .eq("profile_id", user.id);

      if (updateError) {
        return { error: updateError };
      }
    } else {
      // Create new musician record
      // Note: Don't include created_at if your database auto-generates it
      // If your table has a default value for created_at, remove this line
      const { error: insertError } = await supabase
        .from("musicians")
        .insert(musicianData);

      if (insertError) {
        return { error: insertError };
      }
    }

    // Note: Password update should be handled separately through Supabase Auth
    // if profileData.password is provided, you might want to update it here
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
    console.error("Error saving musician profile:", error);
    return { error: { message: error.message } };
  }
};

/**
 * Get musician profile
 * @returns {Promise<{profile: object|null, error: object|null}>}
 */
export const getMusicianProfile = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { profile: null, error: { message: "User not authenticated" } };
    }

    const { data: profile, error: profileError } = await supabase
      .from("musicians")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (profileError) {
      return { profile: null, error: profileError };
    }

    return { profile, error: null };
  } catch (error) {
    console.error("Error getting musician profile:", error);
    return { profile: null, error: { message: error.message } };
  }
};

/**
 * Get musician profile by profile_id
 * @param {string} profileId - The profile_id of the musician
 * @returns {Promise<{profile: object|null, error: object|null}>}
 */
export const getMusicianProfileById = async (profileId) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("musicians")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (profileError) {
      return { profile: null, error: profileError };
    }

    return { profile, error: null };
  } catch (error) {
    console.error("Error getting musician profile by ID:", error);
    return { profile: null, error: { message: error.message } };
  }
};
