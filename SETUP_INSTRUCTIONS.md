# Database Setup Instructions

## Issue Fixed
The database was missing the `full_name` and `email` columns in the `profiles` table, and profiles weren't being created automatically on signup.

## What Was Fixed

### 1. Created SQL Setup Script
A complete SQL setup script (`supabase_setup.sql`) has been created that:
- Creates the `profiles` table with `full_name` and `email` columns
- Creates the `musicians` and `consumers` tables
- Sets up automatic profile creation via database trigger when users sign up
- Configures Row Level Security (RLS) policies
- Creates indexes for better performance

### 2. Updated Code
- Updated `utils/profile.js` to include email when creating profiles
- Updated `utils/musician.js` to include email in profile creation/updates
- Updated `utils/consumer.js` to include email in profile creation/updates

## How to Fix Your Database

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run the Setup Script
1. Open the file `supabase_setup.sql` in this project
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Step 3: Verify Setup
After running the script, verify:
1. Go to "Table Editor" in Supabase
2. You should see three tables: `profiles`, `musicians`, and `consumers`
3. Check the `profiles` table structure - it should have:
   - `id` (UUID, Primary Key)
   - `full_name` (Text)
   - `email` (Text)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

### Step 4: Test the App
1. Try signing up with a new user
2. The profile should be automatically created in the `profiles` table
3. You should see the email and full_name in the database

## Important Notes

- **Existing Users**: If you have existing users in `auth.users` but no profiles, the trigger will only work for NEW signups. For existing users, profiles will be created when they select an account type.

- **RLS Policies**: The script sets up Row Level Security so users can only access their own data. Make sure these policies are working correctly.

- **Automatic Profile Creation**: The database trigger (`handle_new_user`) automatically creates a profile when a new user signs up, so you should see profiles appear immediately after signup.

## Troubleshooting

### If you get "relation already exists" errors:
- The tables might already exist. You can either:
  1. Drop the existing tables and recreate them (⚠️ This will delete all data)
  2. Or modify the script to use `CREATE TABLE IF NOT EXISTS` (already included)

### If profiles still aren't being created:
- Check that the trigger was created: Go to Database → Functions in Supabase
- Verify RLS policies are enabled: Go to Authentication → Policies
- Check the Supabase logs for any errors

### If you see "permission denied" errors:
- Make sure RLS policies are set up correctly
- Verify the user is authenticated when trying to insert/update

## Next Steps

After running the SQL script:
1. Test signup with a new user
2. Check the `profiles` table to verify the user's email and full_name are saved
3. Complete the account type selection
4. Verify the profile is linked correctly in `musicians` or `consumers` table
