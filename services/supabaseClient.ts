import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client for authentication (uses app's Supabase, not user's)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create client if we have valid credentials
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
    }
}

// Export supabase (may be null if not configured)
export { supabase };

// GitHub OAuth login
export const signInWithGitHub = async () => {
    if (!supabase) {
        throw new Error('Supabase not configured');
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.origin,
            scopes: 'repo read:user user:email'
        }
    });
    
    if (error) throw error;
    return data;
};

// Get current Supabase session
export const getSession = async () => {
    if (!supabase) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('getSession error:', error);
        return null;
    }
    return session;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
    if (!supabase) {
        // Return a dummy subscription object
        return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
};

// Sign out
export const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Get GitHub access token from session (for GitHub API calls)
export const getGitHubToken = async () => {
    const session = await getSession();
    return session?.provider_token || null;
};
