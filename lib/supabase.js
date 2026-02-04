import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Get Supabase URL and Anon Key from environment variables
// Make sure your .env file has:
// EXPO_PUBLIC_SUPABASE_URL=your_url_here
// EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase URL and Anon Key are not set. Please add them to your .env file:\n" +
    "EXPO_PUBLIC_SUPABASE_URL=your_supabase_url\n" +
    "EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
  );
}

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
