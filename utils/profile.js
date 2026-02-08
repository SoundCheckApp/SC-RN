import { supabase } from "../lib/supabase";

/**
 * Check if user has a profile with account type
 * Checks both consumers and musicians tables
 * @returns {Promise<{hasProfile: boolean, accountType: string|null, error: object|null}>}
 */
export const checkUserProfile = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { hasProfile: false, accountType: null, error: null };
    }

    // Check if user exists in musicians table
    const { data: musician, error: musicianError } = await supabase
      .from("musicians")
      .select("profile_id")
      .eq("profile_id", user.id)
      .single();

    if (musician && !musicianError) {
      return { hasProfile: true, accountType: "musician", error: null };
    }

    // Check if user exists in consumers table
    const { data: consumer, error: consumerError } = await supabase
      .from("consumers")
      .select("profile_id")
      .eq("profile_id", user.id)
      .single();

    if (consumer && !consumerError) {
      return { hasProfile: true, accountType: "consumer", error: null };
    }

    // User doesn't exist in either table
    return { hasProfile: false, accountType: null, error: null };
  } catch (error) {
    console.error("Error checking user profile:", error);
    return { hasProfile: false, accountType: null, error: { message: error.message } };
  }
};

/**
 * Save account type to user profile
 * Creates a record in either musicians or consumers table
 * @param {string} accountType - "musician" or "consumer"
 * @returns {Promise<{error: object|null}>}
 */
export const saveAccountType = async (accountType) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: { message: "User not authenticated" } };
    }

    // Validate account type
    if (accountType !== "musician" && accountType !== "consumer") {
      return { error: { message: "Invalid account type" } };
    }

    // First, ensure profile exists in profiles table
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
          full_name: user.user_metadata?.full_name || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        return { error: profileError };
      }
    }

    // Check if user already has a record in either table
    const { data: existingMusician } = await supabase
      .from("musicians")
      .select("profile_id")
      .eq("profile_id", user.id)
      .single();

    const { data: existingConsumer } = await supabase
      .from("consumers")
      .select("profile_id")
      .eq("profile_id", user.id)
      .single();

    // If user already has an account type, don't allow changing it
    if (existingMusician || existingConsumer) {
      return { error: { message: "Account type already set" } };
    }

    // Insert into the appropriate table based on account type
    if (accountType === "musician") {
      const { error: insertError } = await supabase
        .from("musicians")
        .insert({
          profile_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        return { error: insertError };
      }
    } else if (accountType === "consumer") {
      const { error: insertError } = await supabase
        .from("consumers")
        .insert({
          profile_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        return { error: insertError };
      }
    }

    return { error: null };
  } catch (error) {
    console.error("Error saving account type:", error);
    return { error: { message: error.message } };
  }
};

/**
 * Get user profile with account type information
 * @returns {Promise<{profile: object|null, accountType: string|null, error: object|null}>}
 */
export const getUserProfile = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { profile: null, accountType: null, error: { message: "User not authenticated" } };
    }

    // Get profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return { profile: null, accountType: null, error: profileError };
    }

    // Check which account type table the user belongs to
    const { hasProfile, accountType } = await checkUserProfile();

    return { profile, accountType, error: null };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { profile: null, accountType: null, error: { message: error.message } };
  }
};
