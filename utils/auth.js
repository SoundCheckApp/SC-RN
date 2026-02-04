import { supabase } from "../lib/supabase";

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User's full name
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export const signUp = async (email, password, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
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
