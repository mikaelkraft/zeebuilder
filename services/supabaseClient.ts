import { createClient } from '@supabase/supabase-js';

// Supabase client for authentication (uses app's Supabase, not user's)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GitHub OAuth login
export const signInWithGitHub = async () => {
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
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
};

// Sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Get GitHub access token from session (for GitHub API calls)
export const getGitHubToken = async () => {
    const session = await getSession();
    return session?.provider_token || null;
};
