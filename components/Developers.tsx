
import React, { useState, useEffect } from 'react';
import { User, ApiKey, ApiQuota } from '../types';
import { Terminal, Key, Copy, Plus, Trash2, Book, Server, ShieldCheck, Code, Play, Loader2, Activity, CreditCard, AlertTriangle, Clock, Zap, Image, Mic, FileCode, RefreshCw } from 'lucide-react';
import { simulateApiCall } from '../services/geminiService';
import { usageService, UsageStats } from '../services/usageService';

interface DevelopersProps {
    user: User | null;
}

// API Quota Plans
const QUOTA_PLANS: Record<string, ApiQuota['limits']> = {
    free: {
        requestsPerDay: 100,
        requestsPerMinute: 10,
        codeGenerations: 50,
        imageGenerations: 10,
        audioMinutes: 5
    },
    pro: {
        requestsPerDay: 5000,
        requestsPerMinute: 60,
        codeGenerations: 2000,
        imageGenerations: 500,
        audioMinutes: 120
    },
    enterprise: {
        requestsPerDay: 100000,
        requestsPerMinute: 500,
        codeGenerations: 50000,
        imageGenerations: 10000,
        audioMinutes: 1000
    }
};

const Developers: React.FC<DevelopersProps> = ({ user }) => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState('https://api.zee.com');
    const [stats, setStats] = useState<UsageStats | null>(null);

    // Playground State
    const [testKey, setTestKey] = useState('');
    const [testPrompt, setTestPrompt] = useState('Create a login screen with React');
    const [testEndpoint, setTestEndpoint] = useState('/api/v1/generate');
    const [isTesting, setIsTesting] = useState(false);
    const [testResponse, setTestResponse] = useState<string | null>(null);

    // Quota State
    const [quota, setQuota] = useState<ApiQuota | null>(null);
    const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

    const loadQuota = (email: string) => {
        const savedQuota = localStorage.getItem(`zee_api_quota_${email}`);
        if (savedQuota) {
            const q = JSON.parse(savedQuota);
            // Reset daily usage if new day
            const today = new Date().toDateString();
            const lastReset = new Date(q.usage.lastReset).toDateString();
            if (today !== lastReset) {
                q.usage = { requestsToday: 0, codeGenerationsToday: 0, imageGenerationsToday: 0, audioMinutesToday: 0, lastReset: Date.now() };
                localStorage.setItem(`zee_api_quota_${email}`, JSON.stringify(q));
            }
            setQuota(q);
        } else {
            // Initialize with free plan
            const newQuota: ApiQuota = {
                plan: 'free',
                limits: QUOTA_PLANS.free,
                usage: { requestsToday: 0, codeGenerationsToday: 0, imageGenerationsToday: 0, audioMinutesToday: 0, lastReset: Date.now() }
            };
            localStorage.setItem(`zee_api_quota_${email}`, JSON.stringify(newQuota));
            setQuota(newQuota);
        }
    };

    const checkQuota = (type: 'request' | 'code' | 'image' | 'audio'): boolean => {
        if (!quota) return false;
        switch (type) {
            case 'request': return quota.usage.requestsToday < quota.limits.requestsPerDay;
            case 'code': return quota.usage.codeGenerationsToday < quota.limits.codeGenerations;
            case 'image': return quota.usage.imageGenerationsToday < quota.limits.imageGenerations;
            case 'audio': return quota.usage.audioMinutesToday < quota.limits.audioMinutes;
            default: return true;
        }
    };

    const incrementUsage = (type: 'request' | 'code' | 'image' | 'audio') => {
        if (!quota || !user) return;
        const updated = { ...quota };
        updated.usage.requestsToday++;
        if (type === 'code') updated.usage.codeGenerationsToday++;
        if (type === 'image') updated.usage.imageGenerationsToday++;
        if (type === 'audio') updated.usage.audioMinutesToday++;
        setQuota(updated);
        localStorage.setItem(`zee_api_quota_${user.email}`, JSON.stringify(updated));
    };

    useEffect(() => {
        if (user) {
            const storedKeys = localStorage.getItem(`zee_api_keys_${user.email}`);
            if (storedKeys) {
                setApiKeys(JSON.parse(storedKeys));
            }
            // Load Usage Stats
            setStats(usageService.getStats(user.email));
            // Load Quota
            loadQuota(user.email);
        }
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
    }, [user]);

    const generateKey = () => {
        if (!newKeyName) return;
        
        const prefix = "zee_live_";
        const randomPart = Array.from({length: 32}, () => Math.floor(Math.random() * 36).toString(36)).join('');
        const newKeyString = prefix + randomPart;
        
        const newKeyObj: ApiKey = {
            id: Date.now().toString(),
            key: newKeyString,
            name: newKeyName,
            createdAt: Date.now(),
            requests: 0
        };

        const updatedKeys = [...apiKeys, newKeyObj];
        setApiKeys(updatedKeys);
        setGeneratedKey(newKeyString);
        setNewKeyName('');
        
        if (user) {
            localStorage.setItem(`zee_api_keys_${user.email}`, JSON.stringify(updatedKeys));
        }
    };

    const deleteKey = (id: string) => {
        const updatedKeys = apiKeys.filter(k => k.id !== id);
        setApiKeys(updatedKeys);
        if (user) {
            localStorage.setItem(`zee_api_keys_${user.email}`, JSON.stringify(updatedKeys));
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleTestApi = async () => {
        if (!testKey || !testPrompt) return;
        
        if (!testKey.startsWith('zee_live_')) {
             setTestResponse(JSON.stringify({ error: "Invalid API Key format. Keys must start with 'zee_live_'" }, null, 2));
             return;
        }

        // Check quota
        const requestType = testEndpoint.includes('image') ? 'image' : testEndpoint.includes('audio') ? 'audio' : 'code';
        if (!checkQuota('request')) {
            setTestResponse(JSON.stringify({ 
                error: "Rate limit exceeded", 
                message: `You've reached your daily limit of ${quota?.limits.requestsPerDay} requests. Upgrade to Pro for more.`,
                code: 429
            }, null, 2));
            return;
        }
        if (!checkQuota(requestType)) {
            setTestResponse(JSON.stringify({ 
                error: "Quota exceeded", 
                message: `You've reached your daily ${requestType} generation limit. Upgrade to Pro for more.`,
                code: 429
            }, null, 2));
            return;
        }

        setIsTesting(true);
        setTestResponse(null);
        try {
            // Increment usage
            incrementUsage(requestType);

            const result = await simulateApiCall(testPrompt);
            
            // Format response based on endpoint
            let response: any = {
                success: true,
                endpoint: testEndpoint,
                timestamp: new Date().toISOString(),
                usage: {
                    requestsRemaining: quota ? quota.limits.requestsPerDay - quota.usage.requestsToday - 1 : 0,
                    plan: quota?.plan || 'free'
                }
            };

            if (testEndpoint === '/api/v1/generate') {
                response.data = { files: result.files || [], message: result.message };
            } else if (testEndpoint === '/api/v1/chat') {
                response.data = { reply: result.message || "AI response here", model: "gemini-2.5-flash" };
            } else if (testEndpoint === '/api/v1/image') {
                response.data = { imageUrl: "https://example.com/generated-image.png", prompt: testPrompt };
            } else if (testEndpoint === '/api/v1/audio/transcribe') {
                response.data = { transcript: "Transcribed audio text would appear here", duration: 0 };
            } else if (testEndpoint === '/api/v1/audio/tts') {
                response.data = { audioUrl: "https://example.com/generated-audio.mp3", text: testPrompt };
            } else {
                response.data = result;
            }

            setTestResponse(JSON.stringify(response, null, 2));
            
            // Update key usage count
            if (user) {
                usageService.trackRequest(user.email, requestType);
                setStats(usageService.getStats(user.email));
                
                const keyIndex = apiKeys.findIndex(k => k.key === testKey);
                if (keyIndex >= 0) {
                    const newKeys = [...apiKeys];
                    newKeys[keyIndex].requests = (newKeys[keyIndex].requests || 0) + 1;
                    setApiKeys(newKeys);
                    localStorage.setItem(`zee_api_keys_${user.email}`, JSON.stringify(newKeys));
                }
            }

        } catch (error: any) {
            setTestResponse(JSON.stringify({ success: false, error: error.message }, null, 2));
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
            <div className="text-center mb-12">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-900/20">
                    <Terminal className="w-8 h-8 text-blue-500" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Zee AI for Developers</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Integrate the power of Zee's Generative AI, Vision, and Audio models directly into your own applications.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* API Key Management */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Keys Panel */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                <Key className="w-5 h-5 mr-2 text-yellow-500" /> API Keys
                            </h2>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-mono">
                                Environment: Production
                            </span>
                        </div>

                        <div className="flex gap-3 mb-8">
                            <input 
                                type="text" 
                                placeholder="Key Name (e.g. iOS App)" 
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button 
                                onClick={generateKey}
                                disabled={!newKeyName}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm flex items-center disabled:opacity-50 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Create Key
                            </button>
                        </div>

                        {generatedKey && (
                            <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl">
                                <div className="flex items-start">
                                    <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-green-800 dark:text-green-400 mb-1">API Key Created</h3>
                                        <p className="text-xs text-green-700 dark:text-green-500 mb-3">
                                            Copy this key now. You won't be able to see it again!
                                        </p>
                                        <div className="flex items-center bg-white dark:bg-slate-950 border border-green-200 dark:border-green-900/30 rounded p-2">
                                            <code className="text-xs font-mono text-slate-600 dark:text-slate-300 flex-1 break-all">{generatedKey}</code>
                                            <button onClick={() => copyToClipboard(generatedKey)} className="ml-2 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {apiKeys.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-8 italic">No API keys generated yet.</p>
                            ) : (
                                apiKeys.map(key => (
                                    <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-950/50 border border-gray-100 dark:border-slate-800 rounded-lg group">
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{key.name}</p>
                                            <p className="text-xs font-mono text-slate-500 mt-1">
                                                {key.key.substring(0, 12)}... • Created {new Date(key.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-slate-400 uppercase">Requests</p>
                                                <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{key.requests}</p>
                                            </div>
                                            <button onClick={() => deleteKey(key.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* API Playground */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                         <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
                            <span className="text-xs font-bold uppercase text-blue-400 flex items-center"><Play className="w-3 h-3 mr-1" /> API Playground</span>
                            <span className="text-[10px] text-slate-500">Test your keys</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">Endpoint</label>
                                    <select 
                                        value={testEndpoint}
                                        onChange={(e) => setTestEndpoint(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono"
                                    >
                                        <option value="/api/v1/generate">POST /api/v1/generate</option>
                                        <option value="/api/v1/chat">POST /api/v1/chat</option>
                                        <option value="/api/v1/image">POST /api/v1/image</option>
                                        <option value="/api/v1/audio/transcribe">POST /api/v1/audio/transcribe</option>
                                        <option value="/api/v1/audio/tts">POST /api/v1/audio/tts</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">X-API-Key</label>
                                    <input 
                                        value={testKey}
                                        onChange={(e) => setTestKey(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono"
                                        placeholder="zee_live_..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1">Request Body</label>
                                <div className="flex space-x-2">
                                    <input 
                                        value={testPrompt}
                                        onChange={(e) => setTestPrompt(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono"
                                        placeholder={testEndpoint.includes('image') ? 'A beautiful sunset...' : 'Create a login screen...'}
                                    />
                                    <button 
                                        onClick={handleTestApi}
                                        disabled={isTesting || !testKey}
                                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-xs font-bold disabled:opacity-50"
                                    >
                                        {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'SEND'}
                                    </button>
                                </div>
                            </div>
                            {quota && (
                                <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-950 rounded border border-slate-800">
                                    <span className="text-slate-500">Requests remaining today:</span>
                                    <span className={`font-mono font-bold ${quota.usage.requestsToday >= quota.limits.requestsPerDay * 0.9 ? 'text-red-400' : 'text-green-400'}`}>
                                        {quota.limits.requestsPerDay - quota.usage.requestsToday} / {quota.limits.requestsPerDay}
                                    </span>
                                </div>
                            )}
                            <div className="bg-black rounded-lg p-4 min-h-[150px] max-h-[300px] overflow-y-auto custom-scrollbar">
                                <pre className="text-xs font-mono text-green-400">
                                    {testResponse || '// Response will appear here...'}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Usage & Docs */}
                <div className="space-y-6">
                    {/* Accounting & Usage */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-green-500" /> Usage & Accounting
                        </h3>
                        {stats ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Total Requests</span>
                                        <span>{stats.requests} / {stats.limit}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full" 
                                            style={{ width: `${Math.min((stats.requests / stats.limit) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded border border-gray-100 dark:border-slate-700">
                                        <span className="text-[10px] text-slate-400 uppercase">Code Gen</span>
                                        <p className="font-mono font-bold text-slate-700 dark:text-white">{stats.generations.code}</p>
                                    </div>
                                    <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded border border-gray-100 dark:border-slate-700">
                                        <span className="text-[10px] text-slate-400 uppercase">Images</span>
                                        <p className="font-mono font-bold text-slate-700 dark:text-white">{stats.generations.image}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-slate-500">Current Plan</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${stats.plan === 'pro' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`}>
                                        {stats.plan}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">Login to view usage.</p>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                            <Book className="w-4 h-4 mr-2 text-blue-500" /> API Reference
                        </h3>
                        <ul className="space-y-2">
                            {[
                                { path: '/api/v1/generate', method: 'POST', desc: 'Generate full project structures', icon: FileCode, color: 'text-blue-500' },
                                { path: '/api/v1/chat', method: 'POST', desc: 'Chat completions with AI', icon: Terminal, color: 'text-green-500' },
                                { path: '/api/v1/image', method: 'POST', desc: 'Generate images from text', icon: Image, color: 'text-purple-500' },
                                { path: '/api/v1/audio/transcribe', method: 'POST', desc: 'Transcribe audio to text', icon: Mic, color: 'text-orange-500' },
                                { path: '/api/v1/audio/tts', method: 'POST', desc: 'Text-to-speech synthesis', icon: Mic, color: 'text-cyan-500' },
                                { path: '/api/v1/usage', method: 'GET', desc: 'Get usage statistics', icon: Activity, color: 'text-yellow-500' },
                            ].map((endpoint, i) => (
                                <li key={i}>
                                    <button 
                                        onClick={() => setTestEndpoint(endpoint.path)}
                                        className="w-full text-left p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <endpoint.icon className={`w-3.5 h-3.5 ${endpoint.color}`} />
                                            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 flex-1">{endpoint.path}</span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{endpoint.method}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 ml-5">{endpoint.desc}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quota & Limits */}
                    {quota && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <Zap className="w-4 h-4 mr-2 text-yellow-500" /> Rate Limits
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Requests/day</span>
                                    <span className="font-mono text-slate-700 dark:text-white">{quota.limits.requestsPerDay.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Requests/min</span>
                                    <span className="font-mono text-slate-700 dark:text-white">{quota.limits.requestsPerMinute}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Code generations</span>
                                    <span className="font-mono text-slate-700 dark:text-white">{quota.limits.codeGenerations.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Image generations</span>
                                    <span className="font-mono text-slate-700 dark:text-white">{quota.limits.imageGenerations.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Audio minutes</span>
                                    <span className="font-mono text-slate-700 dark:text-white">{quota.limits.audioMinutes}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Plan</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                                            quota.plan === 'enterprise' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                                            quota.plan === 'pro' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 
                                            'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
                                        }`}>
                                            {quota.plan}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                        <Server className="w-8 h-8 mb-4 opacity-80" />
                        <h3 className="font-bold text-lg mb-2">Enterprise Access</h3>
                        <p className="text-sm text-indigo-100 mb-4">Need higher rate limits or dedicated instances?</p>
                        <button onClick={() => usageService.upgradePlan(user?.email || '')} className="w-full py-2 bg-white text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center">
                            <CreditCard className="w-4 h-4 mr-2" /> Upgrade to Pro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Developers;
