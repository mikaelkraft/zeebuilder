
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
    History
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
                            placeholder="e.g., Build a Python script to scrape data..." 
                            className="w-full bg-transparent border-none px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-400"
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
    const heroWords = [
        "Apps (React, Vue, Flutter, HTML)",
        "Python Scripts & Node.js",
        "Images (Logos, Edits)",
        "Audio (Transcripts, Text-To-Speech)",
        "Tasks on your board",
        "API Keys for development",
        "Answers to general knowledge"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prev) => (prev + 1) % heroWords.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [heroWords.length]);

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
                    <div className="h-20 md:h-24 relative overflow-hidden mt-2 w-full max-w-4xl mx-auto">
                        {heroWords.map((word, index) => (
                            <div 
                                key={index}
                                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out transform ${
                                    index === currentWordIndex 
                                        ? 'translate-y-0 opacity-100 blur-0' 
                                        : index === (currentWordIndex - 1 + heroWords.length) % heroWords.length
                                            ? 'translate-y-12 opacity-0 blur-sm' // Previous slides down/out
                                            : '-translate-y-12 opacity-0 blur-sm' // Next waits at top
                                }`}
                            >
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 dark:from-purple-400 dark:via-pink-300 dark:to-purple-400 bg-[length:200%_auto] animate-shimmer text-2xl md:text-4xl px-4 leading-relaxed">
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
                    The ultimate platform for creators and developers. Generate code, images, and voice interactions in one unified studio powered by Zee AI.
                 </p>

                 <div className="flex justify-center gap-4 mb-8">
                     <button 
                        onClick={() => onNavigate(View.BUILDER)}
                        className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                     >
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

            {/* Engagement Chat (Inline) */}
            <EngagementChat onNavigate={onNavigate} />

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <FeatureCard 
                    title="User Dashboard" 
                    description="Track your progress, manage projects, and view statistics."
                    icon={LayoutDashboard}
                    color="bg-indigo-600"
                    onClick={() => onNavigate(View.DASHBOARD)}
                />
                <FeatureCard 
                    title="App Builder IDE" 
                    description="Full-featured drag-and-drop builder. Export Clean Code for Web, Python & Flutter."
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
            <div className="mt-16 pt-12 border-t border-gray-200 dark:border-slate-800">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                             <Layers className="w-5 h-5 mr-2 text-blue-500" />
                             Frontend Architecture
                         </h3>
                         <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                             Built with React 19, Tailwind CSS, and Lucide Icons. 
                             Features a responsive component-based architecture, real-time state management, and simulated IDE environment.
                         </p>
                         <div className="flex flex-wrap gap-2">
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-slate-800">React 19</span>
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-cyan-600 dark:text-cyan-400 border border-gray-200 dark:border-slate-800">Tailwind</span>
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-violet-600 dark:text-violet-400 border border-gray-200 dark:border-slate-800">Vite</span>
                         </div>
                     </div>
                     <div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                             <Database className="w-5 h-5 mr-2 text-green-500" />
                             Backend & AI
                         </h3>
                         <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                             Powered by Zee AI Intelligence. Utilizing Zee Pro for reasoning and Zee Image models for assets.
                         </p>
                         <div className="flex flex-wrap gap-2">
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-orange-600 dark:text-orange-400 border border-gray-200 dark:border-slate-800">Zee Pro</span>
                             <span className="px-3 py-1 bg-gray-100 dark:bg-slate-900 rounded-full text-xs text-green-600 dark:text-green-400 border border-gray-200 dark:border-slate-800">Gemini 1.5</span>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default Home;
