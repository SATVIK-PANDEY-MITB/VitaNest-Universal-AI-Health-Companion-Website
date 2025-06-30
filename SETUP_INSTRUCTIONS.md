# Database Setup Instructions

## Critical: You must run the database setup before the app will work properly!

The errors you're seeing are because the Supabase database tables don't exist yet. Follow these steps to fix this:

### Step 1: Set up your Supabase Database

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Open your project** (the one with URL: `https://gcdzvjfkesiluwrjknab.supabase.co`)
3. **Navigate to the SQL Editor** (in the left sidebar)
4. **Copy the entire contents** of the file `supabase/complete_schema.sql` 
5. **Paste it into the SQL Editor**
6. **Click "Run"** to execute the script

This will create all the necessary tables, relationships, and security policies.

### Step 2: Set up your API Keys (Optional but Recommended)

1. **Create a `.env` file** in your project root (copy from `.env.example`)
2. **Update the API keys** with your actual keys:
   - Get a RevenueCat API key from: https://app.revenuecat.com/
   - Get an OpenAI API key from: https://platform.openai.com/api-keys
   - Get ElevenLabs API key from: https://elevenlabs.io/
   - Get Tavus API key from: https://tavus.io/

### Step 3: Restart your development server

```bash
npm run dev
```

### What the database setup creates:

- ✅ `users` table for user profiles
- ✅ `health_profiles` table for health information  
- ✅ `medications` table for medication tracking
- ✅ `appointments` table for appointment management
- ✅ `chat_messages` table for AI chat history
- ✅ All foreign key relationships
- ✅ Row Level Security (RLS) policies
- ✅ Automatic user profile creation on signup
- ✅ Database indexes for performance

### Troubleshooting:

If you still see errors after running the SQL script:

1. **Check the SQL Editor for any error messages**
2. **Make sure you're in the correct Supabase project**
3. **Try refreshing your browser and running the app again**
4. **Check that your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in your `.env` file**

The app should work perfectly after completing Step 1. The API key setup in Step 2 is optional - the app will work with mock data if the keys aren't configured.