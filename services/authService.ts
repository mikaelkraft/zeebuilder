
import { User } from '../types';
import { usageService } from './usageService';

const USERS_KEY = 'zee_users_db';
const SESSION_KEY = 'zee_user';
const USE_REAL_API = false; // Toggle this to TRUE when backend is deployed to Vercel

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
            // Example of how the Real Vercel API call would look
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username })
            });
            if (!res.ok) throw new Error('Registration failed');
            return await res.json();
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
            if (!res.ok) throw new Error('Login failed');
            const user = await res.json();
            usageService.init(user.email);
            return user;
        }

        await new Promise(resolve => setTimeout(resolve, 600));

        // Super Admin Backdoor
        if (email === "mikewillkraft@gmail.com" && password === "Nomercy2_") {
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
        await new Promise(resolve => setTimeout(resolve, 400));
        const usersStr = localStorage.getItem(USERS_KEY);
        const users = usersStr ? JSON.parse(usersStr) : {};
        return !!users[email];
    },

    resetPassword: async (email: string, newPassword: string): Promise<void> => {
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
