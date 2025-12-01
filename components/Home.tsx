
import React, { useState, useEffect } from 'react';
import { View, CommunityProject } from '../types';
import { getFeaturedProjects, toggleLike, incrementViews, incrementRemix, getProjectLikes, getProjectViews, getProjectRemixes, hasUserLiked } from '../services/communityService';
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
    Workflow,
    Heart,
    Eye,
    Users,
    ExternalLink,
    Rocket,
    GitFork
} from 'lucide-react';

interface HomeProps {
    onNavigate: (view: View) => void;
}

const FeatureCard = ({ title, description, icon: Icon, onClick, color }: any) => (
    <button 
        onClick={onClick}
        className="flex flex-col text-left p-4 bg-white dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl hover:border-blue-400 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 group shadow-lg backdrop-blur-sm h-full"
    >
        <div className={`p-2.5 rounded-lg w-fit mb-3 ${color} shadow-lg shadow-black/20 text-white`}>
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
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

// Community Showcase Component
const CommunityShowcase = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
    const [projects, setProjects] = useState<CommunityProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<CommunityProject | null>(null);
    const [projectStats, setProjectStats] = useState<Record<string, { likes: number; views: number; remixes: number; isLiked: boolean }>>({});

    useEffect(() => {
        const fetched = getFeaturedProjects().slice(0, 6);
        setProjects(fetched);
        
        // Initialize stats for all projects
        const stats: Record<string, { likes: number; views: number; remixes: number; isLiked: boolean }> = {};
        fetched.forEach(p => {
            stats[p.id] = {
                likes: getProjectLikes(p.id),
                views: getProjectViews(p.id),
                remixes: getProjectRemixes(p.id),
                isLiked: hasUserLiked(p.id)
            };
        });
        setProjectStats(stats);
    }, []);

    const handleLike = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        const result = toggleLike(projectId);
        setProjectStats(prev => ({
            ...prev,
            [projectId]: {
                ...prev[projectId],
                likes: result.likes,
                isLiked: result.isLiked
            }
        }));
    };

    const handleProjectClick = (project: CommunityProject) => {
        // Increment view count when project is opened
        const newViews = incrementViews(project.id);
        setProjectStats(prev => ({
            ...prev,
            [project.id]: {
                ...prev[project.id],
                views: newViews
            }
        }));
        setSelectedProject(project);
    };

    const getStackIcon = (stack: string) => {
        switch(stack) {
            case 'react': case 'react-ts': return <Code className="w-4 h-4" />;
            case 'vue': return <Layers className="w-4 h-4" />;
            case 'flutter': return <Smartphone className="w-4 h-4" />;
            case 'python': return <Terminal className="w-4 h-4" />;
            default: return <Globe className="w-4 h-4" />;
        }
    };

    const getStackColor = (stack: string) => {
        switch(stack) {
            case 'react': case 'react-ts': return 'bg-blue-500';
            case 'vue': return 'bg-green-500';
            case 'flutter': return 'bg-cyan-500';
            case 'python': return 'bg-yellow-500';
            default: return 'bg-orange-500';
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const openInBuilder = (project: CommunityProject) => {
        // Increment remix count
        const newRemixes = incrementRemix(project.id);
        setProjectStats(prev => ({
            ...prev,
            [project.id]: {
                ...prev[project.id],
                remixes: newRemixes
            }
        }));
        
        // Save the project files temporarily for the builder to pick up
        const tempProject = {
            id: `community-${project.id}-${Date.now()}`,
            name: `${project.name} (Remix)`,
            stack: project.stack,
            files: project.files,
            lastModified: Date.now(),
            dbConfigs: [],
            messages: [],
            snapshots: []
        };
        
        // Add to user's projects
        const stored = localStorage.getItem('zee_projects');
        const userProjects = stored ? JSON.parse(stored) : [];
        userProjects.unshift(tempProject);
        localStorage.setItem('zee_projects', JSON.stringify(userProjects));
        localStorage.setItem('zee_active_project_id', tempProject.id);
        
        setSelectedProject(null);
        onNavigate(View.BUILDER);
    };

    if (projects.length === 0) return null;

    return (
        <>
            <div className="mt-16 px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-center gap-2">
                        <Rocket className="w-7 h-7 text-purple-500" />
                        Community Showcase
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm">
                        Explore amazing projects built by the community. Get inspired and use them as templates!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => {
                        const stats = projectStats[project.id] || { likes: project.likes, views: project.views, remixes: 0, isLiked: false };
                        return (
                        <div 
                            key={project.id}
                            onClick={() => handleProjectClick(project)}
                            className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-xl"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                {project.thumbnail ? (
                                    <img 
                                        src={project.thumbnail} 
                                        alt={project.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Code className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                                    </div>
                                )}
                                {/* Stack Badge */}
                                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 ${getStackColor(project.stack)} text-white text-xs font-bold rounded-full shadow-lg`}>
                                    {getStackIcon(project.stack)}
                                    {project.stack}
                                </div>
                                {/* Featured Badge */}
                                {project.featured && (
                                    <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Featured
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-blue-500 transition-colors line-clamp-1">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                    {project.description}
                                </p>

                                {/* Author & Stats */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                                            {project.authorName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs text-slate-500">{project.authorName}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <button 
                                            onClick={(e) => handleLike(e, project.id)}
                                            className={`flex items-center gap-1 hover:scale-110 transition-all ${stats.isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
                                        >
                                            <Heart className={`w-3.5 h-3.5 transition-all ${stats.isLiked ? 'fill-red-500' : ''}`} />
                                            {formatNumber(stats.likes)}
                                        </button>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> {formatNumber(stats.views)}
                                        </span>
                                        {stats.remixes > 0 && (
                                            <span className="flex items-center gap-1 text-purple-400">
                                                <GitFork className="w-3 h-3" /> {formatNumber(stats.remixes)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>

                <div className="text-center mt-8">
                    <button 
                        onClick={() => onNavigate(View.PROJECTS)}
                        className="px-6 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium rounded-full border border-gray-200 dark:border-slate-700 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all text-sm mr-3"
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        View All Community Projects
                    </button>
                    <button 
                        onClick={() => onNavigate(View.BUILDER)}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full transition-all shadow-lg text-sm"
                    >
                        Build & Publish Yours →
                    </button>
                </div>
            </div>

            {/* Project Detail Modal */}
            {selectedProject && (
                <div 
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedProject(null)}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header with Thumbnail */}
                        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                            {selectedProject.thumbnail ? (
                                <img 
                                    src={selectedProject.thumbnail} 
                                    alt={selectedProject.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Code className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                                </div>
                            )}
                            <button 
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                            >
                                ✕
                            </button>
                            <div className={`absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 ${getStackColor(selectedProject.stack)} text-white text-sm font-bold rounded-full shadow-lg`}>
                                {getStackIcon(selectedProject.stack)}
                                {selectedProject.stack}
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                        {selectedProject.name}
                                    </h2>
                                    {(() => {
                                        const modalStats = projectStats[selectedProject.id] || { likes: selectedProject.likes, views: selectedProject.views, remixes: 0, isLiked: false };
                                        return (
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <button 
                                            onClick={(e) => handleLike(e, selectedProject.id)}
                                            className={`flex items-center gap-1 transition-all hover:scale-105 ${modalStats.isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
                                        >
                                            <Heart className={`w-4 h-4 ${modalStats.isLiked ? 'fill-red-500' : ''}`} /> {formatNumber(modalStats.likes)} likes
                                        </button>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" /> {formatNumber(modalStats.views)} views
                                        </span>
                                        {modalStats.remixes > 0 && (
                                            <span className="flex items-center gap-1 text-purple-500">
                                                <GitFork className="w-4 h-4" /> {formatNumber(modalStats.remixes)} remixes
                                            </span>
                                        )}
                                        <span>• {timeAgo(selectedProject.publishedAt)}</span>
                                    </div>
                                        );
                                    })()}
                                </div>
                                {selectedProject.featured && (
                                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Featured
                                    </span>
                                )}
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                {selectedProject.description}
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mb-6">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {selectedProject.authorName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {selectedProject.authorName}
                                    </p>
                                    <p className="text-xs text-slate-500">Project Author</p>
                                </div>
                            </div>

                            {/* Files Preview */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Files ({selectedProject.files.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.files.slice(0, 5).map((file, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 rounded">
                                            {file.name}
                                        </span>
                                    ))}
                                    {selectedProject.files.length > 5 && (
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-xs text-slate-500 rounded">
                                            +{selectedProject.files.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setSelectedProject(null)}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Close
                                </button>
                                <button 
                                    onClick={() => openInBuilder(selectedProject)}
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Use as Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
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
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg text-sm"
                    >
                        Try Builder Now →
                    </button>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-8 px-4">
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

            {/* Integrations Section - Compact Carousel */}
            <div className="mt-16 px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-center gap-2">
                        <Workflow className="w-7 h-7 text-blue-500" />
                        85+ Integrations
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm">
                        Connect your favorite services seamlessly. Just ask Zee to add any integration.
                    </p>
                </div>

                {/* Double-line Infinite Carousel */}
                <div className="relative overflow-hidden py-4">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 dark:from-slate-950 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 dark:from-slate-950 to-transparent z-10 pointer-events-none"></div>
                    
                    {/* Row 1 - Scrolls Left */}
                    <div className="flex gap-3 mb-3 animate-scroll-left">
                        {[
                            { name: 'Supabase', color: 'bg-emerald-500' },
                            { name: 'Firebase', color: 'bg-orange-500' },
                            { name: 'Stripe', color: 'bg-indigo-600' },
                            { name: 'Vercel', color: 'bg-slate-800' },
                            { name: 'Clerk', color: 'bg-violet-600' },
                            { name: 'OpenAI', color: 'bg-emerald-600' },
                            { name: 'MongoDB', color: 'bg-green-600' },
                            { name: 'Prisma', color: 'bg-indigo-500' },
                            { name: 'Netlify', color: 'bg-teal-500' },
                            { name: 'Auth0', color: 'bg-orange-600' },
                            { name: 'Resend', color: 'bg-slate-700' },
                            { name: 'Sentry', color: 'bg-pink-600' },
                            { name: 'Cloudinary', color: 'bg-blue-500' },
                            { name: 'Algolia', color: 'bg-blue-600' },
                            { name: 'Paystack', color: 'bg-cyan-500' },
                            // Duplicate for seamless loop
                            { name: 'Supabase', color: 'bg-emerald-500' },
                            { name: 'Firebase', color: 'bg-orange-500' },
                            { name: 'Stripe', color: 'bg-indigo-600' },
                            { name: 'Vercel', color: 'bg-slate-800' },
                            { name: 'Clerk', color: 'bg-violet-600' },
                            { name: 'OpenAI', color: 'bg-emerald-600' },
                            { name: 'MongoDB', color: 'bg-green-600' },
                            { name: 'Prisma', color: 'bg-indigo-500' },
                            { name: 'Netlify', color: 'bg-teal-500' },
                            { name: 'Auth0', color: 'bg-orange-600' },
                            { name: 'Resend', color: 'bg-slate-700' },
                            { name: 'Sentry', color: 'bg-pink-600' },
                            { name: 'Cloudinary', color: 'bg-blue-500' },
                            { name: 'Algolia', color: 'bg-blue-600' },
                            { name: 'Paystack', color: 'bg-cyan-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-full hover:border-blue-500/50 transition-all cursor-pointer group">
                                <div className={`w-6 h-6 ${item.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold group-hover:scale-110 transition-transform`}>
                                    {item.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{item.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Row 2 - Scrolls Right */}
                    <div className="flex gap-3 animate-scroll-right">
                        {[
                            { name: 'Neon', color: 'bg-cyan-500' },
                            { name: 'Railway', color: 'bg-purple-600' },
                            { name: 'Flutterwave', color: 'bg-orange-500' },
                            { name: 'Anthropic', color: 'bg-orange-600' },
                            { name: 'Twilio', color: 'bg-red-500' },
                            { name: 'PostHog', color: 'bg-blue-600' },
                            { name: 'Sanity', color: 'bg-red-500' },
                            { name: 'AWS S3', color: 'bg-orange-600' },
                            { name: 'LangChain', color: 'bg-green-600' },
                            { name: 'Pinecone', color: 'bg-teal-500' },
                            { name: 'Appwrite', color: 'bg-pink-500' },
                            { name: 'Render', color: 'bg-emerald-500' },
                            { name: 'Paddle', color: 'bg-blue-500' },
                            { name: 'Mixpanel', color: 'bg-purple-500' },
                            { name: 'Cloudflare', color: 'bg-orange-500' },
                            // Duplicate for seamless loop
                            { name: 'Neon', color: 'bg-cyan-500' },
                            { name: 'Railway', color: 'bg-purple-600' },
                            { name: 'Flutterwave', color: 'bg-orange-500' },
                            { name: 'Anthropic', color: 'bg-orange-600' },
                            { name: 'Twilio', color: 'bg-red-500' },
                            { name: 'PostHog', color: 'bg-blue-600' },
                            { name: 'Sanity', color: 'bg-red-500' },
                            { name: 'AWS S3', color: 'bg-orange-600' },
                            { name: 'LangChain', color: 'bg-green-600' },
                            { name: 'Pinecone', color: 'bg-teal-500' },
                            { name: 'Appwrite', color: 'bg-pink-500' },
                            { name: 'Render', color: 'bg-emerald-500' },
                            { name: 'Paddle', color: 'bg-blue-500' },
                            { name: 'Mixpanel', color: 'bg-purple-500' },
                            { name: 'Cloudflare', color: 'bg-orange-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-full hover:border-blue-500/50 transition-all cursor-pointer group">
                                <div className={`w-6 h-6 ${item.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold group-hover:scale-110 transition-transform`}>
                                    {item.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* View All & CTA */}
                <div className="text-center mt-6">
                    <button 
                        onClick={() => onNavigate(View.INTEGRATIONS)}
                        className="px-6 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium rounded-full border border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm mr-3"
                    >
                        View All 85+ Integrations
                    </button>
                    <button 
                        onClick={() => onNavigate(View.BUILDER)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg text-sm"
                    >
                        Start Building →
                    </button>
                </div>
            </div>

            {/* CSS for infinite scroll animations */}
            <style>{`
                @keyframes scroll-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes scroll-right {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                .animate-scroll-left {
                    animation: scroll-left 30s linear infinite;
                    width: max-content;
                }
                .animate-scroll-right {
                    animation: scroll-right 30s linear infinite;
                    width: max-content;
                }
                .animate-scroll-left:hover,
                .animate-scroll-right:hover {
                    animation-play-state: paused;
                }
            `}</style>

            {/* Community Showcase Section */}
            <CommunityShowcase onNavigate={onNavigate} />
        </div>
    );
};

export default Home;
