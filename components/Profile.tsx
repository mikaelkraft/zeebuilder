
import React, { useState, useEffect } from 'react';
import { User, SupabaseConfig, CloudProviderType, CloudProviderConfig } from '../types';
import { User as UserIcon, Mail, Shield, Save, Loader2, Lock, KeyRound, AlertCircle, Cloud, Database, Check, Unlink, Info, Server, Flame, Zap } from 'lucide-react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

interface ProfileProps {
    user: User | null;
    onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: ''
    });
    
    const [passData, setPassData] = useState({
        current: '',
        newPass: '',
        confirm: ''
    });

    const [cloudProvider, setCloudProvider] = useState<CloudProviderType>('supabase');
    const [cloudConfig, setCloudConfig] = useState<CloudProviderConfig>({ 
        provider: 'supabase', 
        enabled: false 
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
    const [showReset, setShowReset] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email
            });
            
            const savedCloud = localStorage.getItem('zee_cloud_config');
            if (savedCloud) {
                const config = JSON.parse(savedCloud);
                setCloudConfig(config);
                setCloudProvider(config.provider || 'supabase');
            }
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        setTimeout(() => {
            if (user) {
                const updatedUser = { ...user, ...formData };
                onUpdateUser(updatedUser);
                localStorage.setItem('zee_user', JSON.stringify(updatedUser));
                
                const usersStr = localStorage.getItem('zee_users_db');
                if (usersStr) {
                    const users = JSON.parse(usersStr);
                    if (users[user.email]) {
                        users[user.email].profile = updatedUser;
                        localStorage.setItem('zee_users_db', JSON.stringify(users));
                    }
                }
                
                setMessage({ type: 'success', text: "Profile updated successfully!" });
            }
            setIsLoading(false);
        }, 800);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passData.newPass !== passData.confirm) {
            setMessage({ type: 'error', text: "New passwords do not match." });
            return;
        }
        if (!user?.email) return;
        setIsLoading(true);
        setMessage(null);
        try {
            await authService.changePassword(user.email, passData.current, passData.newPass);
            setMessage({ type: 'success', text: "Password updated successfully." });
            setPassData({ current: '', newPass: '', confirm: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Failed to update password." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCloud = (e: React.FormEvent) => {
        e.preventDefault();
        const configToSave = { ...cloudConfig, provider: cloudProvider, enabled: true };
        localStorage.setItem('zee_cloud_config', JSON.stringify(configToSave));
        setCloudConfig(configToSave);
        setMessage({ type: 'success', text: `${cloudProvider.charAt(0).toUpperCase() + cloudProvider.slice(1)} cloud sync connected!` });
    };

    const handleDisconnectCloud = () => {
        if (confirm('Disconnect cloud sync? Your local data will remain, but syncing will stop.')) {
            const emptyConfig: CloudProviderConfig = { provider: 'supabase', enabled: false };
            setCloudConfig(emptyConfig);
            localStorage.removeItem('zee_cloud_config');
            setMessage({ type: 'success', text: "Cloud sync disconnected." });
        }
    };

    const handleResetRequest = () => {
        setMessage({ type: 'success', text: `Password reset link sent to ${user?.email} (Simulated)` });
        setShowReset(false);
    };

    if (!user) return <div>Please log in to view profile.</div>;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
                
                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <img 
                            src={user.avatar} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800"
                        />
                    </div>
                </div>

                <div className="pt-16 px-8 pb-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.username}</h1>
                        <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                        {user.isAdmin && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 mt-2">
                                <Shield className="w-3 h-3 mr-1" /> Super Admin
                            </span>
                        )}
                    </div>

                    {message && (
                        <div className={`mb-6 p-3 rounded-lg text-sm font-medium flex items-center ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* General Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2">
                                General Information
                            </h3>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all disabled:opacity-70 w-full"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </button>
                            </form>
                        </div>

                        {/* Security & Cloud */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2 flex items-center">
                                    <Lock className="w-5 h-5 mr-2" /> Security
                                </h3>
                                <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
                                    <input 
                                        type="password"
                                        value={passData.current}
                                        onChange={(e) => setPassData({...passData, current: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-sm"
                                        placeholder="Current Password"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="password"
                                            value={passData.newPass}
                                            onChange={(e) => setPassData({...passData, newPass: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-sm"
                                            placeholder="New Password"
                                        />
                                        <input 
                                            type="password"
                                            value={passData.confirm}
                                            onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-sm"
                                            placeholder="Confirm"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <button type="button" onClick={() => setShowReset(true)} className="text-sm text-blue-600 hover:underline">Forgot?</button>
                                        <button type="submit" disabled={isLoading} className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-sm">
                                            Update
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2 flex items-center">
                                    <Cloud className="w-5 h-5 mr-2 text-blue-500" /> Cloud Sync (Optional)
                                </h3>
                                <div className="flex items-start gap-2 my-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Sync your <strong>Zee account data</strong> to your own cloud backend. Choose a provider below.
                                    </p>
                                </div>
                                
                                {cloudConfig.enabled ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-green-700 dark:text-green-400">
                                                    <Check className="w-4 h-4 mr-2" />
                                                    <span className="text-sm font-medium">Connected to {cloudConfig.provider}</span>
                                                </div>
                                                <button 
                                                    onClick={handleDisconnectCloud}
                                                    className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition-colors"
                                                >
                                                    <Unlink className="w-3 h-3 mr-1" /> Disconnect
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSaveCloud} className="space-y-3 mt-3">
                                        {/* Provider Selection */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { id: 'supabase', label: 'Supabase', icon: Database, color: 'text-green-500' },
                                                { id: 'firebase', label: 'Firebase', icon: Flame, color: 'text-orange-500' },
                                                { id: 'neon', label: 'Neon', icon: Zap, color: 'text-cyan-500' },
                                                { id: 'appwrite', label: 'Appwrite', icon: Server, color: 'text-pink-500' }
                                            ].map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => setCloudProvider(p.id as CloudProviderType)}
                                                    className={`p-2 rounded-lg border text-center transition-all ${
                                                        cloudProvider === p.id 
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <p.icon className={`w-4 h-4 mx-auto ${p.color}`} />
                                                    <span className="text-[10px] text-slate-600 dark:text-slate-400">{p.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Supabase Fields */}
                                        {cloudProvider === 'supabase' && (
                                            <>
                                                <input 
                                                    type="text"
                                                    value={cloudConfig.supabaseUrl || ''}
                                                    onChange={(e) => setCloudConfig({...cloudConfig, supabaseUrl: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm"
                                                    placeholder="Supabase Project URL"
                                                />
                                                <input 
                                                    type="password"
                                                    value={cloudConfig.supabaseKey || ''}
                                                    onChange={(e) => setCloudConfig({...cloudConfig, supabaseKey: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm"
                                                    placeholder="Supabase Anon Key"
                                                />
                                            </>
                                        )}

                                        {/* Firebase Fields */}
                                        {cloudProvider === 'firebase' && (
                                            <>
                                                <input 
                                                    type="text"
                                                    value={cloudConfig.firebaseProjectId || ''}
                                                    onChange={(e) => setCloudConfig({...cloudConfig, firebaseProjectId: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm"
                                                    placeholder="Firebase Project ID"
                                                />
                                                <input 
                                                    type="password"
                                                    value={cloudConfig.firebaseApiKey || ''}
                                                    onChange={(e) => setCloudConfig({...cloudConfig, firebaseApiKey: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm"
                                                    placeholder="Firebase API Key"
                                                />
                                                <input 
                                                    type="text"
                                                    value={cloudConfig.firebaseAppId || ''}
                                                    onChange={(e) => setCloudConfig({...cloudConfig, firebaseAppId: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm"
                                                    placeholder="Firebase App ID"
                                                />
                                            </>
                                        )}

                                        {/* Neon Fields */}
                                        {cloudProvider === 'neon' && (
                                            <input 
                                                type="password"
                                                value={cloudConfig.neonConnectionString || ''}
                                                onChange={(e) => setCloudConfig({...cloudConfig, neonConnectionString: e.target.value})}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm"
                                                placeholder="Neon Connection String (postgres://...)"
                                            />
                                        )}

                                        {/* Appwrite Fields */}
                                        {cloudProvider === 'appwrite' && (
                                            <>
                                                <input 
                                                    type="text"
                                                    value={cloudConfig.appwriteEndpoint || ''}
                                                    onChange={(e) => setCloudConfig({...cloudConfig, appwriteEndpoint: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm"
                                                    placeholder="Appwrite Endpoint (https://cloud.appwrite.io/v1)"
                                                />
                                                <input 
                                                    type="text"
                                                    value={cloudConfig.appwriteProjectId || ''}
                                                    onChange={(e) => setCloudConfig({...cloudConfig, appwriteProjectId: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm"
                                                    placeholder="Appwrite Project ID"
                                                />
                                                <input 
                                                    type="password"
                                                    value={cloudConfig.appwriteApiKey || ''}
                                                    onChange={(e) => setCloudConfig({...cloudConfig, appwriteApiKey: e.target.value})}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm"
                                                    placeholder="Appwrite API Key"
                                                />
                                            </>
                                        )}

                                        <button type="submit" className="w-full flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors">
                                            <Database className="w-4 h-4 mr-2" /> Connect {cloudProvider.charAt(0).toUpperCase() + cloudProvider.slice(1)}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {showReset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full">
                        <h4 className="text-lg font-bold mb-2 dark:text-white">Reset Password</h4>
                        <p className="text-sm text-slate-500 mb-4">Send recovery link to {user.email}.</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowReset(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                            <button onClick={handleResetRequest} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
