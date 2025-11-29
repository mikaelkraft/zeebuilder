
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
    Cpu
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
        "Svelte Components",
        "AI-Powered Images",
        "Audio & Transcripts",
        "HTML5 Websites",
        "Cross-Platform Apps"
    ];

    const stacks = [
        { name: 'React', icon: Code, color: 'text-blue-500', description: 'Modern UI' },
        { name: 'React TS', icon: FileCode, color: 'text-blue-400', description: 'Type-safe' },
        { name: 'Vue.js', icon: Layers, color: 'text-green-500', description: 'Progressive' },
        { name: 'Svelte', icon: Zap, color: 'text-orange-500', description: 'Compiled' },
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

            {/* NEW: Builder Features Highlight */}
            <div className="mb-12 px-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">🚀 New in Builder</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Integrated Terminal</h3>
                                    <p className="text-sm text-white/80">Run commands, install packages, view files</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Code className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Code View with Line Numbers</h3>
                                    <p className="text-sm text-white/80">Edit any file with syntax highlighting</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Dependency Manager</h3>
                                    <p className="text-sm text-white/80">Add, remove npm packages with one click</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <GitBranch className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">GitHub Integration</h3>
                                    <p className="text-sm text-white/80">Push & pull from your repositories</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Play className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Live Preview</h3>
                                    <p className="text-sm text-white/80">See React, Vue, Svelte apps in real-time</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Flutter & Python</h3>
                                    <p className="text-sm text-white/80">Mobile apps and scripts with AI assist</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => onNavigate(View.BUILDER)}
                            className="mt-6 px-6 py-2 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors"
                        >
                            Try Builder Now →
                        </button>
                    </div>
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
