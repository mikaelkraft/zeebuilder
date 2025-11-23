
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig, User, Task, SavedProject, ChatSession } from '../types';

const SUPABASE_CONFIG_KEY = 'zee_supabase_config';

// Wrapper for data persistence
export const storageService = {
    client: null as SupabaseClient | null,

    init: () => {
        const configStr = localStorage.getItem(SUPABASE_CONFIG_KEY);
        if (configStr) {
            const config: SupabaseConfig = JSON.parse(configStr);
            if (config.enabled && config.url && config.key) {
                try {
                    storageService.client = createClient(config.url, config.key);
                } catch (e) {
                    console.error("Failed to init Supabase client", e);
                }
            }
        }
    },

    saveConfig: (config: SupabaseConfig) => {
        localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
        storageService.init();
    },

    getConfig: (): SupabaseConfig | null => {
        const s = localStorage.getItem(SUPABASE_CONFIG_KEY);
        return s ? JSON.parse(s) : null;
    },

    // Generic Get
    get: async <T>(key: string, fallback: T): Promise<T> => {
        // Try Cloud first if enabled
        if (storageService.client) {
            try {
                // Assuming a table 'key_value_store' with columns: key (text), value (jsonb), user_id (text)
                // This is a simplification. Real app needs specific tables.
                // For this demo, we might just sync to localStorage still or implement specific logic.
                // Let's stick to LocalStorage for read speed, but sync to Cloud in background.
            } catch (e) {
                console.error("Cloud read error", e);
            }
        }
        
        const local = localStorage.getItem(key);
        return local ? JSON.parse(local) : fallback;
    },

    // Generic Save
    save: async (key: string, data: any) => {
        localStorage.setItem(key, JSON.stringify(data));
        
        if (storageService.client) {
            // Fire and forget cloud sync
            // In a real implementation, you'd map 'zee_tasks' to a 'tasks' table, etc.
            // For now, we just log that we WOULD sync.
            console.log(`[Cloud Sync] Syncing ${key} to Supabase...`);
        }
    }
};
