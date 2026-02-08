# Database Setup Guide

## Database Structure

Your Supabase database should have the following structure:

1. **profiles** table - Base user profile information
2. **musicians** table - Musician-specific data (references profiles via `profile_id`)
3. **consumers** table - Consumer-specific data (references profiles via `profile_id`)

## Table Relationships

- Both `musicians` and `consumers` tables have a `profile_id` column that references `profiles.id`
- Each user has one profile, and can be either a musician OR a consumer (not both)
- The `profile_id` in both tables uses the same UUID as the user's auth ID

## Required Table Structure

### profiles table
- `id` (UUID, Primary Key, References auth.users)
- `full_name` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### musicians table
- `id` (UUID, Primary Key, Auto-generated)
- `profile_id` (UUID, References profiles.id, Unique)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- ... (any other musician-specific fields)

### consumers table
- `id` (UUID, Primary Key, Auto-generated)
- `profile_id` (UUID, References profiles.id, Unique)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- ... (any other consumer-specific fields)

## Row Level Security (RLS) Setup

Make sure RLS is enabled and policies are set up for all three tables:

### profiles table policies
- Users can view their own profile
- Users can insert their own profile
- Users can update their own profile

### musicians table policies
- Users can view their own musician record
- Users can insert their own musician record
- Users can update their own musician record

### consumers table policies
- Users can view their own consumer record
- Users can insert their own consumer record
- Users can update their own consumer record

## How It Works

1. When a user signs up, a profile is created in the `profiles` table
2. When they select an account type:
   - If "Musician" → A record is created in the `musicians` table with `profile_id = user.id`
   - If "Consumer" → A record is created in the `consumers` table with `profile_id = user.id`
3. The app checks which table contains the user's `profile_id` to determine their account type

## Testing

1. Sign up a new user in your app
2. You should be redirected to the account type selection screen
3. Select an account type (Musician or Consumer)
4. Check the appropriate table (`musicians` or `consumers`) in Supabase to verify the record was created with the correct `profile_id`
