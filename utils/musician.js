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
    // musicians.id should match profiles.id (same UUID)
    const { data: existingMusician } = await supabase
      .from("musicians")
      .select("id")
      .eq("id", user.id)
      .single();

    // Prepare musician data
    // Convert genres array to comma-separated string for storage
    const genresString = Array.isArray(profileData.genres) 
      ? profileData.genres.join(", ") 
      : profileData.genres || "";
    
    const musicianData = {
      id: user.id, // Use the same ID as profiles.id
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      username: profileData.username,
      location: profileData.location,
      birthday: profileData.birthday,
      artist_name: profileData.artistName,
      genres: genresString, // Store as comma-separated string
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
        .eq("id", user.id);

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
      .eq("id", user.id)
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
 * Get musician profile by id
 * @param {string} profileId - The id of the musician (same as profiles.id)
 * @returns {Promise<{profile: object|null, error: object|null}>}
 */
export const getMusicianProfileById = async (profileId) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("musicians")
      .select("*")
      .eq("id", profileId)
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

/** Public Supabase Storage bucket for profile images (create in dashboard + RLS). */
const AVATAR_BUCKET = "avatars";

/**
 * Musician row + profile email/avatar for Account settings.
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export const getMusicianAccountForSettings = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: { message: "User not authenticated" } };
    }

    const [musicianRes, profileRes] = await Promise.all([
      supabase.from("musicians").select("*").eq("id", user.id).single(),
      supabase.from("profiles").select("email, avatar_url").eq("id", user.id).single(),
    ]);

    if (musicianRes.error) {
      return { data: null, error: musicianRes.error };
    }

    const m = musicianRes.data;
    const p = profileRes.data;

    return {
      data: {
        ...m,
        email: p?.email ?? user.email ?? m.email ?? "",
        avatar_url: p?.avatar_url ?? null,
      },
      error: null,
    };
  } catch (error) {
    console.error("getMusicianAccountForSettings:", error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Updates only fields the user is allowed to edit (not name, genre, birthday, age).
 */
export const updateMusicianEditableAccount = async ({
  email,
  username,
  artistName,
  location,
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

    const nextEmail = (email ?? "").trim();
    const authEmail = user.email?.toLowerCase() ?? "";
    if (nextEmail && nextEmail.toLowerCase() !== authEmail) {
      const { error: authEmailErr } = await supabase.auth.updateUser({
        email: nextEmail,
      });
      if (authEmailErr) {
        return { error: authEmailErr };
      }
    }

    const payload = {
      email: nextEmail,
      username: (username ?? "").trim(),
      artist_name: (artistName ?? "").trim(),
      location: (location ?? "").trim(),
      bio: (bio ?? "").trim(),
    };

    const { error: mErr } = await supabase
      .from("musicians")
      .update(payload)
      .eq("id", user.id);

    if (mErr) {
      return { error: mErr };
    }

    const { error: pErr } = await supabase
      .from("profiles")
      .update({ email: nextEmail })
      .eq("id", user.id);

    if (pErr) {
      return { error: pErr };
    }

    return { error: null };
  } catch (error) {
    console.error("updateMusicianEditableAccount:", error);
    return { error: { message: error.message } };
  }
};

/**
 * Uploads a local image to Storage and saves `profiles.avatar_url`.
 * Requires a public `avatars` bucket (or adjust bucket name / policies in Supabase).
 */
export const uploadMusicianAvatar = async (localUri) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { avatarUrl: null, error: { message: "User not authenticated" } };
    }

    const raw = localUri.split(".").pop()?.split("?")[0]?.toLowerCase() ?? "jpg";
    const ext = ["jpg", "jpeg", "png", "webp", "heic"].includes(raw) ? raw : "jpg";
    const objectPath = `${user.id}/avatar.${ext}`;

    const response = await fetch(localUri);
    const blob = await response.blob();
    const contentType = blob.type || (ext === "jpg" ? "image/jpeg" : `image/${ext}`);

    const { error: upErr } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(objectPath, blob, { upsert: true, contentType });

    if (upErr) {
      return { avatarUrl: null, error: upErr };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);

    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (dbErr) {
      return { avatarUrl: null, error: dbErr };
    }

    return { avatarUrl: publicUrl, error: null };
  } catch (error) {
    console.error("uploadMusicianAvatar:", error);
    return { avatarUrl: null, error: { message: error.message } };
  }
};

/** Display age from a calendar birthday (prefer over stored `age` when birthday exists). */
export const ageFromBirthday = (birthday) => {
  if (!birthday) return null;
  const d = new Date(birthday);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
};

export const formatBirthdayDisplay = (birthday) => {
  if (!birthday) return "";
  const d = new Date(birthday);
  if (Number.isNaN(d.getTime())) return String(birthday);
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};
