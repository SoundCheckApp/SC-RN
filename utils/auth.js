import { supabase } from "../lib/supabase";

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export const signUp = async (email, password) => {
  try {
    // Attempt to sign up
    // Note: Supabase will handle duplicate email detection
    // Email is used for authentication, no need for full_name in metadata
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(), // Normalize email
      password,
    });

    // Log the response for debugging
    console.log("Signup response:", { data, error });

    if (error) {
      // Log full error for debugging
      console.error("Supabase signup error:", {
        message: error.message,
        status: error.status,
        code: error.code,
        fullError: error,
      });

      // Check Supabase error codes and messages
      const errorMessage = error.message?.toLowerCase() || "";
      const errorStatus = error.status;
      const errorCode = error.code;

      // Only treat as "already registered" if we're certain
      // Supabase returns specific error codes for this
      const isAlreadyRegistered = 
        errorMessage.includes("already registered") ||
        errorMessage.includes("user already registered") ||
        errorCode === "user_already_registered" ||
        (errorStatus === 400 && errorMessage.includes("already"));

      if (isAlreadyRegistered) {
        // User already exists - suggest signing in
        return { 
          user: null, 
          error: { message: "An account with this email already exists. Please sign in instead." } 
        };
      }

      // For other errors, return the actual error message
      // This might be validation errors, network errors, etc.
      return { 
        user: null, 
        error: { 
          message: error.message || "Failed to create account. Please try again.",
          code: errorCode,
          status: errorStatus,
        } 
      };
    }

    // Signup was successful
    // Note: If email confirmation is required, data.user might be null
    // but data.session will also be null. We should still proceed.
    // The account was created in Supabase Auth, even if not confirmed yet.
    
    if (data.user || data.session) {
      // User is created and/or session exists
      return { user: data.user || { email }, error: null, needsConfirmation: !data.user };
    }

    // Even if both user and session are null (email confirmation required),
    // the signup was successful - account was created
    return { user: { email }, error: null, needsConfirmation: true };
  } catch (error) {
    console.error("Signup exception:", error);
    return { user: null, error: { message: error.message || "An unexpected error occurred" } };
  }
};

/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error: { message: error.message } };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<{error: object|null}>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: { message: error.message } };
  }
};

/**
 * Reset password for a user
 * @param {string} email - User email
 * @returns {Promise<{error: object|null}>}
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "scapp://reset-password", // Deep link for password reset
    });

    return { error };
  } catch (error) {
    return { error: { message: error.message } };
  }
};

/**
 * Get the current session/user
 * @returns {Promise<{session: object|null, user: object|null}>}
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { session: null, user: null };
    }

    return { session, user: session?.user || null };
  } catch (error) {
    return { session: null, user: null };
  }
};

/**
 * Get the current user
 * @returns {Promise<{user: object|null}>}
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { user: null };
    }

    return { user };
  } catch (error) {
    return { user: null };
  }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function that receives (event, session)
 * @returns {Function} - Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
