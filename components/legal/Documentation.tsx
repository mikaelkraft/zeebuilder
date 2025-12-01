import React, { useState } from 'react';
import { View } from '../../types';
import { 
    Book, Zap, Code, MessageSquare, Image, Mic, Layers, Users, GitBranch, Terminal,
    ChevronRight, CheckCircle, Copy, ArrowRight, Sparkles, Settings, Globe, Eye, Box,
    FileText
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Back navigation */}
                <button 
                    onClick={() => onNavigate(View.HOME)}
                    className="mb-6 flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to Home
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:w-64 flex-shrink-0">
                            <div className="sticky top-4 bg-gray-50 dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <Book className="w-5 h-5 text-indigo-500" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Documentation</h3>
                                </div>
                                <nav className="space-y-1">
                                    {docSections.map(section => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                                activeSection === section.id
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <section.icon className="w-4 h-4" />
                                            {section.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                            {/* Getting Started */}
                            {activeSection === 'getting-started' && (
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Getting Started with Zee Builder</h1>
                                        <p className="text-lg text-gray-600 dark:text-slate-300">
                                            Zee Builder is a comprehensive AI-powered platform for building full-stack applications. 
                                            Create React, Vue, Flutter, and more with natural language prompts.
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                                        <h2 className="text-xl font-bold mb-3">Quick Start</h2>
                                        <ol className="space-y-3">
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                                <span>Create an account or sign in</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                                                <span>Navigate to the Builder and describe your app</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                                                <span>Watch as AI generates your complete codebase</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                                                <span>Preview, edit, and deploy your application</span>
                                            </li>
                                        </ol>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Platform Features</h2>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {[
                                                { icon: Code, title: 'Multi-Framework Builder', desc: 'Build with React, Vue, Angular, Flutter, HTML/CSS, Python, and more' },
                                                { icon: MessageSquare, title: 'AI Chat Interface', desc: 'Conversational coding assistant for questions and debugging' },
                                                { icon: Image, title: 'Image Studio', desc: 'Generate, edit, and upscale images with Imagen 3' },
                                                { icon: Mic, title: 'Voice & Audio', desc: 'Live voice chat, TTS, and audio transcription' },
                                                { icon: Layers, title: 'Project Management', desc: 'Organize, version, and sync projects across devices' },
                                                { icon: Users, title: 'Community Showcase', desc: 'Share, discover, and remix community projects' },
                                                { icon: GitBranch, title: '85+ Integrations', desc: 'Connect to GitHub, databases, APIs, and more' }
                                            ].map((feature, i) => (
                                                <div key={i} className="bg-gray-50 dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
                                                    <feature.icon className="w-8 h-8 text-indigo-500 mb-3" />
                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-slate-400">{feature.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* App Builder */}
                            {activeSection === 'builder' && (
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">App Builder</h1>
                                        <p className="text-lg text-gray-600 dark:text-slate-300">
                                            Build complete applications from natural language descriptions. Choose from multiple frameworks and tech stacks.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Supported Frameworks</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { name: 'React', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                                                { name: 'Vue.js', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                                                { name: 'Angular', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                                                { name: 'Flutter', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                                                { name: 'HTML/CSS', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                                                { name: 'Python', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
                                                { name: 'Node.js', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400' },
                                                { name: 'Next.js', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' }
                                            ].map((fw, i) => (
                                                <div key={i} className={`${fw.color} px-4 py-3 rounded-lg font-medium text-center`}>
                                                    {fw.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Example Prompts</h2>
                                        <CodeBlock
                                            code={`"Build a modern e-commerce dashboard with React and Tailwind CSS. 
Include product listings, cart functionality, and a checkout flow."`}
                                            language="prompt"
                                            id="prompt1"
                                        />
                                        <CodeBlock
                                            code={`"Create a Flutter mobile app for task management with categories, 
due dates, and push notifications."`}
                                            language="prompt"
                                            id="prompt2"
                                        />
                                        <CodeBlock
                                            code={`"Build a Python Flask REST API with user authentication, 
JWT tokens, and SQLite database."`}
                                            language="prompt"
                                            id="prompt3"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Features</h2>
                                        <ul className="space-y-3">
                                            {[
                                                'Live preview of generated applications',
                                                'Multi-file project structure',
                                                'Syntax highlighting and code editor',
                                                'One-click download as ZIP',
                                                'Export to GitHub repository',
                                                'Deploy to Vercel, Netlify, or custom hosting',
                                                'Iterative refinement with follow-up prompts',
                                                'Version history and rollback'
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-slate-300">
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* AI Chat */}
                            {activeSection === 'chat' && (
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">AI Chat Interface</h1>
                                        <p className="text-lg text-gray-600 dark:text-slate-300">
                                            A conversational AI assistant for coding help, debugging, explanations, and more.
                                        </p>
                                    </div>

                                    <div className="bg-slate-900 rounded-xl p-6">
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">U</div>
                                                <div className="bg-slate-800 rounded-lg p-3 text-slate-300 text-sm">
                                                    How do I implement authentication in React?
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">Z</div>
                                                <div className="bg-slate-800 rounded-lg p-3 text-slate-300 text-sm flex-1">
                                                    Here's a complete authentication implementation using React Context and JWT...
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Capabilities</h2>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {[
                                                { title: 'Code Generation', desc: 'Generate functions, components, and complete modules' },
                                                { title: 'Debugging Help', desc: 'Explain errors and suggest fixes' },
                                                { title: 'Code Review', desc: 'Get suggestions for improvements and best practices' },
                                                { title: 'Learning', desc: 'Explain concepts and provide tutorials' },
                                                { title: 'Refactoring', desc: 'Improve code structure and performance' },
                                                { title: 'Documentation', desc: 'Generate comments and documentation' }
                                            ].map((cap, i) => (
                                                <div key={i} className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{cap.title}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-slate-400">{cap.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Image Studio */}
                            {activeSection === 'image-studio' && (
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Image Studio</h1>
                                        <p className="text-lg text-gray-600 dark:text-slate-300">
                                            Generate, edit, and enhance images using Google's Imagen 3 model.
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        {[
                                            { icon: Sparkles, title: 'Generate', desc: 'Create images from text descriptions', color: 'from-purple-500 to-pink-500' },
                                            { icon: Settings, title: 'Edit', desc: 'Modify existing images with prompts', color: 'from-blue-500 to-cyan-500' },
                                            { icon: Zap, title: 'Upscale', desc: 'Enhance resolution up to 4x', color: 'from-orange-500 to-red-500' }
                                        ].map((feature, i) => (
                                            <div key={i} className={`bg-gradient-to-br ${feature.color} rounded-xl p-6 text-white`}>
                                                <feature.icon className="w-10 h-10 mb-4 opacity-80" />
                                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                                <p className="text-white/80">{feature.desc}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Supported Formats & Sizes</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {['PNG', 'JPEG', 'WebP', '1:1', '16:9', '9:16', '4:3', '3:4', '1K', '2K', '4K'].map((format, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium">
                                                    {format}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Voice & Audio */}
                            {activeSection === 'audio' && (
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Voice & Audio</h1>
                                        <p className="text-lg text-gray-600 dark:text-slate-300">
                                            Real-time voice conversation, text-to-speech, and audio transcription.
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        {[
                                            { icon: Mic, title: 'Live Voice', desc: 'Real-time voice conversation with AI using Gemini Live API', color: 'from-green-500 to-emerald-500' },
                                            { icon: MessageSquare, title: 'Text-to-Speech', desc: 'Convert text to natural-sounding speech', color: 'from-blue-500 to-cyan-500' },
                                            { icon: FileText, title: 'Transcription', desc: 'Convert audio files to text with high accuracy', color: 'from-purple-500 to-pink-500' }
                                        ].map((feature, i) => (
                                            <div key={i} className={`bg-gradient-to-br ${feature.color} rounded-xl p-6 text-white`}>
                                                <feature.icon className="w-10 h-10 mb-4 opacity-80" />
                                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                                <p className="text-white/80 text-sm">{feature.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {activeSection === 'projects' && (
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Project Management</h1>
                                        <p className="text-lg text-gray-600 dark:text-slate-300">
                                            Organize, sync, and manage all your projects in one place.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Features</h2>
                                        <ul className="space-y-3">
                                            {[
                                                'Create and organize projects with tags and folders',
                                                'Cloud sync across all your devices',
                                                'Version history with rollback support',
                                                'Export projects as ZIP files',
                                                'Push to GitHub repositories',
                                                'Share projects with team members',
                                                'Duplicate and fork existing projects',
                                                'Search and filter by name, framework, or date'
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-slate-300">
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Community */}
                            {activeSection === 'community' && (
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Community Showcase</h1>
                                        <p className="text-lg text-gray-600 dark:text-slate-300">
                                            Discover, share, and remix projects from the Zee Builder community.
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { icon: Globe, title: 'Publish', desc: 'Share your projects with the community' },
                                            { icon: Eye, title: 'Discover', desc: 'Browse featured and trending projects' },
                                            { icon: Box, title: 'Remix', desc: 'Fork and customize community projects' },
                                            { icon: Users, title: 'Follow', desc: 'Follow creators and get updates' }
                                        ].map((feature, i) => (
                                            <div key={i} className="bg-gray-50 dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
                                                <feature.icon className="w-8 h-8 text-indigo-500 mb-3" />
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-slate-400">{feature.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Integrations */}
                            {activeSection === 'integrations' && (
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Integrations</h1>
                                        <p className="text-lg text-gray-600 dark:text-slate-300">
                                            Connect Zee Builder with 85+ third-party services and tools.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Categories</h2>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {[
                                                { title: 'Version Control', items: ['GitHub', 'GitLab', 'Bitbucket'] },
                                                { title: 'Deployment', items: ['Vercel', 'Netlify', 'AWS', 'Railway'] },
                                                { title: 'Databases', items: ['Supabase', 'Firebase', 'MongoDB', 'PostgreSQL'] },
                                                { title: 'Authentication', items: ['Auth0', 'Clerk', 'Supabase Auth'] },
                                                { title: 'Storage', items: ['AWS S3', 'Cloudinary', 'Uploadthing'] },
                                                { title: 'Analytics', items: ['Vercel Analytics', 'Plausible', 'PostHog'] }
                                            ].map((category, i) => (
                                                <div key={i} className="bg-gray-50 dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
                                                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">{category.title}</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {category.items.map((item, j) => (
                                                            <span key={j} className="px-2 py-1 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded text-xs">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* API Reference */}
                            {activeSection === 'api' && (
                                <div className="space-y-8">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">API Reference</h1>
                                        <p className="text-lg text-gray-600 dark:text-slate-300">
                                            Integrate Zee Builder capabilities into your own applications.
                                        </p>
                                    </div>

                                    <div className="bg-slate-900 rounded-xl p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">Base URL</h2>
                                        <code className="text-green-400 font-mono">https://api.zee.ai/v1</code>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Endpoints</h2>
                                        <div className="space-y-3">
                                            {[
                                                { method: 'POST', path: '/generate', desc: 'Generate code from prompt' },
                                                { method: 'POST', path: '/chat', desc: 'Chat completions' },
                                                { method: 'POST', path: '/images/generate', desc: 'Generate images' },
                                                { method: 'POST', path: '/audio/speech', desc: 'Text-to-speech' },
                                                { method: 'POST', path: '/audio/transcribe', desc: 'Transcribe audio' },
                                                { method: 'GET', path: '/projects', desc: 'List projects' },
                                                { method: 'POST', path: '/deploy', desc: 'Deploy project' }
                                            ].map((endpoint, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                        endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                        {endpoint.method}
                                                    </span>
                                                    <code className="font-mono text-sm text-gray-700 dark:text-slate-300">{endpoint.path}</code>
                                                    <span className="text-sm text-gray-500 dark:text-slate-400 ml-auto">{endpoint.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Authentication</h2>
                                        <p className="text-gray-600 dark:text-slate-300 mb-4">
                                            Include your API key in the Authorization header:
                                        </p>
                                        <CodeBlock
                                            code={`Authorization: Bearer YOUR_API_KEY`}
                                            language="http"
                                            id="auth-header"
                                        />
                                    </div>

                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Terminal className="w-6 h-6 text-indigo-500" />
                                            <h3 className="font-bold text-gray-900 dark:text-white">Developer Console</h3>
                                        </div>
                                        <p className="text-gray-600 dark:text-slate-300 mb-4">
                                            Visit the Developer Console to manage API keys, test endpoints, and monitor usage.
                                        </p>
                                        <button 
                                            onClick={() => onNavigate(View.DEVELOPERS)}
                                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2"
                                        >
                                            Open Developer Console
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer links */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-slate-400">
                    <button onClick={() => onNavigate(View.POLICY)} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Privacy Policy
                    </button>
                    <button onClick={() => onNavigate(View.TERMS)} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Terms of Service
                    </button>
                    <button onClick={() => onNavigate(View.DOCS)} className="text-indigo-500 font-medium">
                        Documentation
                    </button>
                    <button onClick={() => onNavigate(View.DEVELOPERS)} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Developers
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Documentation;
