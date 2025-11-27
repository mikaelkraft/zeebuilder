/*
  ZEEBUILDER VERCEL BACKEND - SUPABASE VERSION
  
  This file is kept for reference. The actual API routes are in:
  - /api/auth/login.js     - User login
  - /api/auth/register.js  - User registration
  - /api/user/usage.js     - Usage tracking
  - /api/lib/supabase.js   - Supabase client

  REQUIRED ENVIRONMENT VARIABLES (add to Vercel):
  - VITE_SUPABASE_URL          - Your Supabase project URL
  - VITE_SUPABASE_ANON_KEY     - Supabase anon/public key
  - SUPABASE_SERVICE_ROLE_KEY  - Supabase service role key (for backend)
  - JWT_SECRET                 - Secret for signing JWT tokens
  - VITE_ADMIN_EMAIL           - Super admin email
  - VITE_ADMIN_PASSWORD_HASH   - Super admin password hash
  - GEMINI_API_KEY             - Google Gemini API key

  SUPABASE TABLE SCHEMA:
  Run this SQL in Supabase SQL Editor:

  CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar TEXT,
    plan TEXT DEFAULT 'free',
    requests INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable Row Level Security
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;

  -- Policy: Users can read their own data
  CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

  -- Policy: Service role can do everything (for backend)
  CREATE POLICY "Service role full access" ON users
    FOR ALL USING (auth.role() = 'service_role');
*/

export default function handler(req, res) {
  res.status(200).json({ 
    message: 'ZeeBuilder API - See /api/auth/login, /api/auth/register, /api/user/usage' 
  });
}

