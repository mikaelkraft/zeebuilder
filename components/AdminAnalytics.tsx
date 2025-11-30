import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
    Users, Activity, TrendingUp, BarChart3, PieChart, 
    Crown, Zap, Clock, Calendar, Database, Globe,
    ArrowUp, ArrowDown, Minus, RefreshCw, Download,
    Code, MessageSquare, Image as ImageIcon, Sparkles, Shield
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface UserStats {
    total: number;
    active: number; // active in last 7 days
    newThisMonth: number;
    byPlan: { free: number; pro: number; enterprise: number };
}

interface UsageStats {
    totalRequests: number;
    requestsToday: number;
    requestsThisWeek: number;
    averagePerUser: number;
}

interface ActivityLog {
    id: string;
    userId: string;
    email: string;
    action: string;
    timestamp: number;
}

const AdminAnalytics: React.FC = () => {
    const [userStats, setUserStats] = useState<UserStats>({
        total: 0,
        active: 0,
        newThisMonth: 0,
        byPlan: { free: 0, pro: 0, enterprise: 0 }
    });
    const [usageStats, setUsageStats] = useState<UsageStats>({
        totalRequests: 0,
        requestsToday: 0,
        requestsThisWeek: 0,
        averagePerUser: 0
    });
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setIsLoading(true);
        
        try {
            // Try to load from Supabase first
            if (supabase) {
                const { data: users, error } = await supabase
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && users) {
                    processUserData(users);
                    setAllUsers(users);
                }
            }
            
            // Fallback to localStorage for demo/dev
            const localUsers = localStorage.getItem('zee_users_db');
            if (localUsers) {
                const parsed = JSON.parse(localUsers);
                const userArray = Object.values(parsed).map((u: any) => u.profile || u);
                if (userArray.length > 0) {
                    processUserData(userArray);
                    setAllUsers(userArray);
                }
            }

            // Generate sample activity for demo
            generateSampleActivity();
            
        } catch (e) {
            console.error('Failed to load analytics:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const processUserData = (users: any[]) => {
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

        const stats: UserStats = {
            total: users.length,
            active: 0,
            newThisMonth: 0,
            byPlan: { free: 0, pro: 0, enterprise: 0 }
        };

        let totalRequests = 0;

        users.forEach((u: any) => {
            const createdAt = u.created_at ? new Date(u.created_at).getTime() : (u.createdAt || now);
            const lastActive = u.updated_at ? new Date(u.updated_at).getTime() : (u.lastActive || now);

            if (lastActive > oneWeekAgo) stats.active++;
            if (createdAt > oneMonthAgo) stats.newThisMonth++;

            const plan = u.plan || 'free';
            if (plan === 'pro') stats.byPlan.pro++;
            else if (plan === 'enterprise') stats.byPlan.enterprise++;
            else stats.byPlan.free++;

            totalRequests += u.requests || 0;
        });

        setUserStats(stats);
        setUsageStats({
            totalRequests,
            requestsToday: Math.floor(totalRequests * 0.05),
            requestsThisWeek: Math.floor(totalRequests * 0.25),
            averagePerUser: users.length > 0 ? Math.floor(totalRequests / users.length) : 0
        });
    };

    const generateSampleActivity = () => {
        const activities = [
            { action: 'Created new project', icon: 'code' },
            { action: 'Generated image', icon: 'image' },
            { action: 'Used AI chat', icon: 'message' },
            { action: 'Deployed to Vercel', icon: 'globe' },
            { action: 'Connected GitHub', icon: 'git' },
            { action: 'Upgraded to Pro', icon: 'crown' },
        ];

        const sampleActivity: ActivityLog[] = [];
        for (let i = 0; i < 10; i++) {
            const activity = activities[Math.floor(Math.random() * activities.length)];
            sampleActivity.push({
                id: `act-${i}`,
                userId: `user-${i}`,
                email: `user${i}@example.com`,
                action: activity.action,
                timestamp: Date.now() - (i * 1000 * 60 * 60 * Math.random() * 24)
            });
        }
        setRecentActivity(sampleActivity);
    };

    const formatTimeAgo = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wide">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value.toLocaleString()}</p>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            {trend !== undefined && (
                <div className={`flex items-center mt-2 text-xs ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                    {trend > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : trend < 0 ? <ArrowDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
                    {Math.abs(trend)}% from last period
                </div>
            )}
        </div>
    );

    // Simple bar chart component
    const BarChart = ({ data, height = 120 }: { data: { label: string; value: number; color: string }[], height?: number }) => {
        const maxValue = Math.max(...data.map(d => d.value), 1);
        return (
            <div className="flex items-end gap-2 justify-around" style={{ height }}>
                {data.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                        <span className="text-xs text-white font-bold mb-1">{d.value}</span>
                        <div 
                            className={`w-full rounded-t ${d.color} transition-all duration-500`}
                            style={{ height: `${(d.value / maxValue) * (height - 30)}px`, minHeight: 4 }}
                        />
                        <span className="text-[10px] text-slate-400 mt-1">{d.label}</span>
                    </div>
                ))}
            </div>
        );
    };

    // Donut chart component
    const DonutChart = ({ data, size = 120 }: { data: { label: string; value: number; color: string }[], size?: number }) => {
        const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
        let cumulative = 0;
        const strokeWidth = 20;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {data.map((d, i) => {
                        const percentage = d.value / total;
                        const strokeDasharray = `${percentage * circumference} ${circumference}`;
                        const strokeDashoffset = -cumulative * circumference;
                        cumulative += percentage;

                        return (
                            <circle
                                key={i}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="transparent"
                                stroke={d.color.replace('bg-', '#').replace('blue-500', '3b82f6').replace('purple-500', 'a855f7').replace('yellow-500', 'eab308').replace('slate-600', '475569')}
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl font-bold text-white">{total}</p>
                        <p className="text-[10px] text-slate-400">Total</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
                        Admin Analytics
                    </h1>
                    <p className="text-slate-400 text-sm">Platform overview and user insights</p>
                </div>
                <div className="flex items-center gap-2">
                    <select 
                        value={timeRange} 
                        onChange={e => setTimeRange(e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                    <button 
                        onClick={loadAnalytics}
                        disabled={isLoading}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Users" 
                    value={userStats.total} 
                    subtitle={`${userStats.newThisMonth} new this month`}
                    icon={Users} 
                    color="bg-blue-600"
                    trend={12}
                />
                <StatCard 
                    title="Active Users" 
                    value={userStats.active} 
                    subtitle="Active in last 7 days"
                    icon={Activity} 
                    color="bg-green-600"
                    trend={8}
                />
                <StatCard 
                    title="Total Requests" 
                    value={usageStats.totalRequests} 
                    subtitle={`${usageStats.requestsToday} today`}
                    icon={Zap} 
                    color="bg-purple-600"
                    trend={24}
                />
                <StatCard 
                    title="Avg per User" 
                    value={usageStats.averagePerUser} 
                    subtitle="AI requests per user"
                    icon={TrendingUp} 
                    color="bg-orange-600"
                    trend={5}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* User Tiers */}
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center">
                        <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                        Users by Plan
                    </h3>
                    <div className="flex items-center gap-4">
                        <DonutChart 
                            data={[
                                { label: 'Free', value: userStats.byPlan.free, color: 'bg-slate-600' },
                                { label: 'Pro', value: userStats.byPlan.pro, color: 'bg-blue-500' },
                                { label: 'Enterprise', value: userStats.byPlan.enterprise, color: 'bg-purple-500' },
                            ]}
                        />
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center text-slate-400">
                                    <span className="w-2 h-2 bg-slate-600 rounded-full mr-2" />
                                    Free
                                </span>
                                <span className="text-white font-bold">{userStats.byPlan.free}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center text-slate-400">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                                    Pro
                                </span>
                                <span className="text-white font-bold">{userStats.byPlan.pro}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center text-slate-400">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                                    Enterprise
                                </span>
                                <span className="text-white font-bold">{userStats.byPlan.enterprise}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Over Time */}
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 lg:col-span-2">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-green-500" />
                        Request Volume
                    </h3>
                    <BarChart 
                        data={[
                            { label: 'Mon', value: Math.floor(usageStats.requestsThisWeek * 0.12), color: 'bg-blue-500' },
                            { label: 'Tue', value: Math.floor(usageStats.requestsThisWeek * 0.18), color: 'bg-blue-500' },
                            { label: 'Wed', value: Math.floor(usageStats.requestsThisWeek * 0.22), color: 'bg-blue-500' },
                            { label: 'Thu', value: Math.floor(usageStats.requestsThisWeek * 0.15), color: 'bg-blue-500' },
                            { label: 'Fri', value: Math.floor(usageStats.requestsThisWeek * 0.20), color: 'bg-blue-600' },
                            { label: 'Sat', value: Math.floor(usageStats.requestsThisWeek * 0.08), color: 'bg-blue-400' },
                            { label: 'Sun', value: Math.floor(usageStats.requestsThisWeek * 0.05), color: 'bg-blue-400' },
                        ]}
                        height={100}
                    />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Activity */}
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        Recent Activity
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        {recentActivity.map(activity => (
                            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-[10px] text-slate-400 uppercase">
                                        {activity.email[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs text-white">{activity.action}</p>
                                        <p className="text-[10px] text-slate-500">{activity.email}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-500">{formatTimeAgo(activity.timestamp)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Users Table */}
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center">
                            <Users className="w-4 h-4 mr-2 text-purple-500" />
                            All Users
                        </h3>
                        <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center">
                            <Download className="w-3 h-3 mr-1" /> Export
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-700">
                                    <th className="text-left py-2">User</th>
                                    <th className="text-left py-2">Plan</th>
                                    <th className="text-right py-2">Requests</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.slice(0, 8).map((u, i) => (
                                    <tr key={i} className="border-b border-slate-700/50 last:border-0">
                                        <td className="py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-[10px] text-white uppercase font-bold">
                                                    {(u.email || u.username || 'U')[0]}
                                                </div>
                                                <div>
                                                    <p className="text-white">{u.username || 'User'}</p>
                                                    <p className="text-slate-500 text-[10px]">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                u.plan === 'enterprise' ? 'bg-purple-900/50 text-purple-400' :
                                                u.plan === 'pro' ? 'bg-blue-900/50 text-blue-400' :
                                                'bg-slate-700 text-slate-400'
                                            }`}>
                                                {(u.plan || 'free').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-right text-slate-400">{(u.requests || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {allUsers.length > 8 && (
                        <p className="text-center text-xs text-slate-500 mt-2">+{allUsers.length - 8} more users</p>
                    )}
                </div>
            </div>

            {/* Feature Usage */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                    Feature Usage Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { name: 'AI Code Gen', value: Math.floor(usageStats.totalRequests * 0.45), icon: Code, color: 'text-blue-500' },
                        { name: 'Image Gen', value: Math.floor(usageStats.totalRequests * 0.25), icon: ImageIcon, color: 'text-purple-500' },
                        { name: 'AI Chat', value: Math.floor(usageStats.totalRequests * 0.20), icon: MessageSquare, color: 'text-green-500' },
                        { name: 'Deployments', value: Math.floor(usageStats.totalRequests * 0.10), icon: Globe, color: 'text-orange-500' },
                    ].map((feature, i) => (
                        <div key={i} className="bg-slate-900/50 rounded-lg p-3 text-center">
                            <feature.icon className={`w-6 h-6 mx-auto mb-2 ${feature.color}`} />
                            <p className="text-lg font-bold text-white">{feature.value.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">{feature.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
