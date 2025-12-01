import React, { useState, useEffect } from 'react';
import { View, SavedProject, Stack } from '../types';
import {
    Database,
    Cloud,
    Lock,
    CreditCard,
    Mail,
    Search,
    BarChart3,
    Server,
    Cpu,
    Workflow,
    ExternalLink,
    Copy,
    Check,
    Sparkles,
    ArrowRight,
    Globe,
    Zap,
    X,
    FolderOpen,
    Plus,
    Code
} from 'lucide-react';

interface IntegrationsProps {
    onNavigate: (view: View) => void;
}

interface Integration {
    name: string;
    color: string;
    desc: string;
    docsUrl?: string;
    category?: string;
}

// Stack icons helper
const getStackIcon = (stack: Stack) => {
    const icons: Record<Stack, string> = {
        'react': '⚛️',
        'react-ts': '⚛️',
        'vue': '💚',
        'html': '🌐',
        'python': '🐍',
        'flutter': '💙'
    };
    return icons[stack] || '📁';
};

const IntegrationCard: React.FC<{ 
    integration: Integration; 
    onIntegrate: (name: string) => void;
}> = ({ integration, onIntegrate }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyPrompt = () => {
        const prompt = `Add ${integration.name} integration to my project`;
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group p-4 bg-white dark:bg-slate-800/50 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500/50 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform shadow-lg`}>
                    {integration.name.charAt(0)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {integration.docsUrl && (
                        <a 
                            href={integration.docsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Docs"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                    <button
                        onClick={handleCopyPrompt}
                        className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Copy AI Prompt"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{integration.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{integration.desc}</p>
            <button
                onClick={() => onIntegrate(integration.name)}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
            >
                <Sparkles className="w-3 h-3" />
                Integrate with AI
            </button>
        </div>
    );
};

// Project Selector Modal
const ProjectSelectorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    serviceName: string;
    onSelectProject: (projectId: string | null) => void;
    projects: SavedProject[];
}> = ({ isOpen, onClose, serviceName, onSelectProject, projects }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 p-4 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="min-h-full flex items-center justify-center py-4">
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden border border-gray-200 dark:border-slate-700">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-500" />
                                Add {serviceName} Integration
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Choose which project to integrate with
                            </p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Project List */}
                <div className="p-4 max-h-[50vh] overflow-y-auto">
                    {/* New Project Option */}
                    <button
                        onClick={() => onSelectProject(null)}
                        className="w-full p-4 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center gap-4 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Create New Project</p>
                            <p className="text-sm text-white/70">Start fresh with {serviceName} pre-configured</p>
                        </div>
                    </button>

                    {projects.length > 0 && (
                        <>
                            <div className="flex items-center gap-2 my-4">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
                                <span className="text-xs text-slate-500 uppercase">Or add to existing project</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
                            </div>

                            <div className="space-y-2">
                                {projects.map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => onSelectProject(project.id)}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500/50 transition-all text-left"
                                    >
                                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl">
                                            {getStackIcon(project.stack)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 dark:text-white truncate">{project.name}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <span className="capitalize">{project.stack}</span>
                                                <span>•</span>
                                                <span>{project.files.length} files</span>
                                            </p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-400" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {projects.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No existing projects found</p>
                            <p className="text-xs mt-1">Click above to create a new project with {serviceName}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 text-center">
                        AI will generate the integration code with proper setup, configuration, and examples
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
};

const Integrations: React.FC<IntegrationsProps> = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedService, setSelectedService] = useState<string>('');
    const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

    // Load saved projects
    useEffect(() => {
        const stored = localStorage.getItem('zee_projects');
        if (stored) {
            try {
                setSavedProjects(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse projects:', e);
            }
        }
    }, []);

    const handleIntegrate = (serviceName: string) => {
        setSelectedService(serviceName);
        setShowProjectModal(true);
    };

    const handleProjectSelect = (projectId: string | null) => {
        // Create the integration prompt
        const prompt = `Add ${selectedService} integration to my project with proper setup, configuration, and example usage. Include:
1. Package installation (npm/pip as appropriate)
2. Environment variables setup
3. Client initialization code
4. Example usage with best practices
5. Error handling`;

        // Store the prompt
        localStorage.setItem('zee_pending_prompt', prompt);

        if (projectId) {
            // Set the specific project to load
            localStorage.setItem('zee_active_project_id', projectId);
            localStorage.setItem('zee_integration_target', projectId);
        } else {
            // Clear to trigger new project wizard
            localStorage.removeItem('zee_active_project_id');
            localStorage.setItem('zee_create_new_with_integration', selectedService);
        }

        setShowProjectModal(false);
        onNavigate(View.BUILDER);
    };

    const categories = [
        {
            id: 'backend',
            name: 'Backend & Database',
            icon: Database,
            color: 'text-green-500',
            integrations: [
                { name: 'Supabase', color: 'bg-emerald-500', desc: 'Auth, Database, Storage, Realtime', docsUrl: 'https://supabase.com/docs' },
                { name: 'Firebase', color: 'bg-orange-500', desc: 'Realtime DB, Auth, Cloud Functions', docsUrl: 'https://firebase.google.com/docs' },
                { name: 'Appwrite', color: 'bg-pink-500', desc: 'Open-source Backend as a Service', docsUrl: 'https://appwrite.io/docs' },
                { name: 'Neon', color: 'bg-cyan-500', desc: 'Serverless Postgres Database', docsUrl: 'https://neon.tech/docs' },
                { name: 'PlanetScale', color: 'bg-slate-600', desc: 'MySQL-compatible serverless DB', docsUrl: 'https://planetscale.com/docs' },
                { name: 'MongoDB', color: 'bg-green-600', desc: 'NoSQL Document Database', docsUrl: 'https://www.mongodb.com/docs' },
                { name: 'Prisma', color: 'bg-indigo-500', desc: 'Next-gen ORM & Migrations', docsUrl: 'https://www.prisma.io/docs' },
                { name: 'Convex', color: 'bg-red-500', desc: 'Reactive Backend Platform', docsUrl: 'https://docs.convex.dev' },
                { name: 'Xata', color: 'bg-purple-500', desc: 'Serverless Database with Search', docsUrl: 'https://xata.io/docs' },
                { name: 'Turso', color: 'bg-teal-500', desc: 'Edge-hosted SQLite Database', docsUrl: 'https://docs.turso.tech' },
                { name: 'Upstash', color: 'bg-emerald-600', desc: 'Serverless Redis & Kafka', docsUrl: 'https://upstash.com/docs' },
                { name: 'Fauna', color: 'bg-blue-600', desc: 'Distributed Document Database', docsUrl: 'https://docs.fauna.com' },
            ]
        },
        {
            id: 'hosting',
            name: 'Hosting & Deployment',
            icon: Cloud,
            color: 'text-blue-500',
            integrations: [
                { name: 'Vercel', color: 'bg-slate-900', desc: 'Frontend Cloud Platform', docsUrl: 'https://vercel.com/docs' },
                { name: 'Netlify', color: 'bg-teal-500', desc: 'JAMstack Hosting & Functions', docsUrl: 'https://docs.netlify.com' },
                { name: 'Railway', color: 'bg-purple-600', desc: 'Deploy Anything with Ease', docsUrl: 'https://docs.railway.app' },
                { name: 'Render', color: 'bg-emerald-500', desc: 'Unified Cloud Platform', docsUrl: 'https://render.com/docs' },
                { name: 'Fly.io', color: 'bg-violet-500', desc: 'Edge Deployment Platform', docsUrl: 'https://fly.io/docs' },
                { name: 'Cloudflare', color: 'bg-orange-500', desc: 'Workers, Pages & CDN', docsUrl: 'https://developers.cloudflare.com' },
                { name: 'AWS', color: 'bg-yellow-600', desc: 'Full Cloud Services Suite', docsUrl: 'https://docs.aws.amazon.com' },
                { name: 'Google Cloud', color: 'bg-blue-500', desc: 'GCP Services & APIs', docsUrl: 'https://cloud.google.com/docs' },
                { name: 'Azure', color: 'bg-sky-500', desc: 'Microsoft Cloud Platform', docsUrl: 'https://docs.microsoft.com/azure' },
                { name: 'DigitalOcean', color: 'bg-blue-600', desc: 'App Platform & Droplets', docsUrl: 'https://docs.digitalocean.com' },
                { name: 'Heroku', color: 'bg-purple-500', desc: 'PaaS Cloud Hosting', docsUrl: 'https://devcenter.heroku.com' },
                { name: 'Deno Deploy', color: 'bg-slate-700', desc: 'Edge Functions Runtime', docsUrl: 'https://deno.com/deploy/docs' },
            ]
        },
        {
            id: 'auth',
            name: 'Authentication',
            icon: Lock,
            color: 'text-purple-500',
            integrations: [
                { name: 'Clerk', color: 'bg-violet-600', desc: 'Complete User Management', docsUrl: 'https://clerk.com/docs' },
                { name: 'Auth0', color: 'bg-orange-600', desc: 'Universal Identity Platform', docsUrl: 'https://auth0.com/docs' },
                { name: 'NextAuth.js', color: 'bg-slate-800', desc: 'Next.js Authentication', docsUrl: 'https://next-auth.js.org' },
                { name: 'Lucia', color: 'bg-indigo-500', desc: 'Simple Auth Library', docsUrl: 'https://lucia-auth.com' },
                { name: 'Kinde', color: 'bg-slate-700', desc: 'Auth for Modern SaaS', docsUrl: 'https://kinde.com/docs' },
                { name: 'WorkOS', color: 'bg-blue-600', desc: 'Enterprise SSO & Directory', docsUrl: 'https://workos.com/docs' },
                { name: 'Stytch', color: 'bg-emerald-500', desc: 'Passwordless Authentication', docsUrl: 'https://stytch.com/docs' },
                { name: 'Magic', color: 'bg-purple-500', desc: 'Web3 & Passwordless Auth', docsUrl: 'https://magic.link/docs' },
            ]
        },
        {
            id: 'payments',
            name: 'Payments & Commerce',
            icon: CreditCard,
            color: 'text-green-500',
            integrations: [
                { name: 'Stripe', color: 'bg-indigo-600', desc: 'Global Payments Infrastructure', docsUrl: 'https://stripe.com/docs' },
                { name: 'Flutterwave', color: 'bg-orange-500', desc: 'African Payments Gateway', docsUrl: 'https://developer.flutterwave.com/docs' },
                { name: 'Paystack', color: 'bg-cyan-500', desc: 'African Payment Solutions', docsUrl: 'https://paystack.com/docs' },
                { name: 'Opay', color: 'bg-green-500', desc: 'Mobile Money & Payments', docsUrl: 'https://documentation.opayweb.com' },
                { name: 'LemonSqueezy', color: 'bg-yellow-500', desc: 'Digital Product Sales', docsUrl: 'https://docs.lemonsqueezy.com' },
                { name: 'Paddle', color: 'bg-blue-500', desc: 'SaaS Billing & Checkout', docsUrl: 'https://developer.paddle.com' },
                { name: 'PayPal', color: 'bg-blue-700', desc: 'Global Payment Platform', docsUrl: 'https://developer.paypal.com/docs' },
                { name: 'Shopify', color: 'bg-green-600', desc: 'E-commerce Platform', docsUrl: 'https://shopify.dev/docs' },
                { name: 'Gumroad', color: 'bg-pink-500', desc: 'Creator Economy Payments', docsUrl: 'https://help.gumroad.com' },
            ]
        },
        {
            id: 'email',
            name: 'Email & Communication',
            icon: Mail,
            color: 'text-red-500',
            integrations: [
                { name: 'Resend', color: 'bg-slate-800', desc: 'Email API for Developers', docsUrl: 'https://resend.com/docs' },
                { name: 'SendGrid', color: 'bg-blue-500', desc: 'Email Delivery Service', docsUrl: 'https://docs.sendgrid.com' },
                { name: 'Postmark', color: 'bg-yellow-500', desc: 'Transactional Email', docsUrl: 'https://postmarkapp.com/developer' },
                { name: 'Mailgun', color: 'bg-red-600', desc: 'Email API & SMTP', docsUrl: 'https://documentation.mailgun.com' },
                { name: 'Twilio', color: 'bg-red-500', desc: 'SMS, Voice & Messaging', docsUrl: 'https://www.twilio.com/docs' },
                { name: 'Knock', color: 'bg-purple-600', desc: 'Notification Infrastructure', docsUrl: 'https://docs.knock.app' },
                { name: 'Novu', color: 'bg-pink-500', desc: 'Open-source Notifications', docsUrl: 'https://docs.novu.co' },
                { name: 'Pusher', color: 'bg-indigo-500', desc: 'Realtime Communication', docsUrl: 'https://pusher.com/docs' },
            ]
        },
        {
            id: 'ai',
            name: 'AI & Machine Learning',
            icon: Cpu,
            color: 'text-pink-500',
            integrations: [
                { name: 'OpenAI', color: 'bg-emerald-600', desc: 'GPT, DALL·E & Whisper', docsUrl: 'https://platform.openai.com/docs' },
                { name: 'Anthropic', color: 'bg-orange-600', desc: 'Claude AI Models', docsUrl: 'https://docs.anthropic.com' },
                { name: 'Replicate', color: 'bg-slate-700', desc: 'Run ML Models via API', docsUrl: 'https://replicate.com/docs' },
                { name: 'Hugging Face', color: 'bg-yellow-500', desc: 'Model Hub & Inference', docsUrl: 'https://huggingface.co/docs' },
                { name: 'Pinecone', color: 'bg-teal-500', desc: 'Vector Database for AI', docsUrl: 'https://docs.pinecone.io' },
                { name: 'LangChain', color: 'bg-green-600', desc: 'LLM Application Framework', docsUrl: 'https://js.langchain.com/docs' },
                { name: 'Vercel AI SDK', color: 'bg-slate-900', desc: 'AI SDK for Web Apps', docsUrl: 'https://sdk.vercel.ai/docs' },
                { name: 'Cohere', color: 'bg-purple-500', desc: 'NLP & Embeddings API', docsUrl: 'https://docs.cohere.com' },
            ]
        },
        {
            id: 'analytics',
            name: 'Analytics & Monitoring',
            icon: BarChart3,
            color: 'text-blue-500',
            integrations: [
                { name: 'Vercel Analytics', color: 'bg-slate-800', desc: 'Web Vitals & Insights', docsUrl: 'https://vercel.com/docs/analytics' },
                { name: 'PostHog', color: 'bg-blue-600', desc: 'Product Analytics Suite', docsUrl: 'https://posthog.com/docs' },
                { name: 'Mixpanel', color: 'bg-purple-500', desc: 'User Behavior Analytics', docsUrl: 'https://docs.mixpanel.com' },
                { name: 'Plausible', color: 'bg-indigo-500', desc: 'Privacy-first Analytics', docsUrl: 'https://plausible.io/docs' },
                { name: 'Sentry', color: 'bg-pink-600', desc: 'Error Tracking & Monitoring', docsUrl: 'https://docs.sentry.io' },
                { name: 'LogRocket', color: 'bg-violet-500', desc: 'Session Replay & Logs', docsUrl: 'https://docs.logrocket.com' },
                { name: 'Datadog', color: 'bg-purple-600', desc: 'Full Observability Platform', docsUrl: 'https://docs.datadoghq.com' },
                { name: 'Axiom', color: 'bg-slate-700', desc: 'Log Management & Analytics', docsUrl: 'https://axiom.co/docs' },
            ]
        },
        {
            id: 'storage',
            name: 'Storage & Media',
            icon: Server,
            color: 'text-orange-500',
            integrations: [
                { name: 'Cloudinary', color: 'bg-blue-500', desc: 'Media Management & CDN', docsUrl: 'https://cloudinary.com/documentation' },
                { name: 'Uploadthing', color: 'bg-red-500', desc: 'File Uploads for Next.js', docsUrl: 'https://docs.uploadthing.com' },
                { name: 'AWS S3', color: 'bg-orange-600', desc: 'Object Storage Service', docsUrl: 'https://docs.aws.amazon.com/s3' },
                { name: 'Cloudflare R2', color: 'bg-orange-500', desc: 'Zero Egress Storage', docsUrl: 'https://developers.cloudflare.com/r2' },
                { name: 'Bunny CDN', color: 'bg-orange-400', desc: 'Fast Global CDN', docsUrl: 'https://docs.bunny.net' },
                { name: 'imgix', color: 'bg-slate-700', desc: 'Image Processing CDN', docsUrl: 'https://docs.imgix.com' },
            ]
        },
        {
            id: 'search',
            name: 'Search & CMS',
            icon: Search,
            color: 'text-indigo-500',
            integrations: [
                { name: 'Algolia', color: 'bg-blue-600', desc: 'Search & Discovery API', docsUrl: 'https://www.algolia.com/doc' },
                { name: 'Typesense', color: 'bg-purple-500', desc: 'Open-source Search Engine', docsUrl: 'https://typesense.org/docs' },
                { name: 'Meilisearch', color: 'bg-pink-500', desc: 'Lightning Fast Search', docsUrl: 'https://docs.meilisearch.com' },
                { name: 'Sanity', color: 'bg-red-500', desc: 'Headless CMS Platform', docsUrl: 'https://www.sanity.io/docs' },
                { name: 'Contentful', color: 'bg-blue-500', desc: 'Content Platform', docsUrl: 'https://www.contentful.com/developers/docs' },
                { name: 'Strapi', color: 'bg-indigo-600', desc: 'Open-source Headless CMS', docsUrl: 'https://docs.strapi.io' },
            ]
        },
    ];

    // Filter integrations based on search
    const filteredCategories = categories.map(cat => ({
        ...cat,
        integrations: cat.integrations.filter(int => 
            int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            int.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => 
        activeCategory ? cat.id === activeCategory : cat.integrations.length > 0
    );

    const totalIntegrations = categories.reduce((acc, cat) => acc + cat.integrations.length, 0);

    return (
        <div className="min-h-full pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <Workflow className="w-8 h-8 text-blue-500" />
                                Integrations
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                {totalIntegrations}+ services ready to integrate with AI assistance
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search integrations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                !activeCategory 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                                    activeCategory === cat.id 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? '' : cat.color}`} />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* How it Works Banner */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-xl font-bold mb-2">How Integration Works</h2>
                            <p className="text-white/80 text-sm">
                                Click "Integrate" → Choose your project (or create new) → AI generates the integration code.
                                Use the same service across multiple projects - just select which one to integrate with!
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                                <FolderOpen className="w-4 h-4" />
                                <span>Multi-Project</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                                <Zap className="w-4 h-4" />
                                <span>Instant Setup</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integration Categories */}
                <div className="space-y-10">
                    {filteredCategories.map(category => (
                        <div key={category.id}>
                            <div className="flex items-center gap-3 mb-4">
                                <category.icon className={`w-6 h-6 ${category.color}`} />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{category.name}</h2>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full">
                                    {category.integrations.length} services
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {category.integrations.map((integration, idx) => {
                                    const integrationWithCategory = { ...integration, category: category.name };
                                    return (
                                        <IntegrationCard 
                                            key={idx} 
                                            integration={integrationWithCategory}
                                            onIntegrate={handleIntegrate}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredCategories.every(cat => cat.integrations.length === 0) && (
                    <div className="text-center py-20">
                        <Search className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No integrations found</h3>
                        <p className="text-slate-500">Try a different search term or category</p>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-12 text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                        Don't see what you need?
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xl mx-auto">
                        Just ask Zee in the Builder! You can request any integration and AI will generate the code for you.
                    </p>
                    <button
                        onClick={() => onNavigate(View.BUILDER)}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2 mx-auto transition-all shadow-lg hover:shadow-xl"
                    >
                        Open App Builder
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Project Selector Modal */}
            <ProjectSelectorModal
                isOpen={showProjectModal}
                onClose={() => setShowProjectModal(false)}
                serviceName={selectedService}
                onSelectProject={handleProjectSelect}
                projects={savedProjects}
            />
        </div>
    );
};

export default Integrations;
