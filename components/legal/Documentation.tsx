import React, { useState } from 'react';
import { View } from '../../types';
import { 
    Book, Zap, Code, MessageSquare, Image, Mic, Layers, Users, GitBranch, Terminal,
    ChevronRight, CheckCircle, Copy, ArrowRight, Sparkles, Settings, Globe, Eye, Box,
    FileText, Clock
} from 'lucide-react';

interface DocumentationProps {
    onNavigate: (view: View) => void;
}

const Documentation: React.FC<DocumentationProps> = ({ onNavigate }) => {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const CodeBlock: React.FC<{ code: string; language: string; id: string }> = ({ code, language, id }) => (
        <div className="relative group my-4">
            <div className="absolute top-2 right-2 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{language}</span>
                <button 
                    onClick={() => copyCode(code, id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                    {copiedCode === id ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-sm font-mono text-slate-300">
                <code>{code}</code>
            </pre>
        </div>
    );

    const docSections = [
        { id: 'getting-started', label: 'Getting Started', icon: Zap },
        { id: 'builder', label: 'App Builder', icon: Code },
        { id: 'chat', label: 'AI Chat', icon: MessageSquare },
        { id: 'image-studio', label: 'Image Studio', icon: Image },
        { id: 'audio', label: 'Voice & Audio', icon: Mic },
        { id: 'projects', label: 'Projects', icon: Layers },
        { id: 'community', label: 'Community', icon: Users },
        { id: 'integrations', label: 'Integrations', icon: GitBranch },
        { id: 'api', label: 'API Reference', icon: Terminal }
    ];

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center pb-10 border-b border-gray-200 dark:border-slate-800 mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-indigo-500/20">
                    <Book className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Documentation</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
                    Everything you need to know about building with Zee Builder.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                        <Clock className="w-4 h-4" /> Updated: Dec 2025
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                        <FileText className="w-4 h-4" /> v2.1.0
                    </span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 shrink-0">
                    <div className="lg:sticky lg:top-24">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Topics</h3>
                        <nav className="space-y-1">
                            {docSections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                        activeSection === section.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    <section.icon className="w-4 h-4" />
                                    {section.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 min-w-0 space-y-16">
                    {/* Getting Started */}
                    <section id="getting-started" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-yellow-500" />
                            Getting Started
                        </h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                Zee Builder is an AI-powered development environment that helps you build full-stack applications 
                                using natural language. Whether you're a beginner or an experienced developer, Zee Builder 
                                streamlines your workflow.
                            </p>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Quick Start</h3>
                                <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300">
                                    <li>Sign in with your account</li>
                                    <li>Click "New Project" or use the AI Chat</li>
                                    <li>Describe your app idea in plain English</li>
                                    <li>Watch as Zee Builder generates your code</li>
                                </ol>
                            </div>
                        </div>
                    </section>

                    {/* App Builder */}
                    <section id="builder" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Code className="w-6 h-6 text-blue-500" />
                            App Builder
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            The core of Zee Builder is the App Builder interface. It combines a code editor, 
                            terminal, and live preview into a single view.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Code Editor</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Monaco-based editor with syntax highlighting, IntelliSense, and multi-file support.
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Live Preview</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Instant preview of your application with hot reloading as you type.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* AI Chat */}
                    <section id="chat" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-green-500" />
                            AI Chat
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Interact with our advanced AI models to generate code, debug issues, or brainstorm ideas.
                        </p>
                        <CodeBlock 
                            id="chat-example"
                            language="text"
                            code="User: Create a responsive navbar with a dark mode toggle using Tailwind CSS.
AI: I'll create a Navbar component with those features..."
                        />
                    </section>

                    {/* Image Studio */}
                    <section id="image-studio" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Image className="w-6 h-6 text-purple-500" />
                            Image Studio
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Generate high-quality assets for your applications using Google's Imagen 3 model.
                        </p>
                    </section>

                    {/* Voice & Audio */}
                    <section id="audio" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Mic className="w-6 h-6 text-pink-500" />
                            Voice & Audio
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Convert text to lifelike speech or transcribe audio files with high accuracy.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Text to Speech</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Generate speech in multiple voices and languages.
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Transcription</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Convert uploaded audio files or recordings into text.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Projects */}
                    <section id="projects" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Layers className="w-6 h-6 text-indigo-500" />
                            Projects
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Manage your applications, view deployment status, and organize your work.
                        </p>
                    </section>

                    {/* Community */}
                    <section id="community" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Users className="w-6 h-6 text-orange-500" />
                            Community
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Connect with other developers, share your projects, and get help from the community.
                        </p>
                    </section>

                    {/* Integrations */}
                    <section id="integrations" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <GitBranch className="w-6 h-6 text-slate-500" />
                            Integrations
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Connect Zee Builder with your favorite tools and services.
                        </p>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                GitHub - Sync repositories and manage version control
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Vercel - Deploy your applications with one click
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Supabase - Add authentication and database features
                            </li>
                        </ul>
                    </section>

                    {/* API Reference */}
                    <section id="api" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <Terminal className="w-6 h-6 text-red-500" />
                            API Reference
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Access Zee Builder features programmatically using our REST API.
                        </p>
                        <CodeBlock 
                            id="api-example"
                            language="bash"
                            code="curl -X POST https://api.zee.ai/v1/generate \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -d '{
    'prompt': 'Create a landing page',
    'framework': 'react'
  }'"
                        />
                    </section>

                    {/* Navigation Footer */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-slate-800">
                        <button
                            onClick={() => onNavigate(View.TERMS)}
                            className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                        >
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Back</span>
                            <span className="block text-slate-900 dark:text-white font-bold mt-1 group-hover:text-indigo-600 transition-colors">
                                ← Terms of Service
                            </span>
                        </button>
                        <button
                            onClick={() => onNavigate(View.DEVELOPERS)}
                            className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                        >
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Next</span>
                            <span className="block text-slate-900 dark:text-white font-bold mt-1 group-hover:text-indigo-600 transition-colors">
                                API Reference →
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documentation;
