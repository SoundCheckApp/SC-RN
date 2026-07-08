import { supabase } from "../lib/supabase";

/**
 * Whether the signed-in consumer follows a musician.
 * @returns {Promise<{ following: boolean, error: object|null }>}
 */
export async function isFollowingMusician(musicianId) {
  try {
    if (!musicianId) {
      return { following: false, error: null };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { following: false, error: null };
    }

    const { data, error } = await supabase
      .from("consumer_follows")
      .select("id")
      .eq("consumer_id", user.id)
      .eq("musician_id", musicianId)
      .maybeSingle();

    if (error) {
      return { following: false, error };
    }

    return { following: Boolean(data), error: null };
  } catch (error) {
    console.error("isFollowingMusician:", error);
    return { following: false, error: { message: error.message } };
  }
}

/**
 * Follow a musician (insert into consumer_follows).
 * @returns {Promise<{ error: object|null }>}
 */
export async function followMusician(musicianId) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: { message: "Sign in to follow musicians" } };
    }

    const { error } = await supabase.from("consumer_follows").insert({
      consumer_id: user.id,
      musician_id: musicianId,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error("followMusician:", error);
    return { error: { message: error.message } };
  }
}

/**
 * Unfollow a musician (delete from consumer_follows).
 * @returns {Promise<{ error: object|null }>}
 */
export async function unfollowMusician(musicianId) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: { message: "Sign in to unfollow musicians" } };
    }

    const { error } = await supabase
      .from("consumer_follows")
      .delete()
      .eq("consumer_id", user.id)
      .eq("musician_id", musicianId);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error("unfollowMusician:", error);
    return { error: { message: error.message } };
  }
}
