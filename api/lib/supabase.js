import { createClient } from '@supabase/supabase-js';

// For serverless functions, use non-VITE prefixed env vars
// Vercel only exposes VITE_ vars to the frontend bundle, not serverless functions
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Use service role key for backend operations (bypasses RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// For client-side operations
export const supabaseAnon = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
