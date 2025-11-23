
// Service to track user usage and account accounting
// In a real Vercel app, this would sync with a database via API

export interface UsageStats {
    requests: number;
    generations: {
        code: number;
        image: number;
        video: number;
        audio: number;
    };
    storageBytes: number;
    plan: 'free' | 'pro' | 'enterprise';
    limit: number;
}

const USAGE_KEY = 'zee_usage_stats';

const defaultStats: UsageStats = {
    requests: 0,
    generations: { code: 0, image: 0, video: 0, audio: 0 },
    storageBytes: 0,
    plan: 'free',
    limit: 1000 // Free tier request limit
};

export const usageService = {
    currentStats: defaultStats,

    init: (userId: string) => {
        const stored = localStorage.getItem(`${USAGE_KEY}_${userId}`);
        if (stored) {
            usageService.currentStats = JSON.parse(stored);
        } else {
            usageService.currentStats = { ...defaultStats };
            usageService.save(userId);
        }
    },

    trackRequest: (userId: string, type: 'code' | 'image' | 'video' | 'audio') => {
        if (!userId) return;
        
        usageService.currentStats.requests++;
        usageService.currentStats.generations[type]++;
        
        // Simulate storage usage (random bytes)
        usageService.currentStats.storageBytes += Math.floor(Math.random() * 1024 * 50); // ~50KB

        usageService.save(userId);
    },

    getStats: (userId: string): UsageStats => {
        const stored = localStorage.getItem(`${USAGE_KEY}_${userId}`);
        return stored ? JSON.parse(stored) : defaultStats;
    },

    save: (userId: string) => {
        localStorage.setItem(`${USAGE_KEY}_${userId}`, JSON.stringify(usageService.currentStats));
        
        // Integration point: If we had a real backend, we would sync here
        // syncToBackend(userId, usageService.currentStats);
    },

    upgradePlan: (userId: string) => {
        usageService.currentStats.plan = 'pro';
        usageService.currentStats.limit = 100000;
        usageService.save(userId);
    }
};
