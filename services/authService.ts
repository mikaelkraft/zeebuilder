
import { User } from '../types';
import { usageService } from './usageService';

const USERS_KEY = 'zee_users_db';
const SESSION_KEY = 'zee_user';

// Auto-detect: Use real API only in production (when deployed)
// In development (localhost), use mock auth for immediate testing
const isProduction = typeof window !== 'undefined' && 
    !window.location.hostname.includes('localhost') && 
    !window.location.hostname.includes('127.0.0.1') &&
    !window.location.hostname.includes('0.0.0.0');

const USE_REAL_API = isProduction; // Auto-switches based on environment

// Simple mock hash for "security" (not real crypto but better than plain text for demo)
const hash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
};

export const authService = {
    register: async (email: string, password: string, username: string): Promise<User> => {
        if (USE_REAL_API) {
            // Real Vercel API call for production
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Registration failed');
            }
            
            const data = await res.json();
            
            // Store token if provided
            if (data.token) {
                localStorage.setItem('zee_auth_token', data.token);
            }
            
            // Return user object
            const user: User = data.user || {
                username: data.username || username,
                email: data.email || email,
                avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                isAdmin: data.isAdmin || false
            };
            
            // Initialize usage tracking
            usageService.init(user.email);
            
            return user;
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 600));

        const usersStr = localStorage.getItem(USERS_KEY);
        const users = usersStr ? JSON.parse(usersStr) : {};

        if (users[email]) {
            throw new Error('User already exists');
        }

        const newUser: User = {
            username,
            email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            isAdmin: false
        };

        // Store user with hashed password
        users[email] = {
            profile: newUser,
            passwordHash: hash(password)
        };

        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Initialize accounting for new user
        usageService.init(email);
        
        return newUser;
    },

    login: async (email: string, password: string): Promise<User> => {
        if (USE_REAL_API) {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Login failed');
            }
            
            const data = await res.json();
            
            // Store token if provided
            if (data.token) {
                localStorage.setItem('zee_auth_token', data.token);
            }
            
            // Return user object
            const user: User = data.user || {
                username: data.username,
                email: data.email,
                avatar: data.avatar,
                isAdmin: data.isAdmin || false
            };
            
            usageService.init(user.email);
            return user;
        }

        await new Promise(resolve => setTimeout(resolve, 600));

        // Super Admin check using environment variables
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const adminPasswordHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
        
        if (adminEmail && email === adminEmail && hash(password) === adminPasswordHash) {
            return {
                username: 'Mikael Kraft (Admin)',
                email: email,
                avatar: `https://github.com/mikaelkraft.png`,
                isAdmin: true
            };
        }

        const usersStr = localStorage.getItem(USERS_KEY);
        const users = usersStr ? JSON.parse(usersStr) : {};
        const userRecord = users[email];

        if (!userRecord) {
            throw new Error('User not found');
        }

        if (userRecord.passwordHash !== hash(password)) {
            throw new Error('Invalid password');
        }
        
        // Sync usage
        usageService.init(email);

        return userRecord.profile;
    },

    checkEmail: async (email: string): Promise<boolean> => {
        if (USE_REAL_API) {
            try {
                const res = await fetch('/api/auth/check-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                if (!res.ok) return false;
                const data = await res.json();
                return data.exists;
            } catch (e) {
                return false;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 400));
        const usersStr = localStorage.getItem(USERS_KEY);
        const users = usersStr ? JSON.parse(usersStr) : {};
        return !!users[email];
    },

    resetPassword: async (email: string, newPassword: string): Promise<void> => {
        if (USE_REAL_API) {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Password reset failed');
            }
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        
        const usersStr = localStorage.getItem(USERS_KEY);
        const users = usersStr ? JSON.parse(usersStr) : {};
        
        if (!users[email]) {
            throw new Error('User not found');
        }

        users[email].passwordHash = hash(newPassword);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    },

    changePassword: async (email: string, oldPass: string, newPass: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const usersStr = localStorage.getItem(USERS_KEY);
        const users = usersStr ? JSON.parse(usersStr) : {};
        
        if (!users[email]) {
             throw new Error('User session invalid.');
        }

        if (users[email].passwordHash !== hash(oldPass)) {
             throw new Error('Current password is incorrect.');
        }

        users[email].passwordHash = hash(newPass);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem(SESSION_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    logout: () => {
        localStorage.removeItem(SESSION_KEY);
    }
};
