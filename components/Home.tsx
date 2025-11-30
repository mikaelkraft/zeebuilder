
import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { 
    Code, 
    MessageSquare, 
    Image, 
    Mic, 
    Zap, 
    Kanban,
    Layers,
    Database,
    LayoutDashboard,
    Send,
    Sparkles,
    History,
    Terminal,
    Smartphone,
    Globe,
    Package,
    GitBranch,
    Play,
    ChevronLeft,
    ChevronRight,
    FileCode,
    Cpu,
    Cloud,
    Server,
    Lock,
    CreditCard,
    Mail,
    Search,
    BarChart3,
    Shield,
    Workflow
} from 'lucide-react';

interface HomeProps {
    onNavigate: (view: View) => void;
}

const FeatureCard = ({ title, description, icon: Icon, onClick, color }: any) => (
    <button 
        onClick={onClick}
        className="flex flex-col text-left p-6 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl hover:border-blue-400 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 group shadow-lg backdrop-blur-sm h-full"
    >
        <div className={`p-3 rounded-lg w-fit mb-4 ${color} shadow-lg shadow-black/20 text-white`}>
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </button>
);

const StackCard = ({ name, icon: Icon, color, description }: any) => (
    <div className="flex-shrink-0 w-40 p-4 bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-xl text-center hover:border-blue-500 transition-all cursor-pointer group">
        <Icon className={`w-10 h-10 mx-auto mb-2 ${color} group-hover:scale-110 transition-transform`} />
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{name}</h4>
        <p className="text-[10px] text-slate-500 mt-1">{description}</p>
    </div>
);

const EngagementChat = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        localStorage.setItem('zee_pending_prompt', input);
        onNavigate(View.CHAT);
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-12 mb-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md transition-all hover:shadow-blue-500/10 hover:border-blue-500/30">
                <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-b border-gray-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">What do you want to create?</h3>
                        <p className="text-xs text-slate-500">Ask Zee to build an app, generate an image, or write code...</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-3">
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., Build a React dashboard with charts..." 
                            className="w-full bg-transparent border-none px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-500 placeholder:text-xs"
                            autoFocus={false}
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim()}
                            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:scale-95 shadow-md"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [stackScrollPos, setStackScrollPos] = useState(0);
    
    const heroWords = [
        "React & Vue Apps",
        "Flutter Mobile Apps",
        "Python Scripts",
        "AI-Powered Images",
        "Audio & Transcripts",
        "HTML5 Websites",
        "Cross-Platform Apps"
    ];

    const stacks = [
        { name: 'React', icon: Code, color: 'text-blue-500', description: 'Modern UI' },
        { name: 'React TS', icon: FileCode, color: 'text-blue-400', description: 'Type-safe' },
        { name: 'Vue.js', icon: Layers, color: 'text-green-500', description: 'Progressive' },
        { name: 'Flutter', icon: Smartphone, color: 'text-cyan-500', description: 'Cross-platform' },
        { name: 'Python', icon: Terminal, color: 'text-yellow-500', description: 'AI & Scripts' },
        { name: 'HTML/JS', icon: Globe, color: 'text-orange-400', description: 'Vanilla Web' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prev) => (prev + 1) % heroWords.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [heroWords.length]);

    const scrollStacks = (direction: 'left' | 'right') => {
        const container = document.getElementById('stack-carousel');
        if (container) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
            {/* Hero Section */}
            <div className="pt-16 lg:pt-24 pb-8 text-center relative overflow-hidden">
                 {/* Background Ambient Glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
                 
                 <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:via-white dark:to-white/30">Imagine,</span>{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-400 dark:via-blue-400 dark:to-blue-400/30">build,</span>{' '}
                    <span className="text-slate-500">and</span> <br className="hidden md:block" />
                    <span className="text-slate-900 dark:text-white">create...</span>
                    
                    {/* Slot Machine Carousel */}
                    <div className="h-16 md:h-20 relative overflow-hidden mt-4 w-full max-w-4xl mx-auto">
                        {heroWords.map((word, index) => (
                            <div 
                                key={index}
                                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out transform ${
                                    index === currentWordIndex 
                                        ? 'translate-y-0 opacity-100 scale-100' 
                                        : index === (currentWordIndex - 1 + heroWords.length) % heroWords.length
                                            ? 'translate-y-8 opacity-0 scale-95'
                                            : '-translate-y-8 opacity-0 scale-95'
                                }`}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 text-2xl md:text-4xl font-bold">
                                    {word}
                                </span>
                            </div>
                        ))}
                    </div>

                    <span className="flex items-center justify-center text-lg md:text-xl mt-6 text-slate-500 dark:text-slate-400 font-light tracking-wide">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        with AI prompts
                    </span>
                 </h1>
                 
                 <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
                    The ultimate platform for creators and developers. Build full-stack apps, generate images, and create audio - all in one unified AI-powered studio.
                 </p>

                 <div className="flex justify-center gap-4 mb-8">
                     <button 
                        onClick={() => onNavigate(View.BUILDER)}
                        className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
                     >
                        <Play className="w-4 h-4" />
                        Start Building
                     </button>
                     <button 
                        onClick={() => onNavigate(View.CHAT)}
                        className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
                     >
                        Ask Zee
                     </button>
                 </div>
            </div>

            {/* Stack Carousel */}
            <div className="mb-12 px-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        Supported Stacks
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => scrollStacks('left')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button onClick={() => scrollStacks('right')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>
                <div 
                    id="stack-carousel"
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {stacks.map((stack, i) => (
                        <StackCard key={i} {...stack} />
                    ))}
                </div>
            </div>

            {/* Engagement Chat (Inline) */}
            <EngagementChat onNavigate={onNavigate} />

            {/* NEW: Builder Features Timeline */}
            <div className="mb-12 px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">🚀 New in Builder</h2>
                    <p className="text-slate-500 dark:text-slate-400">Everything you need to build amazing apps</p>
                </div>
                
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 hidden md:block"></div>
                    
                    {/* Timeline Items */}
                    <div className="space-y-8 md:space-y-0">
                        {[
                            { icon: Terminal, title: 'Integrated Terminal', desc: 'Run commands, install packages, view files', color: 'bg-blue-500', side: 'left' },
                            { icon: Code, title: 'Code View with Line Numbers', desc: 'Edit any file with syntax highlighting', color: 'bg-indigo-500', side: 'right' },
                            { icon: Package, title: 'Dependency Manager', desc: 'Add, remove npm packages with one click', color: 'bg-purple-500', side: 'left' },
                            { icon: GitBranch, title: 'GitHub Integration', desc: 'Push & pull from your repositories', color: 'bg-violet-500', side: 'right' },
                            { icon: Play, title: 'Live Preview', desc: 'See React, Vue apps in real-time', color: 'bg-fuchsia-500', side: 'left' },
                            { icon: Smartphone, title: 'Flutter & Python', desc: 'Mobile apps and scripts with AI assist', color: 'bg-pink-500', side: 'right' },
                        ].map((item, index) => (
                            <div key={index} className={`relative flex items-center md:justify-${item.side === 'left' ? 'start' : 'end'} ${index > 0 ? 'md:mt-8' : ''}`}>
                                {/* Timeline Dot */}
                                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-950 border-4 border-blue-500 hidden md:block z-10"></div>
                                
                                {/* Card */}
                                <div className={`w-full md:w-[calc(50%-2rem)] ${item.side === 'right' ? 'md:ml-auto' : ''} p-4 bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all group shadow-lg`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 ${item.color} rounded-lg text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{item.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="text-center mt-8">
                    <button 
                        onClick={() => onNavigate(View.BUILDER)}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Try Builder Now →
                    </button>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 px-4">
                <FeatureCard 
                    title="User Dashboard" 
                    description="Track your progress, manage projects, and view statistics."
                    icon={LayoutDashboard}
                    color="bg-indigo-600"
                    onClick={() => onNavigate(View.DASHBOARD)}
                />
                <FeatureCard 
                    title="App Builder IDE" 
                    description="Full-featured IDE with terminal, package manager, and GitHub sync. Supports 7 stacks."
                    icon={Code}
                    color="bg-blue-600"
                    onClick={() => onNavigate(View.BUILDER)}
                />
                <FeatureCard 
                    title="Smart Checkpoints" 
                    description="Version control for your AI generations. Rollback changes instantly."
                    icon={History}
                    color="bg-orange-500"
                    onClick={() => onNavigate(View.BUILDER)}
                />
                <FeatureCard 
                    title="Real Task Management" 
                    description="Integrated Kanban board to track progress, features, and bugs."
                    icon={Kanban}
                    color="bg-emerald-600"
                    onClick={() => onNavigate(View.TASKS)}
                />
                <FeatureCard 
                    title="Zee AI Chatbot" 
                    description="Advanced reasoning with Thinking Mode, Maps Grounding, and Video Understanding."
                    icon={MessageSquare}
                    color="bg-purple-600"
                    onClick={() => onNavigate(View.CHAT)}
                />
                <FeatureCard 
                    title="Pro Image Studio" 
                    description="Generate 4K assets, edit with text prompts, and use Zee Image models."
                    icon={Image}
                    color="bg-pink-600"
                    onClick={() => onNavigate(View.IMAGE_STUDIO)}
                />
                <FeatureCard 
                    title="Audio Studio" 
                    description="Neural Text-to-Speech and accurate Audio Transcription."
                    icon={Mic}
                    color="bg-teal-600"
                    onClick={() => onNavigate(View.AUDIO_STUDIO)}
                />
                <FeatureCard 
                    title="Zee Lite Speed" 
                    description="Lightning fast responses for basic queries using Zee Flash Lite."
                    icon={Zap}
                    color="bg-yellow-500"
                    onClick={() => onNavigate(View.CHAT)}
                />
            </div>

            {/* Integrations Section */}
            <div className="mt-16 px-4">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-center gap-2">
                        <Workflow className="w-7 h-7 text-blue-500" />
                        Integrations
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Connect your favorite services and let AI seamlessly integrate them into your apps. Just ask Zee to add authentication, database, payments, or any service.
                    </p>
                </div>

                {/* Integration Categories */}
                <div className="space-y-8">
                    {/* Backend & Database */}
                    <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-green-500" />
                            Backend & Database
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[
                                { name: 'Supabase', color: 'bg-emerald-500', desc: 'Auth, DB, Storage' },
                                { name: 'Firebase', color: 'bg-orange-500', desc: 'Realtime DB, Auth' },
                                { name: 'Appwrite', color: 'bg-pink-500', desc: 'Open-source BaaS' },
                                { name: 'Neon', color: 'bg-cyan-500', desc: 'Serverless Postgres' },
                                { name: 'PlanetScale', color: 'bg-slate-600', desc: 'MySQL Platform' },
                                { name: 'MongoDB', color: 'bg-green-600', desc: 'NoSQL Database' },
                                { name: 'Prisma', color: 'bg-indigo-500', desc: 'ORM & Migrations' },
                                { name: 'Convex', color: 'bg-red-500', desc: 'Reactive Backend' },
                                { name: 'Xata', color: 'bg-purple-500', desc: 'Serverless DB' },
                                { name: 'Turso', color: 'bg-teal-500', desc: 'Edge SQLite' },
                                { name: 'Upstash', color: 'bg-emerald-600', desc: 'Redis & Kafka' },
                                { name: 'Fauna', color: 'bg-blue-600', desc: 'Distributed DB' },
                            ].map((item, i) => (
                                <div key={i} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
                                    <div className={`w-8 h-8 ${item.color} rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hosting & Deployment */}
                    <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Cloud className="w-5 h-5 text-blue-500" />
                            Hosting & Deployment
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[
                                { name: 'Vercel', color: 'bg-slate-900 dark:bg-white dark:text-black', desc: 'Frontend Cloud' },
                                { name: 'Netlify', color: 'bg-teal-500', desc: 'JAMstack Hosting' },
                                { name: 'Railway', color: 'bg-purple-600', desc: 'Deploy Anything' },
                                { name: 'Render', color: 'bg-emerald-500', desc: 'Cloud Platform' },
                                { name: 'Fly.io', color: 'bg-violet-500', desc: 'Edge Deployment' },
                                { name: 'Cloudflare', color: 'bg-orange-500', desc: 'Workers & Pages' },
                                { name: 'AWS', color: 'bg-yellow-600', desc: 'Full Cloud Suite' },
                                { name: 'Google Cloud', color: 'bg-blue-500', desc: 'GCP Services' },
                                { name: 'Azure', color: 'bg-sky-500', desc: 'Microsoft Cloud' },
                                { name: 'DigitalOcean', color: 'bg-blue-600', desc: 'App Platform' },
                                { name: 'Heroku', color: 'bg-purple-500', desc: 'PaaS Hosting' },
                                { name: 'Deno Deploy', color: 'bg-slate-700', desc: 'Edge Functions' },
                            ].map((item, i) => (
                                <div key={i} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
                                    <div className={`w-8 h-8 ${item.color} rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Authentication */}
                    <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-purple-500" />
                            Authentication
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[
                                { name: 'Clerk', color: 'bg-violet-600', desc: 'User Management' },
                                { name: 'Auth0', color: 'bg-orange-600', desc: 'Identity Platform' },
                                { name: 'NextAuth', color: 'bg-slate-800', desc: 'Next.js Auth' },
                                { name: 'Lucia', color: 'bg-indigo-500', desc: 'Auth Library' },
                                { name: 'Kinde', color: 'bg-slate-700', desc: 'Auth for SaaS' },
                                { name: 'WorkOS', color: 'bg-blue-600', desc: 'Enterprise SSO' },
                                { name: 'Stytch', color: 'bg-emerald-500', desc: 'Passwordless' },
                                { name: 'Magic', color: 'bg-purple-500', desc: 'Web3 Auth' },
                            ].map((item, i) => (
                                <div key={i} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
                                    <div className={`w-8 h-8 ${item.color} rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payments & Commerce */}
                    <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-500" />
                            Payments & Commerce
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[
                                { name: 'Stripe', color: 'bg-indigo-600', desc: 'Payments API' },
                                { name: 'Flutterwave', color: 'bg-orange-500', desc: 'African Payments' },
                                { name: 'Paystack', color: 'bg-cyan-500', desc: 'African Gateway' },
                                { name: 'Opay', color: 'bg-green-500', desc: 'Mobile Payments' },
                                { name: 'LemonSqueezy', color: 'bg-yellow-500', desc: 'Digital Sales' },
                                { name: 'Paddle', color: 'bg-blue-500', desc: 'SaaS Billing' },
                                { name: 'PayPal', color: 'bg-blue-700', desc: 'Global Payments' },
                                { name: 'Shopify', color: 'bg-green-600', desc: 'E-commerce' },
                                { name: 'Gumroad', color: 'bg-pink-500', desc: 'Creator Economy' },
                            ].map((item, i) => (
                                <div key={i} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
                                    <div className={`w-8 h-8 ${item.color} rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Email & Communication */}
                    <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-red-500" />
                            Email & Communication
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[
                                { name: 'Resend', color: 'bg-slate-800', desc: 'Email for Devs' },
                                { name: 'SendGrid', color: 'bg-blue-500', desc: 'Email Delivery' },
                                { name: 'Postmark', color: 'bg-yellow-500', desc: 'Transactional' },
                                { name: 'Mailgun', color: 'bg-red-600', desc: 'Email API' },
                                { name: 'Twilio', color: 'bg-red-500', desc: 'SMS & Voice' },
                                { name: 'Knock', color: 'bg-purple-600', desc: 'Notifications' },
                                { name: 'Novu', color: 'bg-pink-500', desc: 'Notification Infra' },
                                { name: 'Pusher', color: 'bg-indigo-500', desc: 'Realtime Comms' },
                            ].map((item, i) => (
                                <div key={i} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
                                    <div className={`w-8 h-8 ${item.color} rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI & ML */}
                    <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-pink-500" />
                            AI & Machine Learning
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[
                                { name: 'OpenAI', color: 'bg-emerald-600', desc: 'GPT & DALL·E' },
                                { name: 'Anthropic', color: 'bg-orange-600', desc: 'Claude AI' },
                                { name: 'Replicate', color: 'bg-slate-700', desc: 'ML Models' },
                                { name: 'Hugging Face', color: 'bg-yellow-500', desc: 'Model Hub' },
                                { name: 'Pinecone', color: 'bg-teal-500', desc: 'Vector DB' },
                                { name: 'LangChain', color: 'bg-green-600', desc: 'LLM Framework' },
                                { name: 'Vercel AI', color: 'bg-slate-900', desc: 'AI SDK' },
                                { name: 'Cohere', color: 'bg-purple-500', desc: 'NLP API' },
                            ].map((item, i) => (
                                <div key={i} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
                                    <div className={`w-8 h-8 ${item.color} rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Analytics & Monitoring */}
                    <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            Analytics & Monitoring
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[
                                { name: 'Vercel Analytics', color: 'bg-slate-800', desc: 'Web Vitals' },
                                { name: 'PostHog', color: 'bg-blue-600', desc: 'Product Analytics' },
                                { name: 'Mixpanel', color: 'bg-purple-500', desc: 'User Analytics' },
                                { name: 'Plausible', color: 'bg-indigo-500', desc: 'Privacy Analytics' },
                                { name: 'Sentry', color: 'bg-pink-600', desc: 'Error Tracking' },
                                { name: 'LogRocket', color: 'bg-violet-500', desc: 'Session Replay' },
                                { name: 'Datadog', color: 'bg-purple-600', desc: 'Observability' },
                                { name: 'Axiom', color: 'bg-slate-700', desc: 'Log Management' },
                            ].map((item, i) => (
                                <div key={i} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
                                    <div className={`w-8 h-8 ${item.color} rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Storage & Media */}
                    <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Server className="w-5 h-5 text-orange-500" />
                            Storage & Media
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[
                                { name: 'Cloudinary', color: 'bg-blue-500', desc: 'Media Management' },
                                { name: 'Uploadthing', color: 'bg-red-500', desc: 'File Uploads' },
                                { name: 'AWS S3', color: 'bg-orange-600', desc: 'Object Storage' },
                                { name: 'Cloudflare R2', color: 'bg-orange-500', desc: 'Zero Egress' },
                                { name: 'Bunny CDN', color: 'bg-orange-400', desc: 'Fast CDN' },
                                { name: 'imgix', color: 'bg-slate-700', desc: 'Image CDN' },
                            ].map((item, i) => (
                                <div key={i} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
                                    <div className={`w-8 h-8 ${item.color} rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search & CMS */}
                    <div className="bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-indigo-500" />
                            Search & CMS
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[
                                { name: 'Algolia', color: 'bg-blue-600', desc: 'Search API' },
                                { name: 'Typesense', color: 'bg-purple-500', desc: 'Open Search' },
                                { name: 'Meilisearch', color: 'bg-pink-500', desc: 'Fast Search' },
                                { name: 'Sanity', color: 'bg-red-500', desc: 'Headless CMS' },
                                { name: 'Contentful', color: 'bg-blue-500', desc: 'Content Platform' },
                                { name: 'Strapi', color: 'bg-indigo-600', desc: 'Open Source CMS' },
                            ].map((item, i) => (
                                <div key={i} className="group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
                                    <div className={`w-8 h-8 ${item.color} rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-10 p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl border border-blue-500/20">
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                        <span className="font-bold text-slate-900 dark:text-white">Just ask Zee</span> to integrate any of these services into your project.
                        <br className="hidden sm:block" />
                        <span className="text-sm">e.g., "Add Stripe payments" or "Setup Supabase authentication"</span>
                    </p>
                    <button 
                        onClick={() => onNavigate(View.BUILDER)}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Start Building with Integrations →
                    </button>
                </div>
            </div>

            {/* Footer / Tech Section */}
            <div className="mt-16 pt-12 border-t border-gray-200 dark:border-slate-800 px-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                             <Layers className="w-5 h-5 mr-2 text-blue-500" />
                             Frontend Architecture
                         </h3>
                         <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                             Built with React 19, Tailwind CSS, and Lucide Icons. 
                             Features a responsive component-based architecture, real-time preview with Babel transpilation, and simulated IDE environment.
                         </p>
                         <div className="flex flex-wrap gap-2">
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-slate-800">React 19</span>
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-cyan-600 dark:text-cyan-400 border border-gray-200 dark:border-slate-800">Tailwind</span>
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-violet-600 dark:text-violet-400 border border-gray-200 dark:border-slate-800">Vite</span>
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-yellow-600 dark:text-yellow-400 border border-gray-200 dark:border-slate-800">Babel</span>
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-green-600 dark:text-green-400 border border-gray-200 dark:border-slate-800">xterm.js</span>
                         </div>
                     </div>
                     <div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                             <Database className="w-5 h-5 mr-2 text-green-500" />
                             Backend & AI
                         </h3>
                         <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                             Powered by Zee AI Intelligence. Utilizing Zee Pro for reasoning, Zee Image models for assets, and Supabase for authentication.
                         </p>
                         <div className="flex flex-wrap gap-2">
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-orange-600 dark:text-orange-400 border border-gray-200 dark:border-slate-800">Zee Pro</span>
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-green-600 dark:text-green-400 border border-gray-200 dark:border-slate-800">Gemini 2.5</span>
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-slate-800">Supabase</span>
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-purple-600 dark:text-purple-400 border border-gray-200 dark:border-slate-800">GitHub OAuth</span>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default Home;
