
import React, { useState, useEffect } from 'react';
import { User, ApiKey, ApiQuota } from '../types';
import { Terminal, Key, Copy, Plus, Trash2, Book, Server, ShieldCheck, Code, Play, Loader2, Activity, CreditCard, AlertTriangle, Clock, Zap, Image, Mic, FileCode, RefreshCw, ChevronRight, ExternalLink, Rocket, CheckCircle2, ArrowRight, Sparkles, Globe, Shield, Settings, Database, Video, Cpu, Layers, Box, Download } from 'lucide-react';
import { simulateApiCall } from '../services/geminiService';
import { usageService, UsageStats } from '../services/usageService';

interface DevelopersProps {
    user: User | null;
}

type DeveloperTab = 'overview' | 'keys' | 'playground' | 'sdk';

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
    const [activeTab, setActiveTab] = useState<DeveloperTab>('overview');
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState('https://api.zee.ai');
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

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

    const copyToClipboard = (text: string, id?: string) => {
        navigator.clipboard.writeText(text);
        if (id) {
            setCopiedSnippet(id);
            setTimeout(() => setCopiedSnippet(null), 2000);
        }
    };

    // SDK Code Examples
    const codeExamples = {
        javascript: `// Install: npm install @zee/sdk
import { ZeeAI } from '@zee/sdk';

const zee = new ZeeAI({ apiKey: 'zee_live_...' });

// Generate a complete React app
const result = await zee.generate({
  prompt: 'Create a todo app with React and TypeScript',
  framework: 'react',
  features: ['typescript', 'tailwind', 'dark-mode']
});

console.log(result.files); // Array of generated files`,

        python: `# Install: pip install zee-ai
from zee import ZeeAI

client = ZeeAI(api_key="zee_live_...")

# Generate code from natural language
result = client.generate(
    prompt="Create a FastAPI backend with user auth",
    framework="fastapi",
    features=["jwt", "postgresql", "docker"]
)

for file in result.files:
    print(f"{file.name}: {len(file.content)} bytes")`,

        curl: `# Generate code via REST API
curl -X POST ${window.location.origin}/api/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: zee_live_..." \\
  -d '{
    "prompt": "Create a landing page",
    "framework": "nextjs",
    "features": ["typescript", "tailwind"]
  }'`,

        chat: `// Chat completion with streaming
const stream = await zee.chat.stream({
  messages: [
    { role: 'system', content: 'You are a helpful coding assistant' },
    { role: 'user', content: 'How do I implement OAuth in Next.js?' }
  ],
  model: 'gemini-2.5-flash'
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}`,

        image: `// Generate images from text
const image = await zee.images.generate({
  prompt: 'A futuristic city skyline at sunset, cyberpunk style',
  model: 'imagen-3.0',
  size: '1024x1024',
  style: 'photorealistic'
});

// Returns base64 or URL
console.log(image.url);`,

        audio: `// Text-to-Speech
const audio = await zee.audio.synthesize({
  text: 'Welcome to Zee AI, the future of code generation.',
  voice: 'alloy',
  model: 'tts-1-hd'
});

// Save to file
await audio.save('welcome.mp3');

// Or stream directly
const stream = await zee.audio.stream({ text: '...' });`
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
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 rounded-3xl p-8 md:p-12 mb-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Code className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Developer Platform</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Zee AI for Developers</h1>
                        </div>
                    </div>
                    <p className="text-lg text-slate-300 max-w-2xl mb-8">
                        Integrate powerful generative AI capabilities into your applications. Build smarter with code generation, 
                        vision analysis, audio synthesis, and more.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="#keys" onClick={() => setActiveTab('keys')} className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/30">
                            <Key className="w-4 h-4 mr-2" /> Get API Key
                        </a>
                        <a href="#sdk" onClick={() => setActiveTab('sdk')} className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20">
                            <Download className="w-4 h-4 mr-2" /> View SDK
                        </a>
                    </div>
                </div>
                {/* Floating badges */}
                <div className="absolute right-8 top-8 hidden lg:flex flex-col gap-2">
                    <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">v2.0 API</span>
                    <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30">TypeScript Ready</span>
                </div>
            </div>

            {/* Quick Stats Row */}
            {user && stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.requests}</p>
                                <p className="text-xs text-slate-500">Total Requests</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <FileCode className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.generations.code}</p>
                                <p className="text-xs text-slate-500">Code Generations</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.generations.image}</p>
                                <p className="text-xs text-slate-500">Images Created</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{apiKeys.length}</p>
                                <p className="text-xs text-slate-500">Active Keys</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 mb-8 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-xl w-fit">
                {[
                    { id: 'overview' as DeveloperTab, label: 'Overview', icon: Layers },
                    { id: 'keys' as DeveloperTab, label: 'API Keys', icon: Key },
                    { id: 'playground' as DeveloperTab, label: 'Playground', icon: Play },
                    { id: 'sdk' as DeveloperTab, label: 'SDK & Docs', icon: Book },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === tab.id
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Features Grid */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Platform Capabilities</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: FileCode, title: 'Code Generation', desc: 'Generate complete applications from natural language prompts. React, Vue, Python, Node.js and more.', color: 'blue', badge: 'Popular' },
                                { icon: Terminal, title: 'Chat Completions', desc: 'Conversational AI with context awareness. Perfect for coding assistants and support bots.', color: 'green' },
                                { icon: Image, title: 'Image Generation', desc: 'Create stunning visuals with Imagen 3.0. Photorealistic images, art, and designs.', color: 'purple' },
                                { icon: Video, title: 'Video Generation', desc: 'Generate short video clips from text prompts using cutting-edge Veo models.', color: 'pink', badge: 'Beta' },
                                { icon: Mic, title: 'Audio & Speech', desc: 'Text-to-speech, speech-to-text, and real-time audio conversations.', color: 'orange' },
                                { icon: Cpu, title: 'Vision Analysis', desc: 'Analyze images, extract text, describe content, and understand visual context.', color: 'cyan' },
                            ].map((feature, i) => (
                                <div key={i} className="group bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl flex items-center justify-center`}>
                                            <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                                        </div>
                                        {feature.badge && (
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${feature.badge === 'Beta' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {feature.badge}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Start */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-2">Quick Start Guide</h3>
                                <p className="text-blue-100 mb-4">Get up and running in under 5 minutes with our SDK.</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Install SDK</span>
                                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Add API Key</span>
                                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Make first call</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setActiveTab('keys')} className="px-5 py-2.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                                    Get API Key
                                </button>
                                <button onClick={() => setActiveTab('sdk')} className="px-5 py-2.5 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors border border-white/30">
                                    Read Docs
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* API Endpoints Overview */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">API Endpoints</h2>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 divide-y divide-gray-200 dark:divide-slate-800">
                            {[
                                { method: 'POST', path: '/api/v1/generate', desc: 'Generate complete project structures from prompts', latency: '~3s' },
                                { method: 'POST', path: '/api/v1/chat', desc: 'Send messages to AI and receive completions', latency: '~500ms' },
                                { method: 'POST', path: '/api/v1/image', desc: 'Generate images from text descriptions', latency: '~5s' },
                                { method: 'POST', path: '/api/v1/video', desc: 'Generate short video clips (beta)', latency: '~30s' },
                                { method: 'POST', path: '/api/v1/audio/transcribe', desc: 'Transcribe audio files to text', latency: '~2s' },
                                { method: 'POST', path: '/api/v1/audio/tts', desc: 'Convert text to natural speech', latency: '~1s' },
                                { method: 'GET', path: '/api/v1/usage', desc: 'Get current usage statistics and quotas', latency: '~100ms' },
                            ].map((endpoint, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                            {endpoint.method}
                                        </span>
                                        <div>
                                            <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{endpoint.path}</code>
                                            <p className="text-xs text-slate-500 mt-0.5">{endpoint.desc}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400">{endpoint.latency}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'keys' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Create New Key */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                    <Key className="w-5 h-5 mr-2 text-yellow-500" /> API Keys
                                </h2>
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-mono flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Production
                                </span>
                            </div>

                            <div className="flex gap-3 mb-6">
                                <input 
                                    type="text" 
                                    placeholder="Key Name (e.g. iOS App, Web Dashboard)" 
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button 
                                    onClick={generateKey}
                                    disabled={!newKeyName}
                                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm flex items-center disabled:opacity-50 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Create Key
                                </button>
                            </div>

                            {generatedKey && (
                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl">
                                    <div className="flex items-start">
                                        <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-green-800 dark:text-green-400 mb-1">🎉 API Key Created Successfully</h3>
                                            <p className="text-xs text-green-700 dark:text-green-500 mb-3">
                                                Copy this key now and store it securely. You won't be able to see it again!
                                            </p>
                                            <div className="flex items-center bg-white dark:bg-slate-950 border border-green-200 dark:border-green-900/30 rounded-lg p-3">
                                                <code className="text-xs font-mono text-slate-600 dark:text-slate-300 flex-1 break-all">{generatedKey}</code>
                                                <button onClick={() => copyToClipboard(generatedKey, 'generated')} className="ml-3 p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                                                    {copiedSnippet === 'generated' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Existing Keys List */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Your API Keys ({apiKeys.length})</h3>
                                {apiKeys.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                                        <Key className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500 mb-2">No API keys generated yet</p>
                                        <p className="text-xs text-slate-400">Create your first key to start using the API</p>
                                    </div>
                                ) : (
                                    apiKeys.map(key => (
                                        <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-950/50 border border-gray-100 dark:border-slate-800 rounded-lg group hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                                                    <Key className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{key.name}</p>
                                                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                                                        {key.key.substring(0, 16)}•••••••• 
                                                        <span className="text-slate-400 ml-2">Created {new Date(key.createdAt).toLocaleDateString()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{key.requests}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase">requests</p>
                                                </div>
                                                <button onClick={() => deleteKey(key.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
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
