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
 * Save account type preference (temporary - just for routing)
 * The actual profile records are created in the profile creation pages
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

    // Ensure profile exists in profiles table (just basic profile)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingProfile) {
      // Create basic profile if it doesn't exist
      // Don't add account_type here - that will be determined by which table they're in
      // Email is the primary identifier for authentication
      // Use upsert to handle race conditions where trigger might create profile simultaneously
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email || "",
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        // If it's a duplicate key error, the profile was likely created by trigger - that's okay
        if (profileError.code !== '23505') { // 23505 is unique_violation
          return { error: profileError };
        }
      }
    } else {
      // Update profile with email if it's missing
      if (!existingProfile.email && user.email) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ email: user.email })
          .eq("id", user.id);
        
        if (updateError) {
          console.error("Error updating profile email:", updateError);
        }
      }
    }

    // Don't create records in musicians/consumers tables yet
    // Those will be created when they complete their profile on the profile creation pages
    // This function just ensures the basic profile exists

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
