import React, { useState, useEffect } from 'react';
import { User, ApiKey, ApiQuota } from '../types';
import { Terminal, Key, Copy, Plus, Trash2, Book, Server, ShieldCheck, Code, Play, Loader2, Activity, CreditCard, AlertTriangle, Clock, Zap, Image, Mic, FileCode, RefreshCw, ChevronRight, ExternalLink, Rocket, CheckCircle2, ArrowRight, Sparkles, Globe, Shield, Settings, Database, Video, Cpu, Layers, Box, Download } from 'lucide-react';
import { huggingFaceService } from '../services/huggingFaceService';
import { usageService, UsageStats } from '../services/usageService';

interface DevelopersProps {
    user: User | null;
    onIntegrate?: (service: string, endpoint: string) => void;
}

type DeveloperTab = 'overview' | 'keys' | 'playground' | 'sdk';

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

const Developers: React.FC<DevelopersProps> = ({ user, onIntegrate }) => {
    const [activeTab, setActiveTab] = useState<DeveloperTab>('overview');
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [baseUrl] = useState('https://api.zee.ai');
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

    const [testKey, setTestKey] = useState('');
    const [testPrompt, setTestPrompt] = useState('Create a login screen with React');
    const [testEndpoint, setTestEndpoint] = useState('/api/v1/generate');
    const [isTesting, setIsTesting] = useState(false);
    const [testResponse, setTestResponse] = useState<string | null>(null);

    const [quota, setQuota] = useState<ApiQuota | null>(null);
    const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

    const loadQuota = (email: string) => {
        const savedQuota = localStorage.getItem(`zee_api_quota_${email}`);
        if (savedQuota) {
            const q = JSON.parse(savedQuota);
            const today = new Date().toDateString();
            const lastReset = new Date(q.usage.lastReset).toDateString();
            if (today !== lastReset) {
                q.usage = { requestsToday: 0, codeGenerationsToday: 0, imageGenerationsToday: 0, audioMinutesToday: 0, lastReset: Date.now() };
                localStorage.setItem(`zee_api_quota_${email}`, JSON.stringify(q));
            }
            setQuota(q);
        } else {
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
            if (storedKeys) setApiKeys(JSON.parse(storedKeys));
            loadQuota(user.email);
            const userStats = usageService.getStats(user.email);
            setStats(userStats);
        }
    }, [user]);

    const generateApiKey = () => {
        if (!user || !newKeyName.trim()) return;
        const key = `zee_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const newKey: ApiKey = {
            id: Date.now().toString(),
            name: newKeyName,
            key: key,
            createdAt: Date.now(),
            lastUsed: undefined,
            requests: 0
        };
        const updatedKeys = [...apiKeys, newKey];
        setApiKeys(updatedKeys);
        setGeneratedKey(key);
        setNewKeyName('');
        localStorage.setItem(`zee_api_keys_${user.email}`, JSON.stringify(updatedKeys));
    };

    const deleteKey = (id: string) => {
        if (!user) return;
        const updatedKeys = apiKeys.filter(k => k.id !== id);
        setApiKeys(updatedKeys);
        localStorage.setItem(`zee_api_keys_${user.email}`, JSON.stringify(updatedKeys));
    };

    const copyToClipboard = (text: string, id?: string) => {
        navigator.clipboard.writeText(text);
        if (id) {
            setCopiedSnippet(id);
            setTimeout(() => setCopiedSnippet(null), 2000);
        }
    };

    const codeSnippets: Record<string, string> = {
        javascript: `// Install: npm install @zee/sdk
import { ZeeAI } from '@zee/sdk';

const zee = new ZeeAI({ apiKey: 'YOUR_API_KEY' });

const result = await zee.generate({
  prompt: 'Create a React login form',
  framework: 'react',
  style: 'tailwind'
});

console.log(result.files);`,
        python: `# Install: pip install zee-ai
from zee import ZeeAI

zee = ZeeAI(api_key="YOUR_API_KEY")

result = zee.generate(
    prompt="Create a Flask REST API",
    framework="flask",
    style="modern"
)

for file in result.files:
    print(f"{file.name}: {len(file.content)} bytes")`,
        curl: `# Generate code via REST API
curl -X POST https://api.zee.ai/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Create a login form",
    "framework": "react"
  }'`,
        chat: `// Chat completion with streaming
const stream = await zee.chat.stream({
  messages: [
    { role: 'user', content: 'Build a dashboard' }
  ],
  model: 'zee-pro'
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}`,
        image: `// Generate images from text
const image = await zee.images.generate({
  prompt: 'A modern app dashboard UI',
  size: '1024x1024',
  style: 'vivid'
});

console.log(image.url);`,
        audio: `// Text-to-Speech
const audio = await zee.audio.speak({
  text: 'Welcome to Zee Builder',
  voice: 'alloy',
  format: 'mp3'
});

// Stream audio
const stream = await zee.audio.stream({ text: '...' });`
    };

    const testApi = async () => {
        if (!testKey || !testPrompt) {
            setQuotaWarning('Please enter an API key and prompt');
            return;
        }
        if (!checkQuota('request')) {
            setQuotaWarning(`You've reached your daily limit of ${quota?.limits.requestsPerDay} requests. Upgrade to Pro for more.`);
            return;
        }
        const requestType = testEndpoint.includes('image') ? 'image' : testEndpoint.includes('audio') ? 'audio' : 'code';
        if (!checkQuota(requestType)) {
            setQuotaWarning(`You've reached your daily ${requestType} generation limit. Upgrade to Pro for more.`);
            return;
        }
        setIsTesting(true);
        setTestResponse(null);
        setQuotaWarning(null);
        try {
            const result = await huggingFaceService.simulateApiCall(testPrompt);
            setTestResponse(JSON.stringify(result, null, 2));
            incrementUsage(requestType);
            if (user) usageService.trackRequest(user.email, 'code');
        } catch (error) {
            setTestResponse(JSON.stringify({ error: 'API call failed', details: error }, null, 2));
        } finally {
            setIsTesting(false);
        }
    };

    const createNewKey = () => {
        if (!user || !newKeyName.trim()) return;
        const key = `zee_live_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
        const newKey: ApiKey = {
            id: Date.now().toString(),
            name: newKeyName,
            key,
            createdAt: Date.now(),
            lastUsed: undefined,
            requests: 0
        };
        const newKeys = [...apiKeys, newKey];
        setApiKeys(newKeys);
        setGeneratedKey(key);
        setNewKeyName('');
        localStorage.setItem(`zee_api_keys_${user.email}`, JSON.stringify(newKeys));
    };

    const tabs = [
        { id: 'overview' as DeveloperTab, label: 'Overview', icon: Rocket },
        { id: 'keys' as DeveloperTab, label: 'API Keys', icon: Key },
        { id: 'playground' as DeveloperTab, label: 'Playground', icon: Play },
        { id: 'sdk' as DeveloperTab, label: 'SDK & Docs', icon: Book }
    ];

    const features = [
        { icon: Code, title: 'Code Generation', desc: 'Generate full-stack apps from prompts', color: 'blue', badge: 'Popular' },
        { icon: Image, title: 'Image Generation', desc: 'Create images with Imagen 3', color: 'purple', badge: 'New' },
        { icon: Video, title: 'Video Generation', desc: 'Generate videos with Veo 2', color: 'pink', badge: 'Beta' },
        { icon: Mic, title: 'Audio & Voice', desc: 'TTS, transcription, live voice', color: 'green', badge: 'New' },
        { icon: Database, title: 'Cloud Storage', desc: 'Sync projects across devices', color: 'orange', badge: null },
        { icon: Globe, title: 'Deploy Anywhere', desc: 'One-click deployment to cloud', color: 'cyan', badge: null }
    ];

    const endpoints = [
        { path: '/v1/generate', method: 'POST', desc: 'Generate code from prompt' },
        { path: '/v1/chat', method: 'POST', desc: 'Chat completions with streaming' },
        { path: '/v1/images/generate', method: 'POST', desc: 'Generate images from text' },
        { path: '/v1/audio/speech', method: 'POST', desc: 'Text-to-speech conversion' },
        { path: '/v1/audio/transcribe', method: 'POST', desc: 'Transcribe audio to text' },
        { path: '/v1/projects', method: 'GET', desc: 'List all projects' },
        { path: '/v1/projects/:id', method: 'GET', desc: 'Get project by ID' },
        { path: '/v1/deploy', method: 'POST', desc: 'Deploy project to cloud' }
    ];

    const playgroundEndpoints = [
        { id: '/api/v1/generate', label: 'Code Generation', icon: Code, method: 'POST', color: 'text-blue-500' },
        { id: '/api/v1/chat', label: 'Chat Completion', icon: Terminal, method: 'POST', color: 'text-green-500' },
        { id: '/api/v1/images', label: 'Image Generation', icon: Image, method: 'POST', color: 'text-purple-500' },
        { id: '/api/v1/audio', label: 'Audio/TTS', icon: Mic, method: 'POST', color: 'text-pink-500' }
    ];

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Terminal className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Developer Console</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Sign in to access API keys, documentation, and the developer playground.</p>
                    <div className="flex gap-3 justify-center">
                        <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                            Sign In
                        </button>
                        <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all">
                            View Docs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Terminal className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Developer Console</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">API Keys, Documentation & Playground</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 w-fit max-w-full overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {features.map((feature, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl flex items-center justify-center`}>
                                            <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                                        </div>
                                        {feature.badge && (
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${feature.badge === 'Beta' ? 'bg-purple-100 text-purple-600' : feature.badge === 'New' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {feature.badge}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-1">{feature.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-500" />
                                API Endpoints
                            </h3>
                            <div className="space-y-2">
                                {endpoints.map((endpoint, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                {endpoint.method}
                                            </span>
                                            <code className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">{baseUrl}{endpoint.path}</code>
                                        </div>
                                        <span className="text-xs text-slate-500 sm:ml-auto">{endpoint.desc}</span>
                                        {onIntegrate && (
                                            <button
                                                onClick={() => onIntegrate(endpoint.desc, endpoint.path)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-md text-xs font-medium flex items-center gap-1 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 ml-auto sm:ml-0"
                                            >
                                                Integrate <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Keys Tab */}
                {activeTab === 'keys' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-green-500" />
                                Create New API Key
                            </h3>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={e => setNewKeyName(e.target.value)}
                                    placeholder="Key name (e.g., Production, Development)"
                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button
                                    onClick={createNewKey}
                                    disabled={!newKeyName.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    Generate Key
                                </button>
                            </div>
                            {generatedKey && (
                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-800 dark:text-green-400">Key Generated Successfully!</p>
                                            <code className="text-xs font-mono text-green-700 dark:text-green-500">{generatedKey}</code>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(generatedKey)}
                                            className="p-2 bg-green-100 dark:bg-green-800 rounded-lg hover:bg-green-200 dark:hover:bg-green-700"
                                        >
                                            <Copy className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-500 mt-2">⚠️ Save this key now. You won't be able to see it again.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Key className="w-5 h-5 text-indigo-500" />
                                Your API Keys
                            </h3>
                            {apiKeys.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No API keys yet. Create one above to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {apiKeys.map(key => (
                                        <div key={key.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-white">{key.name}</p>
                                                <p className="text-xs text-slate-500">Created {new Date(key.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded">
                                                    {key.key.slice(0, 12)}...{key.key.slice(-4)}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(key.key)}
                                                    className="p-2 text-slate-500 hover:text-indigo-500 transition-colors"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteKey(key.id)}
                                                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Playground Tab */}
                {activeTab === 'playground' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Play className="w-5 h-5 text-green-500" />
                                API Playground
                            </h3>
                            {quotaWarning && (
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm text-amber-700 dark:text-amber-400">{quotaWarning}</span>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">API Key</label>
                                    <input
                                        type="password"
                                        value={testKey}
                                        onChange={e => setTestKey(e.target.value)}
                                        placeholder="Enter your API key"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Endpoint</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {playgroundEndpoints.map(endpoint => (
                                            <button
                                                key={endpoint.id}
                                                onClick={() => setTestEndpoint(endpoint.id)}
                                                className={`p-3 rounded-lg border text-left transition-all ${
                                                    testEndpoint === endpoint.id
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <endpoint.icon className={`w-4 h-4 ${endpoint.color}`} />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{endpoint.label}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prompt</label>
                                    <textarea
                                        value={testPrompt}
                                        onChange={e => setTestPrompt(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        placeholder="Enter your prompt..."
                                    />
                                </div>
                                <button
                                    onClick={testApi}
                                    disabled={isTesting || !testKey}
                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                    {isTesting ? 'Testing...' : 'Send Request'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-green-400" />
                                    Response
                                </h3>
                                {testResponse && (
                                    <button
                                        onClick={() => copyToClipboard(testResponse, 'response')}
                                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                                    >
                                        <Copy className="w-3 h-3" />
                                        {copiedSnippet === 'response' ? 'Copied!' : 'Copy'}
                                    </button>
                                )}
                            </div>
                            <pre className="text-sm font-mono text-green-400 overflow-auto max-h-96 bg-black/30 p-4 rounded-lg">
                                {testResponse || '// Response will appear here...'}
                            </pre>
                        </div>
                    </div>
                )}

                {/* SDK Tab */}
                {activeTab === 'sdk' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(codeSnippets).map(([lang, code]) => (
                                <div key={lang} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                                        <span className="text-sm font-medium text-white capitalize">{lang}</span>
                                        <button
                                            onClick={() => copyToClipboard(code, lang)}
                                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                                        >
                                            <Copy className="w-3 h-3" />
                                            {copiedSnippet === lang ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <pre className="p-4 text-xs font-mono text-green-400 overflow-auto max-h-48">
                                        {code}
                                    </pre>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Download className="w-5 h-5 text-indigo-500" />
                                SDK Installation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">JavaScript/TypeScript</p>
                                    <code className="text-xs font-mono text-indigo-600 dark:text-indigo-400">npm install @zee/sdk</code>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Python</p>
                                    <code className="text-xs font-mono text-indigo-600 dark:text-indigo-400">pip install zee-ai</code>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">REST API</p>
                                    <code className="text-xs font-mono text-indigo-600 dark:text-indigo-400">https://api.zee.ai/v1</code>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quota & Stats Sidebar */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quota && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                <h3 className="font-bold text-slate-800 dark:text-white">API Usage Today</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Requests</span>
                                    <span className={`font-mono font-bold ${quota.usage.requestsToday >= quota.limits.requestsPerDay * 0.9 ? 'text-red-500' : 'text-green-500'}`}>
                                        {quota.usage.requestsToday} / {quota.limits.requestsPerDay}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Code Generations</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300">
                                        {quota.usage.codeGenerationsToday} / {quota.limits.codeGenerations}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Image Generations</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300">
                                        {quota.usage.imageGenerationsToday} / {quota.limits.imageGenerations}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Plan</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                                            quota.plan === 'enterprise' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                                            quota.plan === 'pro' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 
                                            'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                        }`}>
                                            {quota.plan}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {stats && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-slate-800 dark:text-white">All-Time Stats</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Total Requests</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{stats.requests.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Storage Used</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300">{(stats.storageBytes / 1024).toFixed(1)} KB</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                        style={{ width: `${Math.min((stats.requests / stats.limit) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-5 text-white shadow-lg">
                        <Server className="w-8 h-8 mb-3 opacity-80" />
                        <h3 className="font-bold text-lg mb-2">Enterprise Access</h3>
                        <p className="text-sm text-indigo-100 mb-4">Need higher rate limits or dedicated instances?</p>
                        <button 
                            onClick={() => usageService.upgradePlan(user?.email || '')} 
                            className="w-full py-2 bg-white text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" /> Upgrade to Pro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Developers;
