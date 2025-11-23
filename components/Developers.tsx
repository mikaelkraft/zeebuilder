
import React, { useState, useEffect } from 'react';
import { User, ApiKey } from '../types';
import { Terminal, Key, Copy, Plus, Trash2, Book, Server, ShieldCheck, Code, Play, Loader2, Activity, CreditCard } from 'lucide-react';
import { simulateApiCall } from '../services/geminiService';
import { usageService, UsageStats } from '../services/usageService';

interface DevelopersProps {
    user: User | null;
}

const Developers: React.FC<DevelopersProps> = ({ user }) => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState('https://api.zee.com');
    const [stats, setStats] = useState<UsageStats | null>(null);

    // Playground State
    const [testKey, setTestKey] = useState('');
    const [testPrompt, setTestPrompt] = useState('Create a login screen with React');
    const [isTesting, setIsTesting] = useState(false);
    const [testResponse, setTestResponse] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            const storedKeys = localStorage.getItem(`zee_api_keys_${user.email}`);
            if (storedKeys) {
                setApiKeys(JSON.parse(storedKeys));
            }
            // Load Usage Stats
            setStats(usageService.getStats(user.email));
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
             setTestResponse(JSON.stringify({ error: "Invalid API Key format" }, null, 2));
             return;
        }

        setIsTesting(true);
        setTestResponse(null);
        try {
            const result = await simulateApiCall(testPrompt);
            setTestResponse(JSON.stringify(result, null, 2));
            
            // Simulate usage tracking update
            if (user) {
                usageService.trackRequest(user.email, 'code');
                setStats(usageService.getStats(user.email)); // Refresh stats
                
                const keyIndex = apiKeys.findIndex(k => k.key === testKey);
                if (keyIndex >= 0) {
                    const newKeys = [...apiKeys];
                    newKeys[keyIndex].requests = (newKeys[keyIndex].requests || 0) + 1;
                    setApiKeys(newKeys);
                    localStorage.setItem(`zee_api_keys_${user.email}`, JSON.stringify(newKeys));
                }
            }

        } catch (error: any) {
            setTestResponse(JSON.stringify({ error: error.message }, null, 2));
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
                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1">X-API-Key</label>
                                <input 
                                    value={testKey}
                                    onChange={(e) => setTestKey(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono"
                                    placeholder="Paste your zee_live_... key here"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1">Body (JSON)</label>
                                <div className="flex space-x-2">
                                    <input 
                                        value={testPrompt}
                                        onChange={(e) => setTestPrompt(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono"
                                        placeholder='{"prompt": "..."}'
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
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{baseUrl}/api/v1/generate</span>
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">POST</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Generate full project structures.</p>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{baseUrl}/api/v1/image</span>
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">POST</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Create images with Zee Pro.</p>
                                </a>
                            </li>
                        </ul>
                    </div>

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
