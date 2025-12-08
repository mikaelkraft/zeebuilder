
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { huggingFaceService } from '../services/huggingFaceService';
import { githubService } from '../services/githubService';
import { cloudStorage, ServiceConfig } from '../services/cloudStorage';
import { DatabaseConfig, User, ModelType, ProjectFile, Stack, BuilderChatMessage, SavedProject, FileAttachment, Snapshot } from '../types';
import alert, { alertService } from '../services/alertService';
import { 
    Code as CodeIcon, Download, Plus, Trash2, Bot, Send, Loader2,
    File, RefreshCw, Terminal as TerminalIcon, X, Sidebar,
    RotateCcw, Image, FileCode, ChevronRight, ChevronDown, Database, Package as PackageIcon,
    Smartphone, Layers, Globe, Paperclip, MonitorPlay,
    Undo2, Redo2, Play, FileType, Eye, ArrowLeftRight, Check, AlertCircle, Maximize2, Minimize2, MessageSquare,
    Mic, MicOff, UploadCloud, Copy, Save, History, GitBranch, GitCommit, ArrowUpFromLine, ArrowDownToLine, FolderGit2, Unlink, Edit, Zap, Cloud, Link, Share2
} from 'lucide-react';
import { isProjectPublished, publishToCommmunity, unpublishFromCommunity } from '../services/communityService';
import JSZip from 'jszip';
import CustomPreview from './previews/CustomPreview';
import DartPadPreview from './previews/DartPadPreview';
import PermissionHelpModal from './PermissionHelpModal';

// Use Hugging Face for code generation and media
const { generateProject, blobToBase64, generateImage, transcribeAudio, ensureApiKey } = huggingFaceService;



// Simple Github Icon Component to replace deprecated Lucide icon
const GithubIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface BuilderProps {
    user: User | null;
    initialPrompt?: string | null;
}

interface TreeNode {
    name: string;
    path: string;
    type: 'folder' | 'file';
    children?: TreeNode[];
}

const MarkdownRenderer = ({ content }: { content: string }) => {
    if (!content) return null;
    const parts = content.split(/(```[\w-]*\n[\s\S]*?```)/g);

    return (
        <div className="space-y-2 text-xs leading-relaxed font-sans">
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const match = part.match(/^```([\w-]*)\n([\s\S]*?)```$/);
                    const lang = match ? match[1] : '';
                    const code = match ? match[2] : part.slice(3, -3);

                    return (
                        <div key={index} className="my-2 bg-black/50 rounded-lg border border-slate-800 overflow-hidden group relative">
                            <div className="bg-slate-900/50 px-3 py-1 flex items-center justify-between border-b border-slate-800">
                                <span className="text-[10px] font-mono text-slate-500">{lang}</span>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(code)}
                                    className="text-slate-500 hover:text-white transition-colors"
                                    title="Copy"
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="p-3 overflow-x-auto custom-scrollbar">
                                <pre className="font-mono text-[10px] text-blue-100 whitespace-pre">{code}</pre>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div key={index} className="whitespace-pre-wrap">
                            {part.split('\n').map((line, lineIdx) => {
                                const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                                const cleanLine = isBullet ? line.trim().substring(2) : line;
                                const formatText = (text: string) => {
                                    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
                                    return parts.map((p, i) => {
                                        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-bold text-blue-200">{p.slice(2, -2)}</strong>;
                                        if (p.startsWith('*') && p.endsWith('*')) return <em key={i} className="italic text-slate-400">{p.slice(1, -1)}</em>;
                                        if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="bg-slate-800 px-1 py-0.5 rounded text-[10px] font-mono text-yellow-300">{p.slice(1, -1)}</code>;
                                        return p;
                                    });
                                };
                                return (
                                    <div key={lineIdx} className={`${isBullet ? 'flex items-start ml-2 mb-1' : 'mb-1'}`}>
                                        {isBullet && <span className="mr-2 text-slate-500 mt-1">•</span>}
                                        <span>{formatText(cleanLine)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }
            })}
        </div>
    );
};

const DiffView: React.FC<{ files: ProjectFile[]; oldFiles: ProjectFile[] }> = ({ files, oldFiles }) => {
    const changes = files.filter(f => {
        const old = oldFiles.find(of => of.name === f.name);
        return !old || old.content !== f.content;
    });

    if (changes.length === 0) return null;

    return (
        <div className="mt-3 mb-3 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
            <div className="bg-slate-900 px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-800 flex items-center">
                <ArrowLeftRight className="w-3 h-3 mr-2 text-blue-500" /> Modified Files ({changes.length})
            </div>
            <div className="max-h-32 overflow-y-auto custom-scrollbar">
                {changes.map(f => (
                    <div key={f.name} className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50 last:border-0 hover:bg-slate-900/50">
                        <div className="flex items-center text-xs text-blue-300">
                            <FileCode className="w-3 h-3 mr-2 opacity-50" />
                            {f.name}
                        </div>
                        <span className="text-[10px] text-green-500 font-mono">+Modified</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

class Shell {
    private cwd = '/';
    constructor(
        private term: any, 
        private files: ProjectFile[], 
        private setFiles: (f: ProjectFile[]) => void,
        private onNpmInstall: (pkg: string) => void
    ) {}

    prompt() {
        this.term.write(`\r\n\x1b[1;32mzee@builder\x1b[0m:\x1b[1;34m${this.cwd}\x1b[0m$ `);
    }

    log(msg: string) {
        this.term.writeln(msg);
        this.prompt();
    }

    async handleCommand(cmd: string) {
        const parts = cmd.trim().split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1);

        switch (command) {
            case 'clear': this.term.clear(); break;
            case 'ls':
                const uniquePaths = new Set(this.files.map(f => f.name.split('/')[0]));
                uniquePaths.forEach(p => this.term.writeln(p));
                break;
            case 'tree':
                this.term.writeln('.');
                const sortedFiles = [...this.files].sort((a, b) => a.name.localeCompare(b.name));
                sortedFiles.forEach((f, i) => {
                    const parts = f.name.split('/');
                    const prefix = i === sortedFiles.length - 1 ? '└── ' : '├── ';
                    this.term.writeln(`${prefix}${parts.join('/')}`);
                });
                break;
            case 'cat':
                if (args[0]) {
                    const f = this.files.find(file => file.name === args[0] || file.name === `src/${args[0]}`);
                    if (f) this.term.writeln(f.content.replace(/\n/g, '\r\n'));
                    else this.term.writeln(`cat: ${args[0]}: No such file`);
                }
                break;
            case 'npm':
                if (args[0] === 'install' || args[0] === 'i') {
                    if (args[1]) {
                        const pkg = args[1];
                        // Simulate npm install with progress
                        this.term.writeln('');
                        this.term.writeln(`\x1b[90mnpm\x1b[0m \x1b[32minfo\x1b[0m using npm@10.2.0`);
                        this.term.writeln(`\x1b[90mnpm\x1b[0m \x1b[32minfo\x1b[0m using node@v20.9.0`);
                        
                        setTimeout(() => {
                            this.term.writeln(`\x1b[90mnpm\x1b[0m \x1b[32mhttp\x1b[0m fetch GET 200 https://registry.npmjs.org/${pkg} 125ms`);
                        }, 300);
                        
                        setTimeout(() => {
                            this.term.writeln(`\x1b[90mnpm\x1b[0m \x1b[32mhttp\x1b[0m fetch GET 200 https://registry.npmjs.org/${pkg}/-/${pkg}-1.0.0.tgz 89ms`);
                        }, 600);
                        
                        setTimeout(() => {
                            this.term.writeln('');
                            this.term.writeln(`\x1b[32madded\x1b[0m 1 package, and audited 2 packages in 1s`);
                        }, 1000);
                        
                        setTimeout(() => {
                            this.term.writeln('');
                            this.term.writeln(`\x1b[1mfound\x1b[0m \x1b[32m0 vulnerabilities\x1b[0m`);
                            this.onNpmInstall(pkg);
                            this.prompt();
                        }, 1200);
                        return; // Don't call prompt() below, we'll do it in setTimeout
                    } else {
                        this.term.writeln(`npm ERR! Missing package name.`);
                    }
                }
                break;
            case 'node':
                 if (args[0]) {
                     const jsFile = this.files.find(f => f.name === args[0] || f.name.endsWith(args[0]));
                     if (jsFile) {
                         this.term.writeln(`\x1b[32m> node ${args[0]}\x1b[0m`);
                         try {
                             // Execute JS file and capture console.log output
                             const logs: string[] = [];
                             const mockConsole = { log: (...a: any[]) => logs.push(a.map(String).join(' ')) };
                             const fn = new Function('console', jsFile.content);
                             fn(mockConsole);
                             logs.forEach(l => this.term.writeln(l));
                         } catch (e: any) {
                             this.term.writeln(`\x1b[31mError: ${e.message}\x1b[0m`);
                         }
                     } else {
                         this.term.writeln(`\x1b[31mError: Cannot find module '${args[0]}'\x1b[0m`);
                     }
                 } else {
                     this.term.writeln(`\x1b[32mWelcome to Node.js v20.9.0\x1b[0m`);
                     this.term.writeln(`Type ".help" for more information.`);
                     this.term.writeln(`\x1b[90m> \x1b[0m`);
                 }
                 break;
            case 'python':
                 this.term.writeln(`\x1b[33mPython Runtime (Simulated)...\x1b[0m`);
                 if (args[0]) this.term.writeln(`Executing ${args[0]}...`);
                 break;
            case 'help': this.term.writeln('Commands: ls, tree, cat <file>, npm install <pkg>, node, python, clear'); break;
            case '': break;
            default: this.term.writeln(`bash: ${command}: command not found`);
        }
        this.prompt();
    }
    
    updateFiles(newFiles: ProjectFile[]) { this.files = newFiles; }
}

// Enhanced FileTreeNode with rename and delete capabilities
const FileTreeNode: React.FC<{ 
    node: TreeNode; 
    level: number; 
    activeFile: string; 
    onSelect: (path: string) => void;
    onRename?: (oldPath: string, newPath: string) => void;
    onDelete?: (path: string) => void;
}> = ({ node, level, activeFile, onSelect, onRename, onDelete }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(node.name);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const isFile = node.type === 'file';
    const isActive = isFile && activeFile === node.path;

    const handleRename = () => {
        if (editName.trim() && editName !== node.name && onRename) {
            const pathParts = node.path.split('/');
            pathParts[pathParts.length - 1] = editName.trim();
            const newPath = pathParts.join('/');
            onRename(node.path, newPath);
        }
        setIsEditing(false);
    };

    return (
        <div className="relative group">
            <div
                className={`w-full flex items-center px-2 py-1.5 text-xs rounded-md transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                <button
                    onClick={() => isFile ? onSelect(node.path) : setIsOpen(!isOpen)}
                    className="flex items-center flex-1 min-w-0"
                >
                    <span className="mr-1.5 opacity-70 shrink-0">
                        {isFile ? (
                            node.name.endsWith('.css') ? <CodeIcon className="w-3.5 h-3.5 text-blue-400" /> :
                            node.name.match(/\.(ts|tsx)$/) ? <FileType className="w-3.5 h-3.5 text-blue-300" /> :
                            node.name.endsWith('.json') ? <Database className="w-3.5 h-3.5 text-yellow-500" /> :
                            node.name.endsWith('.py') ? <TerminalIcon className="w-3.5 h-3.5 text-yellow-400" /> :
                            node.name.match(/\.(png|jpg|jpeg|svg|gif)$/) ? <Image className="w-3.5 h-3.5 text-purple-400" /> :
                            <File className="w-3.5 h-3.5" />
                        ) : (isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
                    </span>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsEditing(false); }}
                            className="flex-1 bg-slate-900 border border-blue-500 rounded px-1 text-white text-xs font-mono focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className="truncate font-mono">{node.name}</span>
                    )}
                </button>
                {isFile && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setEditName(node.name); setIsEditing(true); }}
                            className="p-0.5 hover:bg-slate-700 rounded"
                            title="Rename"
                        >
                            <Edit className="w-3 h-3" />
                        </button>
                        {onDelete && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(node.path); }}
                                className="p-0.5 hover:bg-red-900/50 rounded text-red-400"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                )}
            </div>
            {!isFile && isOpen && node.children && (
                <div>
                    {node.children.map(child => (
                        <FileTreeNode 
                            key={child.path} 
                            node={child} 
                            level={level + 1} 
                            activeFile={activeFile} 
                            onSelect={onSelect}
                            onRename={onRename}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Builder: React.FC<BuilderProps> = ({ user, initialPrompt }) => {
    const [stack, setStack] = useState<Stack>('react');
    const [isWizardOpen, setIsWizardOpen] = useState(true);
    
    const [sidebarTab, setSidebarTab] = useState<'files' | 'git' | 'db' | 'pkg' | 'snaps' | 'code' | 'term' | 'services'>('files');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [rightPanelTab, setRightPanelTab] = useState<'chat' | 'preview'>('chat');
    const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
    const [mobileCodeView, setMobileCodeView] = useState(false);
    const [terminalCmd, setTerminalCmd] = useState('');
    const [terminalOutput, setTerminalOutput] = useState<string[]>(['ZeeBuilder Shell v1.0', 'Type commands below or use quick buttons.']);
    
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [activeFile, setActiveFile] = useState<string>('');
    const [projectName, setProjectName] = useState('Untitled Project');
    const [showProjectModal, setShowProjectModal] = useState(false);
    
    const [historyStack, setHistoryStack] = useState<ProjectFile[][]>([]);
    const [redoStack, setRedoStack] = useState<ProjectFile[][]>([]);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

    const [messages, setMessages] = useState<BuilderChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatAttachment, setChatAttachment] = useState<FileAttachment | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('');
    const [completedFiles, setCompletedFiles] = useState<string[]>([]);
    const [pendingFiles, setPendingFiles] = useState<string[]>([]);
    const [savedServiceConfigs, setSavedServiceConfigs] = useState<Record<string, ServiceConfig>>({});
    const [newServiceType, setNewServiceType] = useState<string>('stripe');
    const [newServiceConfig, setNewServiceConfig] = useState<any>({});
    const [serviceCategory, setServiceCategory] = useState<'api' | 'integration'>('api');
    const [isSyncing, setIsSyncing] = useState(false);
    const progressStatusRef = useRef<NodeJS.Timeout | null>(null);
    const [model, setModel] = useState(ModelType.FLASH);
    const [useSearch, setUseSearch] = useState(true); // Enable search by default for up-to-date tools/libraries
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
    const [showPermissionHelp, setShowPermissionHelp] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const [ghToken, setGhToken] = useState('');
    const [ghUser, setGhUser] = useState<any>(null);
    const [ghOctokit, setGhOctokit] = useState<any>(null);
    const [ghRepos, setGhRepos] = useState<any[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<{owner: string, name: string} | null>(null);
    const [ghLoading, setGhLoading] = useState(false);
    const [ghStatus, setGhStatus] = useState<string>('');
    const [dependencies, setDependencies] = useState<{[key: string]: string}>({});
    const [dbConfigs, setDbConfigs] = useState<DatabaseConfig[]>([]);
    const [newDbType, setNewDbType] = useState<'firebase' | 'supabase' | 'neon' | 'appwrite' | 'vercel'>('supabase');
    const [newDbConfig, setNewDbConfig] = useState<any>({});
    const [newPackage, setNewPackage] = useState('');

    useEffect(() => {
        if (initialPrompt) {
            setChatInput(initialPrompt);
            setRightPanelTab('chat');
            setIsWizardOpen(false);
        }
    }, [initialPrompt]);

    // All available services - API services (require keys) and Integrations (no keys)
    const ALL_SERVICES = {
        api: [
            // Payments
            { id: 'stripe', name: 'Stripe', category: 'Payments', color: 'bg-purple-600', fields: ['apiKey', 'secretKey'] },
            { id: 'paystack', name: 'Paystack', category: 'Payments', color: 'bg-cyan-500', fields: ['apiKey', 'secretKey'] },
            { id: 'flutterwave', name: 'Flutterwave', category: 'Payments', color: 'bg-orange-500', fields: ['apiKey', 'secretKey'] },
            { id: 'opay', name: 'OPay', category: 'Payments', color: 'bg-green-500', fields: ['apiKey', 'secretKey'] },
            { id: 'paypal', name: 'PayPal', category: 'Payments', color: 'bg-blue-600', fields: ['clientId', 'clientSecret'] },
            { id: 'square', name: 'Square', category: 'Payments', color: 'bg-black', fields: ['accessToken'] },
            // Email
            { id: 'resend', name: 'Resend', category: 'Email', color: 'bg-gray-700', fields: ['apiKey'] },
            { id: 'sendgrid', name: 'SendGrid', category: 'Email', color: 'bg-blue-600', fields: ['apiKey'] },
            { id: 'mailgun', name: 'Mailgun', category: 'Email', color: 'bg-red-600', fields: ['apiKey', 'domain'] },
            { id: 'postmark', name: 'Postmark', category: 'Email', color: 'bg-yellow-500', fields: ['apiKey'] },
            // SMS
            { id: 'twilio', name: 'Twilio', category: 'SMS', color: 'bg-red-500', fields: ['accountSid', 'authToken', 'phoneNumber'] },
            { id: 'vonage', name: 'Vonage', category: 'SMS', color: 'bg-purple-500', fields: ['apiKey', 'apiSecret'] },
            { id: 'africastalking', name: 'Africa\'s Talking', category: 'SMS', color: 'bg-orange-600', fields: ['apiKey', 'username'] },
            // AI
            { id: 'openai', name: 'OpenAI', category: 'AI', color: 'bg-green-600', fields: ['apiKey'] },
            { id: 'anthropic', name: 'Claude', category: 'AI', color: 'bg-orange-400', fields: ['apiKey'] },
            { id: 'replicate', name: 'Replicate', category: 'AI', color: 'bg-gray-800', fields: ['apiKey'] },
            { id: 'huggingface', name: 'Hugging Face', category: 'AI', color: 'bg-yellow-400', fields: ['apiKey'] },
            // Storage
            { id: 'cloudinary', name: 'Cloudinary', category: 'Storage', color: 'bg-blue-400', fields: ['cloudName', 'apiKey', 'apiSecret'] },
            { id: 'uploadthing', name: 'UploadThing', category: 'Storage', color: 'bg-red-500', fields: ['secret'] },
            { id: 'aws-s3', name: 'AWS S3', category: 'Storage', color: 'bg-orange-500', fields: ['accessKeyId', 'secretAccessKey', 'bucket', 'region'] },
            // Auth
            { id: 'auth0', name: 'Auth0', category: 'Auth', color: 'bg-orange-600', fields: ['domain', 'clientId', 'clientSecret'] },
            { id: 'clerk', name: 'Clerk', category: 'Auth', color: 'bg-purple-600', fields: ['publishableKey', 'secretKey'] },
            // Analytics
            { id: 'mixpanel', name: 'Mixpanel', category: 'Analytics', color: 'bg-purple-500', fields: ['token'] },
            { id: 'amplitude', name: 'Amplitude', category: 'Analytics', color: 'bg-blue-500', fields: ['apiKey'] },
            { id: 'posthog', name: 'PostHog', category: 'Analytics', color: 'bg-blue-600', fields: ['apiKey', 'host'] },
            // Maps
            { id: 'google-maps', name: 'Google Maps', category: 'Maps', color: 'bg-green-500', fields: ['apiKey'] },
            { id: 'mapbox', name: 'Mapbox', category: 'Maps', color: 'bg-blue-600', fields: ['accessToken'] },
        ],
        integration: [
            // UI Frameworks
            { id: 'tailwindcss', name: 'Tailwind CSS', category: 'Styling', color: 'bg-cyan-500' },
            { id: 'chakra-ui', name: 'Chakra UI', category: 'Styling', color: 'bg-teal-500' },
            { id: 'shadcn', name: 'shadcn/ui', category: 'Styling', color: 'bg-slate-700' },
            { id: 'radix-ui', name: 'Radix UI', category: 'Styling', color: 'bg-purple-600' },
            { id: 'material-ui', name: 'Material UI', category: 'Styling', color: 'bg-blue-600' },
            { id: 'ant-design', name: 'Ant Design', category: 'Styling', color: 'bg-blue-500' },
            { id: 'bootstrap', name: 'Bootstrap', category: 'Styling', color: 'bg-purple-700' },
            { id: 'daisyui', name: 'DaisyUI', category: 'Styling', color: 'bg-green-500' },
            // Animation
            { id: 'framer-motion', name: 'Framer Motion', category: 'Animation', color: 'bg-pink-500' },
            { id: 'gsap', name: 'GSAP', category: 'Animation', color: 'bg-green-600' },
            { id: 'lottie', name: 'Lottie', category: 'Animation', color: 'bg-cyan-400' },
            { id: 'animejs', name: 'Anime.js', category: 'Animation', color: 'bg-red-500' },
            // State Management
            { id: 'zustand', name: 'Zustand', category: 'State', color: 'bg-brown-500' },
            { id: 'redux', name: 'Redux Toolkit', category: 'State', color: 'bg-purple-600' },
            { id: 'jotai', name: 'Jotai', category: 'State', color: 'bg-gray-700' },
            { id: 'recoil', name: 'Recoil', category: 'State', color: 'bg-blue-500' },
            { id: 'tanstack-query', name: 'TanStack Query', category: 'State', color: 'bg-red-500' },
            // Forms
            { id: 'react-hook-form', name: 'React Hook Form', category: 'Forms', color: 'bg-pink-600' },
            { id: 'formik', name: 'Formik', category: 'Forms', color: 'bg-blue-600' },
            { id: 'zod', name: 'Zod', category: 'Forms', color: 'bg-blue-500' },
            { id: 'yup', name: 'Yup', category: 'Forms', color: 'bg-purple-500' },
            // Charts & Visualization
            { id: 'recharts', name: 'Recharts', category: 'Charts', color: 'bg-cyan-600' },
            { id: 'chartjs', name: 'Chart.js', category: 'Charts', color: 'bg-pink-500' },
            { id: 'd3', name: 'D3.js', category: 'Charts', color: 'bg-orange-500' },
            { id: 'visx', name: 'Visx', category: 'Charts', color: 'bg-green-500' },
            { id: 'nivo', name: 'Nivo', category: 'Charts', color: 'bg-yellow-500' },
            // Tables
            { id: 'tanstack-table', name: 'TanStack Table', category: 'Tables', color: 'bg-blue-600' },
            { id: 'ag-grid', name: 'AG Grid', category: 'Tables', color: 'bg-red-600' },
            // Date/Time
            { id: 'date-fns', name: 'date-fns', category: 'Date', color: 'bg-purple-500' },
            { id: 'dayjs', name: 'Day.js', category: 'Date', color: 'bg-red-400' },
            { id: 'luxon', name: 'Luxon', category: 'Date', color: 'bg-yellow-600' },
            // Rich Text
            { id: 'tiptap', name: 'Tiptap', category: 'Editor', color: 'bg-purple-600' },
            { id: 'slate', name: 'Slate', category: 'Editor', color: 'bg-gray-600' },
            { id: 'lexical', name: 'Lexical', category: 'Editor', color: 'bg-blue-600' },
            { id: 'quill', name: 'Quill', category: 'Editor', color: 'bg-yellow-500' },
            // Markdown
            { id: 'react-markdown', name: 'React Markdown', category: 'Markdown', color: 'bg-gray-700' },
            { id: 'mdx', name: 'MDX', category: 'Markdown', color: 'bg-yellow-500' },
            // Icons
            { id: 'lucide', name: 'Lucide Icons', category: 'Icons', color: 'bg-orange-500' },
            { id: 'heroicons', name: 'Heroicons', category: 'Icons', color: 'bg-indigo-500' },
            { id: 'phosphor', name: 'Phosphor', category: 'Icons', color: 'bg-green-500' },
            { id: 'tabler-icons', name: 'Tabler Icons', category: 'Icons', color: 'bg-blue-500' },
            // Testing
            { id: 'jest', name: 'Jest', category: 'Testing', color: 'bg-red-600' },
            { id: 'vitest', name: 'Vitest', category: 'Testing', color: 'bg-yellow-500' },
            { id: 'playwright', name: 'Playwright', category: 'Testing', color: 'bg-green-600' },
            { id: 'cypress', name: 'Cypress', category: 'Testing', color: 'bg-gray-800' },
            // Router
            { id: 'react-router', name: 'React Router', category: 'Router', color: 'bg-red-500' },
            { id: 'tanstack-router', name: 'TanStack Router', category: 'Router', color: 'bg-blue-500' },
            // Utilities
            { id: 'lodash', name: 'Lodash', category: 'Utils', color: 'bg-blue-700' },
            { id: 'axios', name: 'Axios', category: 'Utils', color: 'bg-purple-600' },
            { id: 'swr', name: 'SWR', category: 'Utils', color: 'bg-black' },
            { id: 'immer', name: 'Immer', category: 'Utils', color: 'bg-teal-600' },
            { id: 'uuid', name: 'UUID', category: 'Utils', color: 'bg-gray-600' },
            // Drag & Drop
            { id: 'dnd-kit', name: 'dnd kit', category: 'DnD', color: 'bg-indigo-600' },
            { id: 'react-beautiful-dnd', name: 'react-beautiful-dnd', category: 'DnD', color: 'bg-blue-500' },
            // PDF
            { id: 'react-pdf', name: 'React PDF', category: 'PDF', color: 'bg-red-600' },
            { id: 'pdfmake', name: 'PDFMake', category: 'PDF', color: 'bg-green-600' },
            // Export
            { id: 'xlsx', name: 'SheetJS', category: 'Export', color: 'bg-green-700' },
            { id: 'papaparse', name: 'PapaParse', category: 'Export', color: 'bg-blue-500' },
            // Notifications
            { id: 'react-hot-toast', name: 'React Hot Toast', category: 'Toast', color: 'bg-orange-500' },
            { id: 'sonner', name: 'Sonner', category: 'Toast', color: 'bg-gray-700' },
            { id: 'react-toastify', name: 'React Toastify', category: 'Toast', color: 'bg-yellow-500' },
            // Carousel
            { id: 'swiper', name: 'Swiper', category: 'Carousel', color: 'bg-blue-600' },
            { id: 'embla', name: 'Embla Carousel', category: 'Carousel', color: 'bg-purple-500' },
            // Video
            { id: 'react-player', name: 'React Player', category: 'Media', color: 'bg-red-500' },
            { id: 'vidstack', name: 'Vidstack', category: 'Media', color: 'bg-purple-600' },
            // SEO
            { id: 'react-helmet', name: 'React Helmet', category: 'SEO', color: 'bg-gray-600' },
            // Internationalization
            { id: 'i18next', name: 'i18next', category: 'i18n', color: 'bg-blue-600' },
            { id: 'react-intl', name: 'React Intl', category: 'i18n', color: 'bg-green-500' },
        ]
    };

    const [iframeSrc, setIframeSrc] = useState('');
    const [previewKey, setPreviewKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    
    // Python runtime state
    const [pythonOutput, setPythonOutput] = useState<string[]>([]);
    const [isPythonRunning, setIsPythonRunning] = useState(false);
    const [pyodideReady, setPyodideReady] = useState(false);
    const pyodideRef = useRef<any>(null);
    
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<any>(null);
    const shellRef = useRef<Shell | null>(null);
    const fitAddonRef = useRef<any>(null);

    // Helper function to get user-specific storage key
    const getProjectsKey = () => user ? `zee_projects_${user.email}` : 'zee_projects_guest';

    useEffect(() => {
        const storedProjects = localStorage.getItem(getProjectsKey());
        if (storedProjects) {
            const parsed = JSON.parse(storedProjects);
            setSavedProjects(parsed);
            
            // Check if coming from Integrations with a specific project target
            const integrationTarget = localStorage.getItem('zee_integration_target');
            const lastId = integrationTarget || localStorage.getItem('zee_active_project_id');
            
            if (lastId) {
                const lastProj = parsed.find((p: SavedProject) => p.id === lastId);
                if (lastProj) {
                    loadProject(lastProj);
                    
                    // If this was an integration target, clear it and process the pending prompt
                    if (integrationTarget) {
                        localStorage.removeItem('zee_integration_target');
                        // The pending prompt will be handled by the existing prompt handler
                    }
                }
            }
            
            // Check if creating new project with integration
            const newWithIntegration = localStorage.getItem('zee_create_new_with_integration');
            if (newWithIntegration) {
                localStorage.removeItem('zee_create_new_with_integration');
                setIsWizardOpen(true);
                // Pending prompt is already set
            }
        }
        
        // Load saved service configurations from cloud (with localStorage fallback)
        cloudStorage.loadServiceConfigs().then(configs => {
            setSavedServiceConfigs(configs);
        }).catch(e => {
            console.error('Failed to load service configs:', e);
            // Fallback to localStorage
            const savedServices = localStorage.getItem('zee_service_configs');
            if (savedServices) {
                try {
                    setSavedServiceConfigs(JSON.parse(savedServices));
                } catch (e) {
                    console.error('Failed to parse saved service configs');
                }
            }
        });
        
        // Check for saved GitHub token (from OAuth login)
        const savedGhToken = localStorage.getItem('zee_github_token');
        if (savedGhToken) {
            setGhToken(savedGhToken);
            connectGitHub(savedGhToken);
        }
    }, [user]);

    useEffect(() => {
        if (currentProjectId) {
            const p: SavedProject = {
                id: currentProjectId, name: projectName, stack, files, lastModified: Date.now(), dbConfigs, messages, snapshots
            };
            setSavedProjects(prev => {
                const idx = prev.findIndex(sp => sp.id === currentProjectId);
                const newArr = [...prev];
                if (idx >= 0) newArr[idx] = p;
                else newArr.push(p);
                localStorage.setItem(getProjectsKey(), JSON.stringify(newArr));
                return newArr;
            });
            localStorage.setItem('zee_active_project_id', currentProjectId);
            if (shellRef.current) shellRef.current.updateFiles(files);
            
            const pkg = files.find(f => f.name === 'package.json');
            if (pkg) {
                try { setDependencies(JSON.parse(pkg.content).dependencies || {}); } catch(e) {}
            }
        }
    }, [files, messages, dbConfigs, projectName, stack, currentProjectId, snapshots, user]);

    useLayoutEffect(() => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max

        const initTerminal = () => {
            if (terminalRef.current && !xtermRef.current) {
                const Terminal = (window as any).Terminal;
                const FitAddon = (window as any).FitAddon?.FitAddon;
                
                if (Terminal && FitAddon) {
                    const term = new Terminal({
                        cursorBlink: true, 
                        theme: { background: '#000000', foreground: '#f8fafc', cursor: '#3b82f6' },
                        fontFamily: 'monospace', fontSize: 13, rows: 12, 
                        convertEol: true
                    });
                    const fitAddon = new FitAddon();
                    term.loadAddon(fitAddon);
                    term.open(terminalRef.current);
                    
                    xtermRef.current = term;
                    fitAddonRef.current = fitAddon;
                    
                    const shell = new Shell(term, files, setFiles, handleAddPackage);
                    shellRef.current = shell;
                    shell.prompt();
                    
                    term.onData((key: string) => {
                        if (key.charCodeAt(0) === 13) { shell.handleCommand(shell['buffer'] || ''); (shell as any)['buffer'] = ""; }
                        else if (key.charCodeAt(0) === 127) { 
                             if ((shell as any)['buffer']?.length > 0) { (shell as any)['buffer'] = (shell as any)['buffer'].slice(0, -1); term.write('\b \b'); }
                        } else { (shell as any)['buffer'] = ((shell as any)['buffer']||"") + key; term.write(key); }
                    });

                    term.write('Welcome to Zee Terminal.\r\n');
                    shell.prompt();
                    try { fitAddon.fit(); } catch (e) {}
                    return true;
                }
            }
            return false;
        };

        const poll = setInterval(() => {
            attempts++;
            if (initTerminal() || attempts >= maxAttempts) {
                clearInterval(poll);
            }
        }, 100);

        return () => clearInterval(poll);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            if (fitAddonRef.current && isTerminalOpen && terminalRef.current) {
                try { fitAddonRef.current.fit(); } catch(e){}
            }
        }, 50);
        return () => clearTimeout(t);
    }, [isTerminalOpen, isSidebarCollapsed, window.innerWidth]);

    useEffect(() => {
        if (files.length > 0 && (rightPanelTab === 'preview' || isFullScreenPreview)) {
            const t = setTimeout(updateWebPreview, 800);
            return () => clearTimeout(t);
        }
    }, [files, rightPanelTab, isFullScreenPreview]);

    useEffect(() => { 
        // Scroll within the messages container only, not the whole page
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const initProject = (type: Stack) => {
        setStack(type);
        setProjectName(`New ${type.toUpperCase()} App`);
        const newId = Date.now().toString();
        setCurrentProjectId(newId);
        setMessages([{ id: 'init', role: 'model', text: `Initialized ${type} project.`, timestamp: Date.now() }]);
        let initialFiles: ProjectFile[] = [];
        
        const pkgJson = { name: "app", version: "1.0.0", dependencies: { "react": "^19.2.1", "react-dom": "^19.2.1", "lucide-react": "latest" } };
        const tsConfig = { compilerOptions: { jsx: "react-jsx", target: "ES2020", moduleResolution: "node", esModuleInterop: true, strict: true } };

        if (type === 'react' || type === 'react-ts') {
            const isTs = type === 'react-ts';
            const ext = isTs ? 'tsx' : 'jsx';
            initialFiles = [
                { name: 'package.json', content: JSON.stringify(pkgJson, null, 2), language: 'json' },
                { name: 'index.html', content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zee App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`, language: 'html' },
                { name: 'index.css', content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`, language: 'css' },
                { name: `App.${ext}`, content: `import React from 'react';
import { Sparkles } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
      <Sparkles className="w-12 h-12 text-blue-500 mb-4" />
      <h1 className="text-3xl font-bold">Zee Builder</h1>
      <p className="text-slate-400">Start editing to see magic happen.</p>
    </div>
  );
}`, language: isTs ? 'typescript' : 'javascript' },
                { name: `index.${ext}`, content: isTs 
                    ? `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nconst root = ReactDOM.createRoot(document.getElementById('root')!);\nroot.render(<App />);`
                    : `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);`, language: isTs ? 'typescript' : 'javascript' }
            ];
            if(isTs) initialFiles.push({ name: 'tsconfig.json', content: JSON.stringify(tsConfig,null,2), language: 'json' });
            setActiveFile(`App.${ext}`);
        } else if (type === 'flutter') {
             initialFiles = [{ name: 'lib/main.dart', content: `import 'package:flutter/material.dart';\nvoid main() => runApp(const MyApp());\nclass MyApp extends StatelessWidget {\n  const MyApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      home: Scaffold(\n        appBar: AppBar(title: const Text('Zee Flutter')),\n        body: const Center(child: Text('Hello World')),\n      ),\n    );\n  }\n}`, language: 'dart' }];
             setActiveFile('lib/main.dart');
        } else if (type === 'vue') {
            initialFiles = [{ 
                name: 'index.html', 
                content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue App</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 min-h-screen">
  <div id="app" class="min-h-screen flex flex-col items-center justify-center">
    <div class="text-center">
      <svg class="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      <h1 class="text-3xl font-bold text-white mb-2">{{ title }}</h1>
      <p class="text-slate-400 mb-6">{{ description }}</p>
      <button @click="count++" class="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition">
        Count: {{ count }}
      </button>
    </div>
  </div>
  <script>
    const { createApp, ref } = Vue;
    
    createApp({
      setup() {
        const title = ref('Zee Vue Builder');
        const description = ref('Start editing to see your changes live.');
        const count = ref(0);
        
        return { title, description, count };
      }
    }).mount('#app');
  </script>
</body>
</html>`, 
                language: 'html' 
            }];
            setActiveFile('index.html');
        } else if (type === 'python') {
             initialFiles = [
                 { name: 'main.py', content: `# Welcome to Zee Python Builder!
# Click "Run Code" in the preview to execute this file

def greet(name):
    """A simple greeting function"""
    return f"Hello, {name}! 🐍"

def fibonacci(n):
    """Generate Fibonacci sequence up to n terms"""
    sequence = []
    a, b = 0, 1
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence

# Main execution
if __name__ == "__main__":
    print("=" * 40)
    print(greet("Zee Builder"))
    print("=" * 40)
    print()
    
    # Fibonacci sequence
    n = 10
    print(f"First {n} Fibonacci numbers:")
    print(fibonacci(n))
    print()
    
    # Simple list comprehension
    squares = [x**2 for x in range(1, 6)]
    print(f"Squares of 1-5: {squares}")
    print()
    
    # Dictionary example
    fruits = {"apple": "🍎", "banana": "🍌", "cherry": "🍒"}
    for fruit, emoji in fruits.items():
        print(f"{fruit}: {emoji}")
`, language: 'python' },
                 { name: 'requirements.txt', content: `# Add Python packages here
# numpy
# pandas
# matplotlib`, language: 'markdown' }
             ];
             setActiveFile('main.py');
        } else if (type === 'nextjs') {
            const nextPkgJson = { name: "nextjs-app", version: "1.0.0", scripts: { dev: "next dev", build: "next build", start: "next start" }, dependencies: { "next": "^15.0.0", "react": "^19.2.1", "react-dom": "^19.2.1" } };
            initialFiles = [
                { name: 'package.json', content: JSON.stringify(nextPkgJson, null, 2), language: 'json' },
                { name: 'app/page.tsx', content: `export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Next.js</h1>
        <p className="text-slate-400 mb-6">Built with Zee Builder</p>
        <div className="flex gap-4 justify-center">
          <a href="https://nextjs.org/docs" className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition">
            Documentation
          </a>
        </div>
      </div>
    </main>
  );
}`, language: 'typescript' },
                { name: 'app/layout.tsx', content: `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`, language: 'typescript' },
                { name: 'app/globals.css', content: `@tailwind base;
@tailwind components;
@tailwind utilities;`, language: 'css' }
            ];
            setActiveFile('app/page.tsx');
        } else if (type === 'html') {
            initialFiles = [
                { name: 'index.html', content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 min-h-screen flex items-center justify-center">
    <div class="text-center">
        <h1 class="text-4xl font-bold text-white mb-4">Hello World</h1>
        <p class="text-slate-400">Built with Zee Builder</p>
    </div>
    <script src="app.js"></script>
</body>
</html>`, language: 'html' },
                { name: 'app.js', content: `// Your JavaScript code here
console.log('Hello from Zee Builder!');`, language: 'javascript' },
                { name: 'styles.css', content: `/* Custom styles */
body {
    font-family: system-ui, -apple-system, sans-serif;
}`, language: 'css' }
            ];
            setActiveFile('index.html');
        } else {
            initialFiles = [{ name: 'index.html', content: '<html><body><h1>Hello World</h1></body></html>', language: 'html'}];
            setActiveFile('index.html');
        }

        setFiles(initialFiles);
        setHistoryStack([]);
        setRedoStack([]);
        setSnapshots([]);
        setIsWizardOpen(false);
    };

    const loadProject = (p: SavedProject) => {
        setCurrentProjectId(p.id);
        setProjectName(p.name);
        setStack(p.stack);
        setFiles(p.files);
        setDbConfigs(p.dbConfigs || []);
        setMessages(p.messages || []);
        setSnapshots(p.snapshots || []);
        setActiveFile(p.files[0]?.name || '');
        setIsWizardOpen(false);
        setShowProjectModal(false);
    };

    const deleteProject = async (id: string) => {
        const project = savedProjects.find(p => p.id === id);
        const projectName = project?.name || 'this project';
        
        const confirmed = await alert.confirm({
            title: "Delete Project?",
            text: `Are you sure you want to delete "${projectName}"? This action cannot be undone.`,
            icon: 'warning',
            confirmText: "Delete",
            isDanger: true
        });
        
        if (confirmed) {
            const newProjects = savedProjects.filter(p => p.id !== id);
            setSavedProjects(newProjects);
            localStorage.setItem(getProjectsKey(), JSON.stringify(newProjects));
            if (currentProjectId === id) {
                setCurrentProjectId(null);
                setIsWizardOpen(true);
            }
            alert.success("Deleted!", `"${projectName}" has been deleted.`);
        }
    };

    const createSnapshot = async () => {
        const name = await alert.prompt({
            title: "Create Checkpoint",
            text: "Name this checkpoint:",
            inputValue: `Snapshot ${snapshots.length + 1}`,
            confirmText: "Create"
        });
        if (!name) return;
        const newSnapshot: Snapshot = {
            id: Date.now().toString(),
            name,
            timestamp: Date.now(),
            files: JSON.parse(JSON.stringify(files)) // Deep copy
        };
        setSnapshots([...snapshots, newSnapshot]);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `📍 Checkpoint created: **${name}**`, timestamp: Date.now() }]);
    };

    const restoreSnapshot = async (snapshot: Snapshot) => {
        const confirmed = await alert.confirm({
            title: "Restore Checkpoint?",
            text: `Restore to "${snapshot.name}"? Current unsaved changes will be lost.`,
            icon: 'warning',
            confirmText: "Restore",
            isDanger: true
        });
        
        if (confirmed) {
            setHistoryStack(prev => [...prev, files]);
            setFiles(JSON.parse(JSON.stringify(snapshot.files)));
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `↺ Restored checkpoint: **${snapshot.name}**`, timestamp: Date.now() }]);
            alert.success("Restored!", `Checkpoint "${snapshot.name}" has been restored.`);
        }
    };

    // File Management Functions
    const handleRenameFile = (oldPath: string, newPath: string) => {
        setFiles(prevFiles => prevFiles.map(f => 
            f.name === oldPath ? { ...f, name: newPath } : f
        ));
        // If the renamed file was active, update activeFile
        if (activeFile === oldPath) {
            setActiveFile(newPath);
        }
    };

    const handleDeleteFile = async (path: string) => {
        const confirmed = await alert.confirm({
            title: "Delete File?",
            text: `Delete "${path}"? This cannot be undone.`,
            icon: 'warning',
            confirmText: "Delete",
            isDanger: true
        });
        
        if (confirmed) {
            setFiles(prevFiles => prevFiles.filter(f => f.name !== path));
            if (activeFile === path) {
                const remaining = files.filter(f => f.name !== path);
                if (remaining.length > 0) {
                    setActiveFile(remaining[0].name);
                }
            }
        }
    };

    // Python Runtime Functions
    const initPyodide = async () => {
        if (pyodideRef.current) return pyodideRef.current;
        
        try {
            setPythonOutput(prev => [...prev, '🐍 Initializing Python runtime...']);
            // Load Pyodide from CDN
            const pyodide = await (window as any).loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
                stdout: (text: string) => {
                    setPythonOutput(prev => [...prev, text]);
                },
                stderr: (text: string) => {
                    setPythonOutput(prev => [...prev, `❌ ${text}`]);
                }
            });
            pyodideRef.current = pyodide;
            setPyodideReady(true);
            setPythonOutput(prev => [...prev, '✅ Python runtime ready!', '']);
            return pyodide;
        } catch (e: any) {
            setPythonOutput(prev => [...prev, `❌ Failed to initialize runtime: ${e.message}`]);
            return null;
        }
    };

    const runPythonCode = async () => {
        setIsPythonRunning(true);
        setPythonOutput(['--- Running Python ---', '']);
        
        try {
            const pyodide = await initPyodide();
            if (!pyodide) {
                setIsPythonRunning(false);
                return;
            }
            
            // Get main Python file content
            const mainPy = files.find(f => f.name.endsWith('.py'));
            if (!mainPy) {
                setPythonOutput(prev => [...prev, '❌ No Python file found']);
                setIsPythonRunning(false);
                return;
            }
            
            // Install any packages from requirements.txt
            const reqFile = files.find(f => f.name === 'requirements.txt');
            if (reqFile && reqFile.content.trim()) {
                const packages = reqFile.content.split('\n').filter(p => p.trim() && !p.startsWith('#'));
                if (packages.length > 0) {
                    setPythonOutput(prev => [...prev, `📦 Installing packages: ${packages.join(', ')}...`]);
                    await pyodide.loadPackagesFromImports(mainPy.content);
                }
            }
            
            // Run the code
            setPythonOutput(prev => [...prev, `▶️ Running ${mainPy.name}...`, '']);
            await pyodide.runPythonAsync(mainPy.content);
            setPythonOutput(prev => [...prev, '', '✅ Execution complete']);
        } catch (e: any) {
            setPythonOutput(prev => [...prev, `❌ Error: ${e.message}`]);
        } finally {
            setIsPythonRunning(false);
        }
    };

    // GitHub Integration Functions
    const connectGitHub = async (token: string) => {
        if (!token) return;
        setGhLoading(true);
        setGhStatus('Connecting...');
        try {
            const { octokit, user } = await githubService.connect(token);
            setGhOctokit(octokit);
            setGhUser(user);
            localStorage.setItem('zee_github_token', token);
            
            // Fetch repos
            setGhStatus('Fetching repositories...');
            const repos = await githubService.getUserRepos(octokit);
            setGhRepos(repos);
            setGhStatus('');
        } catch (e: any) {
            setGhStatus('');
            alertService.error('Connection Failed', e.message);
        } finally {
            setGhLoading(false);
        }
    };

    const disconnectGitHub = () => {
        setGhToken('');
        setGhUser(null);
        setGhOctokit(null);
        setGhRepos([]);
        setSelectedRepo(null);
        localStorage.removeItem('zee_github_token');
    };

    const cloneRepo = async (owner: string, name: string) => {
        if (!ghOctokit) return;
        setGhLoading(true);
        setGhStatus(`Cloning ${owner}/${name}...`);
        try {
            const repoFiles = await githubService.getRepoFiles(ghOctokit, owner, name);
            if (repoFiles.length > 0) {
                // Detect stack from files
                let detectedStack: Stack = 'react';
                if (repoFiles.some((f: any) => f.name.includes('next.config'))) detectedStack = 'nextjs';
                else if (repoFiles.some((f: any) => f.name.includes('package.json'))) detectedStack = 'react';
                if (repoFiles.some((f: any) => f.name.endsWith('.py'))) detectedStack = 'python';
                if (repoFiles.some((f: any) => f.name.endsWith('.dart'))) detectedStack = 'flutter';
                
                // Create new project from repo
                const newId = Date.now().toString();
                setCurrentProjectId(newId);
                setProjectName(name);
                setStack(detectedStack);
                setFiles(repoFiles);
                setSelectedRepo({ owner, name });
                setActiveFile(repoFiles[0]?.name || '');
                setHistoryStack([]);
                setRedoStack([]);
                setSnapshots([]);
                setIsWizardOpen(false);
                
                setMessages([{ 
                    id: 'clone', 
                    role: 'model', 
                    text: `✅ Cloned **${owner}/${name}** (${repoFiles.length} files). Ready to edit!`, 
                    timestamp: Date.now() 
                }]);
            }
            setGhStatus('');
        } catch (e: any) {
            setGhStatus('');
            alertService.error('Clone Failed', e.message);
        } finally {
            setGhLoading(false);
        }
    };

    const pushToRepo = async () => {
        if (!ghOctokit || !selectedRepo) {
            alertService.warning('No Repository', 'Please select a repository first.');
            return;
        }
        setGhLoading(true);
        setGhStatus('Pushing files...');
        try {
            const commitMessage = prompt('Commit message:', `Update from Zee Builder - ${new Date().toLocaleString()}`);
            if (!commitMessage) {
                setGhLoading(false);
                setGhStatus('');
                return;
            }
            
            for (const file of files) {
                if (file.language === 'image') continue; // Skip base64 images
                setGhStatus(`Pushing ${file.name}...`);
                await githubService.pushFile(ghOctokit, selectedRepo.owner, selectedRepo.name, file.name, file.content, commitMessage);
            }
            
            setGhStatus('');
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: `✅ Pushed ${files.filter(f => f.language !== 'image').length} files to **${selectedRepo.owner}/${selectedRepo.name}**`, 
                timestamp: Date.now() 
            }]);
        } catch (e: any) {
            setGhStatus('');
            alertService.error('Push Failed', e.message);
        } finally {
            setGhLoading(false);
        }
    };

    const createNewRepo = async () => {
        if (!ghOctokit) return;
        const repoName = prompt('New repository name:', projectName.toLowerCase().replace(/\s+/g, '-'));
        if (!repoName) return;
        
        setGhLoading(true);
        setGhStatus('Creating repository...');
        try {
            const { data } = await ghOctokit.rest.repos.createForAuthenticatedUser({
                name: repoName,
                private: false,
                auto_init: true
            });
            
            // Wait a moment for GitHub to initialize
            await new Promise(r => setTimeout(r, 2000));
            
            setSelectedRepo({ owner: data.owner.login, name: data.name });
            setGhRepos(prev => [data, ...prev]);
            setGhStatus('');
            
            // Push files to new repo
            await pushToRepo();
        } catch (e: any) {
            setGhStatus('');
            alertService.error('Repository Creation Failed', e.message);
        } finally {
            setGhLoading(false);
        }
    };

    const pullFromRepo = async () => {
        if (!ghOctokit || !selectedRepo) return;
        const confirmed = await alertService.confirm({
            title: 'Pull Changes?',
            text: 'This will overwrite your local files with the latest from the repository.',
            confirmText: 'Pull',
            cancelText: 'Cancel',
            icon: 'warning'
        });
        if (confirmed) {
            await cloneRepo(selectedRepo.owner, selectedRepo.name);
        }
    };

    // Progress status messages for generation
    const progressMessages = [
        'Analyzing request...',
        'Understanding context...',
        'Configuring inputs...',
        'Structuring code...',
        'Generating components...',
        'Optimizing logic...',
        'Building UI elements...',
        'Adding interactions...',
        'Finalizing structure...',
        'Almost there...'
    ];

    // Start rotating progress messages
    const startProgressRotation = () => {
        let idx = 0;
        setGenerationStatus(progressMessages[0]);
        progressStatusRef.current = setInterval(() => {
            idx = (idx + 1) % progressMessages.length;
            setGenerationStatus(progressMessages[idx]);
        }, 2500);
    };

    // Stop rotating progress messages
    const stopProgressRotation = () => {
        if (progressStatusRef.current) {
            clearInterval(progressStatusRef.current);
            progressStatusRef.current = null;
        }
    };

    // Detect service integration requests in user message
    const detectServiceRequest = (message: string): {detected: boolean, service: string | null, action: string | null} => {
        const integrationPatterns = [
            { pattern: /\b(add|integrate|setup|connect|use)\s+(stripe)\b/i, service: 'stripe', action: 'payments' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(paystack)\b/i, service: 'paystack', action: 'payments' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(flutterwave)\b/i, service: 'flutterwave', action: 'payments' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(opay)\b/i, service: 'opay', action: 'payments' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(resend)\b/i, service: 'resend', action: 'email' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(sendgrid)\b/i, service: 'sendgrid', action: 'email' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(twilio)\b/i, service: 'twilio', action: 'sms' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(firebase)\b/i, service: 'firebase', action: 'database' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(supabase)\b/i, service: 'supabase', action: 'database' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(cloudinary)\b/i, service: 'cloudinary', action: 'storage' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(aws\s*s3|s3)\b/i, service: 'aws-s3', action: 'storage' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(openai|gpt)\b/i, service: 'openai', action: 'ai' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(google\s*maps|maps)\b/i, service: 'google-maps', action: 'maps' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(auth0)\b/i, service: 'auth0', action: 'auth' },
            { pattern: /\b(add|integrate|setup|connect|use)\s+(clerk)\b/i, service: 'clerk', action: 'auth' },
        ];

        for (const {pattern, service, action} of integrationPatterns) {
            if (pattern.test(message)) {
                return {detected: true, service, action};
            }
        }
        return {detected: false, service: null, action: null};
    };

    const handleSendMessage = async () => {
        if ((!chatInput.trim() && !chatAttachment) || isGenerating) return;
        const userMsg: BuilderChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, attachment: chatAttachment || undefined, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setChatAttachment(null);
        setIsGenerating(true);
        setCompletedFiles([]);
        setPendingFiles([]);
        
        // Start rotating progress messages
        startProgressRotation();

        // Check if user is requesting a service integration
        const serviceRequest = detectServiceRequest(userMsg.text);
        if (serviceRequest.detected && serviceRequest.service) {
            const serviceName = serviceRequest.service.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
            // Check if we have saved config for this service
            const savedConfig = savedServiceConfigs[serviceRequest.service];
            if (savedConfig) {
                setGenerationStatus(`Using saved ${savedConfig.serviceName} configuration...`);
            } else {
                setGenerationStatus(`Detected ${serviceName} integration request...`);
                // If it's an API service (requires keys) and not configured, prompt user
                const apiService = ALL_SERVICES.api.find(s => s.id === serviceRequest.service);
                if (apiService) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'model',
                        text: `I noticed you want to use **${serviceName}**. \n\nPlease configure it in the **Services** tab (⚡ icon) first so I can use your API keys securely.`,
                        timestamp: Date.now()
                    }]);
                    // Open the services tab automatically
                    setSidebarTab('services');
                    setServiceCategory('api');
                    setNewServiceType(serviceRequest.service);
                    setIsSidebarCollapsed(false);
                    setIsGenerating(false);
                    stopProgressRotation();
                    return; // Stop generation until configured
                }
            }
        }
        
        try {
            const snapshot = JSON.parse(JSON.stringify(files));
            
            // Inject saved service configs into the generation context if relevant
            let enhancedDbConfigs = [...dbConfigs];
            if (serviceRequest.detected && serviceRequest.service && savedServiceConfigs[serviceRequest.service]) {
                const config = savedServiceConfigs[serviceRequest.service];
                // Add service config to context (will be used by AI)
                enhancedDbConfigs = [
                    ...enhancedDbConfigs,
                    {
                        type: serviceRequest.service as any,
                        name: config.serviceName,
                        connected: true,
                        config: config.config
                    }
                ];
            }
            
            const result = await generateProject([...messages, userMsg], stack, model, files, enhancedDbConfigs, useSearch);
            
            // Stop progress rotation
            stopProgressRotation();
            
            if (result.toolCall === 'generateLogo' || result.toolCall === 'generateImage') {
                setGenerationStatus('🎨 Generating asset...');
                const imgPrompt = result.explanation || userMsg.text;
                try {
                    const blob = await generateImage(imgPrompt, '1:1', '1K', ModelType.PRO_IMAGE);
                    const base64 = await blobToBase64(blob);
                    
                    const fileName = `src/assets/${result.toolCall === 'generateLogo' ? 'logo' : 'image'}-${Date.now()}.png`;
                    const imageFile: ProjectFile = { name: fileName, content: `data:image/png;base64,${base64}`, language: 'image' };
                    setFiles([...files, imageFile]);
                    setCompletedFiles([fileName]);
                    setMessages(prev => [...prev, { 
                        id: Date.now().toString(), role: 'model', text: `Generated asset: ${fileName}.`,
                        attachment: { name: fileName, mimeType: 'image/png', data: base64 }, timestamp: Date.now() 
                    }]);
                } catch (e) {
                    console.error("Image generation failed", e);
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Failed to generate image.", timestamp: Date.now() }]);
                }
            } else if (result.files && result.files.length > 0) {
                // Show files being worked on
                const fileNames = result.files.map((f: ProjectFile) => f.name);
                setPendingFiles(fileNames);
                
                setHistoryStack(prev => [...prev, snapshot]); 
                setRedoStack([]);
                const newFiles = [...files];
                const completed: string[] = [];
                
                // Process files one by one with visual feedback
                for (const rf of result.files) {
                    setGenerationStatus(`📝 Editing ${rf.name.split('/').pop()}...`);
                    const idx = newFiles.findIndex(f => f.name === rf.name);
                    if (idx >= 0) newFiles[idx] = rf; else newFiles.push(rf);
                    completed.push(rf.name);
                    setCompletedFiles([...completed]);
                    // Small delay for visual effect
                    await new Promise(resolve => setTimeout(resolve, 150));
                }
                
                setFiles(newFiles);
                setPendingFiles([]);
                setGenerationStatus('✅ All files updated!');
                
                // Build completion message with file list
                const fileListText = result.files.map((f: ProjectFile) => `✅ ${f.name}`).join('\n');
                setMessages(prev => [...prev, { 
                    id: Date.now().toString(), 
                    role: 'model', 
                    text: `${result.explanation || "Updated code."}\n\n**Files updated:**\n${fileListText}`, 
                    timestamp: Date.now() 
                }]);
            } else {
                setGenerationStatus('');
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: result.explanation || "No changes needed.", timestamp: Date.now() }]);
            }
        } catch (e: any) {
            stopProgressRotation();
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Error: ${e.message}`, timestamp: Date.now() }]);
        } finally {
            stopProgressRotation();
            setIsGenerating(false);
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
                setIsTranscribingAudio(true);
            }
        } else {
            try {
                await ensureApiKey();
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];
                mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    stream.getTracks().forEach(track => track.stop());
                    try {
                        // Hugging Face transcription takes a Blob directly
                        const transcript = await transcribeAudio(audioBlob);
                        if (transcript) setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
                    } catch (error) { console.error(error); } finally { setIsTranscribingAudio(false); }
                };
                mediaRecorder.start();
                setIsRecording(true);
            } catch (error: any) {
                console.error("Error accessing microphone:", error);
                let errorMessage = 'Could not access microphone.';
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    setShowPermissionHelp(true);
                    return;
                } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                    errorMessage = 'No microphone found. Please ensure a microphone is connected.';
                } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                    errorMessage = 'Microphone is already in use by another application.';
                }
                alertService.error('Microphone Error', errorMessage);
            }
        }
    };

    const restoreCheckpoint = () => {
        if (historyStack.length === 0) return;
        const prev = historyStack[historyStack.length - 1];
        setRedoStack([...redoStack, files]);
        setFiles(prev);
        setHistoryStack(historyStack.slice(0, -1));
    };

    const handleAddPackage = async (pkgName: string) => {
        if (!pkgName) return;
        // Fetch actual version from npm registry
        let version = 'latest';
        try {
            const res = await fetch(`https://registry.npmjs.org/${pkgName}/latest`);
            if (res.ok) {
                const data = await res.json();
                version = `^${data.version}`;
            }
        } catch (e) {
            console.log('Could not fetch version, using latest');
        }
        
        const newDeps = { ...dependencies, [pkgName]: version };
        setDependencies(newDeps);
        const pkgFile = files.find(f => f.name === 'package.json');
        if (pkgFile) {
            try {
                const json = JSON.parse(pkgFile.content);
                json.dependencies = { ...json.dependencies, [pkgName]: version };
                const newFiles = files.map(f => f.name === 'package.json' ? { ...f, content: JSON.stringify(json, null, 2) } : f);
                setFiles(newFiles);
                if (shellRef.current) shellRef.current.log(`\x1b[32m+ ${pkgName}@${version}\x1b[0m`);
            } catch (e) {}
        }
        setNewPackage('');
        updateWebPreview();
    };

    const handleImportProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            const newFiles: ProjectFile[] = [];
            const entries = Object.keys(contents.files);
            let detectedStack: Stack = 'react';
            if (entries.some(e => e.includes('next.config'))) detectedStack = 'nextjs';
            else if (entries.some(e => e.endsWith('package.json'))) detectedStack = 'react';
            if (entries.some(e => e.endsWith('main.py'))) detectedStack = 'python';

            for (const filename of entries) {
                const fileData = contents.files[filename];
                if (fileData.dir) continue;
                if (filename.match(/\.(js|jsx|ts|tsx|html|css|json|md|py|txt)$/i)) {
                    const content = await fileData.async('string');
                    let lang: ProjectFile['language'] = 'javascript';
                    if (filename.endsWith('.html')) lang = 'html';
                    else if (filename.endsWith('.css')) lang = 'css';
                    else if (filename.endsWith('.json')) lang = 'json';
                    else if (filename.match(/\.tsx?$/)) lang = 'typescript';
                    else if (filename.endsWith('.py')) lang = 'python';
                    newFiles.push({ name: filename, content, language: lang });
                }
            }

            if (newFiles.length > 0) {
                setFiles(newFiles);
                setStack(detectedStack);
                setProjectName(file.name.replace(/\.zip$/i, ''));
                const newId = Date.now().toString();
                setCurrentProjectId(newId);
                setHistoryStack([]); setRedoStack([]); setSnapshots([]);
                setMessages([{ id: 'import', role: 'model', text: `Imported project: ${file.name}`, timestamp: Date.now() }]);
                const entry = newFiles.find(f => f.name.match(/src\/(App|main)\./) || f.name === 'index.html' || f.name === 'main.py');
                if (entry) setActiveFile(entry.name); else setActiveFile(newFiles[0].name);
                updateWebPreview();
            }
        } catch (error: any) { alertService.error('Import Failed', error.message); }
    };

    const updateWebPreview = () => {
        // Stacks that need external runtime
        if (stack === 'flutter' || stack === 'python') return;
        setIsRefreshing(true);
        
        // Get inline CSS
        const cssFiles = files.filter(f => f.name.endsWith('.css'));
        const inlineCss = cssFiles.map(f => f.content).join('\n');
        
        // For Vue stack, use index.html directly (CDN-based)
        if (stack === 'vue') {
            const htmlFile = files.find(f => f.name === 'index.html' || f.name.endsWith('.html'));
            const jsFiles = files.filter(f => f.name.endsWith('.js'));
            
            let htmlContent = htmlFile?.content || '<!DOCTYPE html><html><head><title>Preview</title></head><body><h1>Hello World</h1></body></html>';
            
            // Ensure we have a proper HTML structure
            if (!htmlContent.includes('<head>')) {
                htmlContent = htmlContent.replace('<html>', '<html><head></head>');
            }
            if (!htmlContent.includes('</head>')) {
                htmlContent = htmlContent.replace('<body', '</head><body');
            }
            
            // Inject Tailwind first
            if (!htmlContent.includes('tailwindcss')) {
                htmlContent = htmlContent.replace(/<head>/i, '<head>\n<script src="https://cdn.tailwindcss.com"></script>');
            }
            
            // Inject CSS files
            if (inlineCss) {
                htmlContent = htmlContent.replace(/<\/head>/i, `<style>\n${inlineCss}\n</style>\n</head>`);
            }
            
            // Inject all JS files before </body>
            if (jsFiles.length > 0) {
                const allJs = jsFiles.map(f => `// ${f.name}\n${f.content}`).join('\n\n');
                if (htmlContent.includes('</body>')) {
                    htmlContent = htmlContent.replace(/<\/body>/i, `<script>\n${allJs}\n</script>\n</body>`);
                } else {
                    htmlContent += `<script>\n${allJs}\n</script>`;
                }
            }
            
            const blob = new Blob([htmlContent], {type: 'text/html'});
            setIframeSrc(URL.createObjectURL(blob));
            setPreviewKey(p => p + 1);
            setTimeout(() => setIsRefreshing(false), 300);
            return;
        }
        
        // Find all JS/TS files for React stacks
        const jsFiles = files.filter(f => f.name.match(/\.(js|jsx|ts|tsx)$/));
        const appFile = jsFiles.find(f => f.name.match(/App\.(js|jsx|ts|tsx)$/));
        
        if (!appFile) {
            const noAppHtml = `<!DOCTYPE html><html><body style="padding:20px;font-family:system-ui;"><p>No App file found. Create App.tsx or App.jsx.</p></body></html>`;
            const blob = new Blob([noAppHtml], {type: 'text/html'});
            setIframeSrc(URL.createObjectURL(blob));
            setPreviewKey(p => p + 1);
            setTimeout(() => setIsRefreshing(false), 300);
            return;
        }
        
        // Get all component files (not App) to bundle them
        const componentFiles = jsFiles.filter(f => !f.name.match(/App\.(js|jsx|ts|tsx)$/));
        
        // Clean TypeScript syntax from code - remove ALL imports
        const cleanTS = (code: string) => {
            let c = code;
            // Remove ALL import statements - match complete lines
            c = c.split('\n').filter(line => !line.trim().startsWith('import ')).join('\n');
            // Remove type exports
            c = c.replace(/export\s+type\s+\{[^}]*\};?\s*/g, '');
            c = c.replace(/export\s+type\s+\w+\s*=\s*[^;]+;/g, '');
            // Remove interfaces and type declarations
            c = c.replace(/(?:export\s+)?interface\s+\w+[^{]*\{[\s\S]*?\}/g, '');
            c = c.replace(/(?:export\s+)?type\s+\w+\s*(?:<[^>]*>)?\s*=\s*[^;]+;/g, '');
            // Remove type annotations
            c = c.replace(/:\s*(?:React\.)?(?:FC|FunctionComponent|ComponentType|ReactNode|ReactElement|JSX\.Element|string|number|boolean|any|void|null|undefined|object|Array|Record|Promise|Set|Map)(?:<[^>]*>)?(?:\s*\|\s*\w+(?:<[^>]*>)?)*(?=\s*[=,)}\];])/g, '');
            c = c.replace(/:\s*\([^)]+\)\s*=>\s*\w+(?:<[^>]*>)?/g, '');
            c = c.replace(/:\s*\{[^}]+\}(?=\s*[=,)}\];])/g, '');
            // Remove generics from function declarations
            c = c.replace(/<\s*(?:\w+\s*(?:extends\s+\w+)?(?:,\s*\w+\s*(?:extends\s+\w+)?)*)\s*>\s*\(/g, '(');
            // Remove 'as' assertions
            c = c.replace(/\s+as\s+(?:const|(?:React\.)?\w+(?:<[^>]*>)?(?:\[\])?)/g, '');
            // Clean up exports
            c = c.replace(/export\s+default\s+function\s+/g, 'function ');
            c = c.replace(/export\s+default\s+/g, 'const _DefaultExport = ');
            c = c.replace(/export\s+(?:const|let|var|function)/g, m => m.replace('export ', ''));
            return c;
        };

        // Process all component files first
        const componentCode = componentFiles.map(f => {
            const code = cleanTS(f.content);
            const name = f.name.replace(/^(src\/|components\/)?/, '').replace(/\.(js|jsx|ts|tsx)$/, '');
            // Extract component name from file
            const funcMatch = code.match(/function\s+(\w+)\s*\(/);
            const constMatch = code.match(/(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)|)\s*=>/);
            const compName = funcMatch?.[1] || constMatch?.[1] || name;
            return { name, compName, code };
        });
        
        const appCode = cleanTS(appFile.content);
        
        // Find the component name
        let componentName = 'App';
        const funcMatch = appCode.match(/function\s+(\w+)\s*\(/);
        const constMatch = appCode.match(/(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)|)\s*=>/);
        if (funcMatch) componentName = funcMatch[1];
        else if (constMatch) componentName = constMatch[1];
        
        // Common lucide icons as simple SVG components
        const lucideIcons = `
        // Common Lucide Icons as SVG components
        const Sparkles = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z'}), React.createElement('path', {d:'M5 3v4'}), React.createElement('path', {d:'M3 5h4'}), React.createElement('path', {d:'M19 17v4'}), React.createElement('path', {d:'M17 19h4'}));
        const Sparkle = Sparkles; // Alias for Sparkle (singular)
        const Star = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('polygon', {points:'12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'}));
        const Heart = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'}));
        const Check = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M20 6 9 17l-5-5'}));
        const X = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M18 6 6 18'}), React.createElement('path', {d:'m6 6 12 12'}));
        const Menu = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('line', {x1:4, x2:20, y1:12, y2:12}), React.createElement('line', {x1:4, x2:20, y1:6, y2:6}), React.createElement('line', {x1:4, x2:20, y1:18, y2:18}));
        const ChevronRight = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m9 18 6-6-6-6'}));
        const ChevronLeft = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m15 18-6-6 6-6'}));
        const ChevronDown = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m6 9 6 6 6-6'}));
        const ArrowRight = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M5 12h14'}), React.createElement('path', {d:'m12 5 7 7-7 7'}));
        const Search = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:11, cy:11, r:8}), React.createElement('path', {d:'m21 21-4.3-4.3'}));
        const User = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'}), React.createElement('circle', {cx:12, cy:7, r:4}));
        const Settings = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'}), React.createElement('circle', {cx:12, cy:12, r:3}));
        const Home = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'}), React.createElement('polyline', {points:'9 22 9 12 15 12 15 22'}));
        const Mail = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:20, height:16, x:2, y:4, rx:2}), React.createElement('path', {d:'m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'}));
        const Phone = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'}));
        const Plus = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M5 12h14'}), React.createElement('path', {d:'M12 5v14'}));
        const Minus = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M5 12h14'}));
        const Zap = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('polygon', {points:'13 2 3 14 12 14 11 22 21 10 12 10 13 2'}));
        const Sun = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:4}), React.createElement('path', {d:'M12 2v2'}), React.createElement('path', {d:'M12 20v2'}), React.createElement('path', {d:'m4.93 4.93 1.41 1.41'}), React.createElement('path', {d:'m17.66 17.66 1.41 1.41'}), React.createElement('path', {d:'M2 12h2'}), React.createElement('path', {d:'M20 12h2'}), React.createElement('path', {d:'m6.34 17.66-1.41 1.41'}), React.createElement('path', {d:'m19.07 4.93-1.41 1.41'}));
        const Moon = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'}));
        const Globe = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('path', {d:'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'}), React.createElement('path', {d:'M2 12h20'}));
        const Code = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('polyline', {points:'16 18 22 12 16 6'}), React.createElement('polyline', {points:'8 6 2 12 8 18'}));
        const Terminal = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('polyline', {points:'4 17 10 11 4 5'}), React.createElement('line', {x1:12, x2:20, y1:19, y2:19}));
        const Loader2 = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', className:'animate-spin', ...props}, React.createElement('path', {d:'M21 12a9 9 0 1 1-6.219-8.56'}));
        const AlertCircle = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('line', {x1:12, x2:12, y1:8, y2:12}), React.createElement('line', {x1:12, x2:12.01, y1:16, y2:16}));
        const Info = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('path', {d:'M12 16v-4'}), React.createElement('path', {d:'M12 8h.01'}));
        const Shield = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'}));
        const Rocket = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z'}), React.createElement('path', {d:'m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z'}), React.createElement('path', {d:'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0'}), React.createElement('path', {d:'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'}));
        // Additional common icons
        const ChevronUp = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m18 15-6-6-6 6'}));
        const ArrowLeft = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m12 19-7-7 7-7'}), React.createElement('path', {d:'M19 12H5'}));
        const ArrowUp = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m5 12 7-7 7 7'}), React.createElement('path', {d:'M12 19V5'}));
        const ArrowDown = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M12 5v14'}), React.createElement('path', {d:'m19 12-7 7-7-7'}));
        const Trash = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M3 6h18'}), React.createElement('path', {d:'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'}), React.createElement('path', {d:'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'}));
        const Edit = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'}), React.createElement('path', {d:'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'}));
        const Pencil = Edit; // Alias
        const Copy = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:14, height:14, x:8, y:8, rx:2, ry:2}), React.createElement('path', {d:'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'}));
        const Download = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'}), React.createElement('polyline', {points:'7 10 12 15 17 10'}), React.createElement('line', {x1:12, x2:12, y1:15, y2:3}));
        const Upload = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'}), React.createElement('polyline', {points:'17 8 12 3 7 8'}), React.createElement('line', {x1:12, x2:12, y1:3, y2:15}));
        const Eye = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'}), React.createElement('circle', {cx:12, cy:12, r:3}));
        const EyeOff = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M9.88 9.88a3 3 0 1 0 4.24 4.24'}), React.createElement('path', {d:'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68'}), React.createElement('path', {d:'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61'}), React.createElement('line', {x1:2, x2:22, y1:2, y2:22}));
        const Lock = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:18, height:11, x:3, y:11, rx:2, ry:2}), React.createElement('path', {d:'M7 11V7a5 5 0 0 1 10 0v4'}));
        const Unlock = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:18, height:11, x:3, y:11, rx:2, ry:2}), React.createElement('path', {d:'M7 11V7a5 5 0 0 1 9.9-1'}));
        const Bell = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'}), React.createElement('path', {d:'M13.73 21a2 2 0 0 1-3.46 0'}));
        const Calendar = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:18, height:18, x:3, y:4, rx:2, ry:2}), React.createElement('line', {x1:16, x2:16, y1:2, y2:6}), React.createElement('line', {x1:8, x2:8, y1:2, y2:6}), React.createElement('line', {x1:3, x2:21, y1:10, y2:10}));
        const Clock = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('polyline', {points:'12 6 12 12 16 14'}));
        const Image = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:18, height:18, x:3, y:3, rx:2, ry:2}), React.createElement('circle', {cx:9, cy:9, r:2}), React.createElement('path', {d:'m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'}));
        const Video = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m22 8-6 4 6 4V8Z'}), React.createElement('rect', {width:14, height:12, x:2, y:6, rx:2, ry:2}));
        const Music = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M9 18V5l12-2v13'}), React.createElement('circle', {cx:6, cy:18, r:3}), React.createElement('circle', {cx:18, cy:16, r:3}));
        const File = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'}), React.createElement('polyline', {points:'14 2 14 8 20 8'}));
        const Folder = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'}));
        const Link = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'}), React.createElement('path', {d:'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'}));
        const ExternalLink = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'}), React.createElement('polyline', {points:'15 3 21 3 21 9'}), React.createElement('line', {x1:10, x2:21, y1:14, y2:3}));
        const Share = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:18, cy:5, r:3}), React.createElement('circle', {cx:6, cy:12, r:3}), React.createElement('circle', {cx:18, cy:19, r:3}), React.createElement('line', {x1:8.59, x2:15.42, y1:13.51, y2:17.49}), React.createElement('line', {x1:15.41, x2:8.59, y1:6.51, y2:10.49}));
        const Send = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('line', {x1:22, x2:11, y1:2, y2:13}), React.createElement('polygon', {points:'22 2 15 22 11 13 2 9 22 2'}));
        const MessageCircle = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z'}));
        const Gift = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('polyline', {points:'20 12 20 22 4 22 4 12'}), React.createElement('rect', {width:20, height:5, x:2, y:7}), React.createElement('line', {x1:12, x2:12, y1:22, y2:7}), React.createElement('path', {d:'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z'}), React.createElement('path', {d:'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z'}));
        const Award = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:8, r:7}), React.createElement('polyline', {points:'8.21 13.89 7 23 12 20 17 23 15.79 13.88'}));
        const Trophy = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M6 9H4.5a2.5 2.5 0 0 1 0-5H6'}), React.createElement('path', {d:'M18 9h1.5a2.5 2.5 0 0 0 0-5H18'}), React.createElement('path', {d:'M4 22h16'}), React.createElement('path', {d:'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22'}), React.createElement('path', {d:'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22'}), React.createElement('path', {d:'M18 2H6v7a6 6 0 0 0 12 0V2Z'}));
        const Crown = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14'}));
        const Flame = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'}));
        const Lightning = Zap; // Alias
        const Bolt = Zap; // Alias
        const Close = X; // Alias
        const XCircle = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('path', {d:'m15 9-6 6'}), React.createElement('path', {d:'m9 9 6 6'}));
        const CheckCircle = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('path', {d:'m9 12 2 2 4-4'}));
        const MoreHorizontal = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:1}), React.createElement('circle', {cx:19, cy:12, r:1}), React.createElement('circle', {cx:5, cy:12, r:1}));
        const MoreVertical = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:1}), React.createElement('circle', {cx:12, cy:5, r:1}), React.createElement('circle', {cx:12, cy:19, r:1}));
        const Loader = Loader2; // Alias
        const Spinner = Loader2; // Alias
        const Loading = Loader2; // Alias
        `;

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"><\\/script>
    <script type="module">
        import * as ReactPkg from "https://esm.sh/react@19.0.0?dev";
        import * as ReactDOMPkg from "https://esm.sh/react-dom@19.0.0/client?dev";
        
        const React = ReactPkg.default || ReactPkg;
        const ReactDOM = ReactDOMPkg.default || ReactDOMPkg;

        window.React = React;
        window.ReactDOM = ReactDOM;
        
        // Expose hooks to global scope safely
        const hooks = ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useContext', 'useReducer', 'useLayoutEffect', 'createContext', 'Fragment', 'memo', 'forwardRef'];
        hooks.forEach(h => {
            if (React && React[h]) {
                window[h] = React[h];
            }
        });

        console.log('React loaded:', React);

        // Load Babel after React is ready to prevent race conditions
        const babelScript = document.createElement('script');
        babelScript.src = "https://unpkg.com/@babel/standalone@7.23.5/babel.min.js";
        babelScript.onload = () => {
            if (window.Babel) {
                window.Babel.transformScriptTags();
            }
        };
        document.head.appendChild(babelScript);
    <\\/script>
    <style>
        body { background-color: #ffffff; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
        #root { min-height: 100vh; }
        ${inlineCss}
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script>
        window.onerror = function(msg, url, line, col, error) {
            document.getElementById('root').innerHTML = '<div style="padding:20px;color:#ef4444;font-family:monospace;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin:20px;"><strong>Error:</strong><br>' + msg + '</div>';
            return true;
        };
    <\\/script>
    
    <script type="text/babel" data-presets="react">
        // Common Lucide Icons
        ${lucideIcons}
        
        // Error boundary
        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
            }
            static getDerivedStateFromError(error) {
                return { hasError: true, error };
            }
            render() {
                if (this.state.hasError) {
                    return React.createElement('div', {
                        style: {padding: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', margin: '20px', fontFamily: 'monospace'}
                    }, [
                        React.createElement('strong', {key:'title', style: {color: '#dc2626'}}, 'Render Error:'),
                        React.createElement('pre', {key:'msg', style: {color: '#7f1d1d', marginTop: '8px', whiteSpace: 'pre-wrap'}}, this.state.error?.message)
                    ]);
                }
                return this.props.children;
            }
        }
        
        // Component files
        ${componentCode.map(c => `// ${c.name}\n${c.code}`).join('\\n\\n')}

        // User's App component
        ${appCode}
        
        // Render
        try {
            const AppComponent = typeof ${componentName} !== 'undefined' ? ${componentName} : 
                                 typeof _DefaultExport !== 'undefined' ? _DefaultExport : 
                                 typeof App !== 'undefined' ? App : null;
            
            if (AppComponent) {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(React.createElement(ErrorBoundary, null, React.createElement(AppComponent)));
            } else {
                document.getElementById('root').innerHTML = '<div style="padding:20px;color:#ef4444;font-family:monospace;">No App component found. Make sure your file exports a component.</div>';
            }
        } catch (e) {
            document.getElementById('root').innerHTML = '<div style="padding:20px;color:#ef4444;font-family:monospace;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin:20px;"><strong>Error:</strong><br>' + e.message + '</div>';
        }
    <\/script>
</body>
</html>`;

        const finalBlob = new Blob([html], {type: 'text/html'});
        setIframeSrc(URL.createObjectURL(finalBlob));
        setPreviewKey(p => p + 1);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const handlePublish = async () => {
        if (!currentProjectId) return;
        
        const isPublished = isProjectPublished(currentProjectId);
        
        if (isPublished) {
            const confirmed = await alert.confirm({
                title: "Unpublish Project?",
                text: "This will remove your project from the Community Showcase.",
                confirmText: "Unpublish",
                isDanger: true
            });
            
            if (confirmed) {
                unpublishFromCommunity(currentProjectId);
                alert.toast.success("Project unpublished.");
            }
        } else {
            const desc = await alert.prompt({
                title: "Publish to Community",
                text: "Enter a short description for your project:",
                inputPlaceholder: "A cool app built with Zee..."
            });
            
            if (desc) {
                const user = localStorage.getItem('zee_user');
                const userData = user ? JSON.parse(user) : { username: 'Anonymous', avatar: '' };
                
                try {
                    const projectToPublish: SavedProject = {
                        id: currentProjectId,
                        name: projectName,
                        stack,
                        files,
                        lastModified: Date.now(),
                        dbConfigs,
                        messages,
                        snapshots
                    };
                    
                    publishToCommmunity(
                        projectToPublish,
                        desc,
                        userData.username,
                        userData.avatar
                    );
                    alert.toast.success("Project published to Community Showcase!");
                } catch (e: any) {
                    alert.toast.error("Failed to publish: " + e.message);
                }
            }
        }
    };

    const handleDownload = async () => {
        const zip = new JSZip();
        files.forEach(f => zip.file(f.name, f.content));
        const content = await zip.generateAsync({type:"blob"});
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s+/g, '-')}.zip`;
        a.click();
    };

    const getFileTree = (list: ProjectFile[]) => {
        const root: TreeNode = { name: 'root', path: '', type: 'folder', children: [] };
        list.forEach(f => {
             const parts = f.name.split('/');
             let curr = root;
             parts.forEach((part, i) => {
                 const isFile = i === parts.length - 1;
                 let child = curr.children?.find(c => c.name === part);
                 if (!child) {
                     child = { name: part, path: parts.slice(0, i+1).join('/'), type: isFile ? 'file' : 'folder', children: isFile ? undefined : [] };
                     curr.children?.push(child);
                 }
                 if (!isFile) curr = child;
             });
        });
        return root.children || [];
    };

    // Check if stack can use WebContainer (StackBlitz)
    const canUseWebContainer = ['react', 'react-ts', 'vue', 'nextjs', 'html'].includes(stack) && files.length > 0;

    // Inlined Panels
    const renderPreviewPanel = (fullScreen = false) => (
        <div className={`flex flex-col bg-white h-full relative ${fullScreen ? 'fixed inset-0 z-50' : ''}`}>
            <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
                <span className="text-xs text-slate-500 flex items-center font-bold">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                    Live Preview
                </span>
                <div className="flex items-center space-x-2">
                    <button onClick={() => { setIsRefreshing(true); setPreviewKey(p => p + 1); setTimeout(() => setIsRefreshing(false), 500); }} className="p-1 hover:bg-slate-200 rounded" title="Refresh">
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setIsFullScreenPreview(!isFullScreenPreview)} className="p-1 hover:bg-slate-200 rounded" title={fullScreen ? "Minimize" : "Maximize"}>
                        {fullScreen ? <Minimize2 className="w-4 h-4 text-slate-500"/> : <Maximize2 className="w-4 h-4 text-slate-500"/>}
                    </button>
                </div>
            </div>
            {stack === 'python' ? (
                // Python Inline Runtime with Pyodide
                <div className="flex-1 flex flex-col bg-slate-900">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                        <span className="text-xs text-yellow-400 font-mono flex items-center gap-2">
                            <span className="text-lg">🐍</span> Python Runtime
                        </span>
                        <button 
                            onClick={runPythonCode}
                            disabled={isPythonRunning}
                            className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition ${
                                isPythonRunning 
                                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                                    : 'bg-green-600 text-white hover:bg-green-500'
                            }`}
                        >
                            {isPythonRunning ? (
                                <><RefreshCw className="w-3 h-3 animate-spin" /> Running...</>
                            ) : (
                                <><Play className="w-3 h-3" /> Run Code</>
                            )}
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                        {pythonOutput.length === 0 ? (
                            <div className="text-slate-500 text-center mt-8">
                                <p className="text-lg mb-2">Click "Run Code" to execute your Python file</p>
                                <p className="text-xs">Python runs directly in your browser</p>
                            </div>
                        ) : (
                            pythonOutput.map((line, i) => (
                                <div key={i} className={`${
                                    line.startsWith('❌') ? 'text-red-400' : 
                                    line.startsWith('✅') ? 'text-green-400' :
                                    line.startsWith('📦') || line.startsWith('🐍') ? 'text-blue-400' :
                                    line.startsWith('▶️') ? 'text-yellow-400' :
                                    'text-slate-300'
                                }`}>
                                    {line || '\u00A0'}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : stack === 'flutter' ? (
                // Flutter preview with embedded DartPad
                <div className="flex-1 flex flex-col bg-slate-900">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                        <span className="text-xs text-cyan-400 font-mono flex items-center gap-2">
                            <Smartphone className="w-4 h-4" /> Flutter Preview (DartPad)
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => { setIsRefreshing(true); setPreviewKey(p => p + 1); setTimeout(() => setIsRefreshing(false), 500); }}
                                className="p-1.5 bg-slate-700 text-white rounded text-xs hover:bg-slate-600"
                                title="Refresh Preview"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button 
                                onClick={() => {
                                    const mainDart = files.find(f => f.name === 'lib/main.dart' || f.name === 'main.dart');
                                    if (mainDart) navigator.clipboard.writeText(mainDart.content);
                                    alert.toast.success('Code copied!');
                                }}
                                className="px-2 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600 flex items-center gap-1"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                            <a 
                                href="https://flutlab.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-500 flex items-center gap-1"
                            >
                                <Globe className="w-3 h-3" /> FlutLab
                            </a>
                            <a 
                                href="https://zapp.run/new"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-cyan-600 text-white rounded text-xs font-bold hover:bg-cyan-500 flex items-center gap-1"
                            >
                                <MonitorPlay className="w-3 h-3" /> Zapp
                            </a>
                            <button 
                                onClick={handleDownload}
                                className="px-2 py-1 bg-slate-600 text-white rounded text-xs font-bold hover:bg-slate-500 flex items-center gap-1"
                            >
                                <Download className="w-3 h-3" /> Download
                            </button>
                        </div>
                    </div>
                    <DartPadPreview files={files} className="flex-1 w-full" />
                </div>
            ) : canUseWebContainer ? (
                <div className="flex-1 w-full" key={previewKey} style={{ height: 'calc(100% - 40px)', minHeight: '400px' }}>
                    <CustomPreview files={files} stack={stack} />
                </div>
            ) : (
                <iframe key={previewKey} src={iframeSrc} className="flex-1 w-full border-none bg-white" title="Preview" />
            )}
        </div>
    );

    const renderChatPanel = () => (
        <div className="flex flex-col h-full bg-slate-900">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center shrink-0 bg-slate-900">
                <div className="flex items-center">
                    <Bot className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-xs font-bold text-white">Zee Builder</span>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={createSnapshot} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-green-400" title="Create Checkpoint">
                        <Save className="w-3.5 h-3.5" />
                    </button>
                    <select value={model} onChange={e => setModel(e.target.value as ModelType)} className="bg-slate-950 text-xs text-slate-400 border border-slate-800 rounded py-1 px-2 max-w-[100px] focus:outline-none">
                        <option value={ModelType.FLASH}>Free (Llama 3)</option>
                        <option value={ModelType.FLASH_LITE}>Lite (Fast)</option>
                    </select>
                    <button onClick={() => setUseSearch(!useSearch)} className={`p-1.5 rounded ${useSearch ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500 hover:bg-slate-800'}`} title="Search Web">
                        <Globe className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-slate-600 text-xs mt-10">
                        <Bot className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>How can I help you build today?</p>
                    </div>
                )}
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-3 rounded-xl text-xs ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                            {m.attachment && <div className="mb-2 text-xs bg-black/20 p-1 rounded flex items-center"><Paperclip className="w-3 h-3 mr-1" />{m.attachment.name}</div>}
                            {m.attachment && m.attachment.mimeType.startsWith('image') && (
                                <img src={`data:${m.attachment.mimeType};base64,${m.attachment.data}`} alt="Attached" className="max-w-full h-auto rounded mb-2 border border-slate-700" />
                            )}
                            {m.role === 'model' ? <MarkdownRenderer content={m.text} /> : <div className="whitespace-pre-wrap">{m.text}</div>}
                            {m.role === 'model' && m.text.includes('Updated') && historyStack.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                    <DiffView files={files} oldFiles={historyStack[historyStack.length - 1]} />
                                    <button onClick={restoreCheckpoint} className="flex items-center text-[10px] text-orange-400 hover:text-orange-300 transition-colors"><RotateCcw className="w-3 h-3 mr-1" /> Revert Changes</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isGenerating && (
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <div className="flex items-center text-xs text-blue-400 mb-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                            <span className="animate-pulse">{generationStatus}</span>
                        </div>
                        {(pendingFiles.length > 0 || completedFiles.length > 0) && (
                            <div className="mt-2 space-y-1 border-t border-slate-700/50 pt-2">
                                {pendingFiles.map((file) => (
                                    <div key={file} className={`flex items-center text-[10px] ${completedFiles.includes(file) ? 'text-green-400' : 'text-slate-500'}`}>
                                        {completedFiles.includes(file) ? (
                                            <svg className="w-3 h-3 mr-1.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <div className="w-3 h-3 mr-1.5 rounded-full border border-slate-600 animate-pulse" />
                                        )}
                                        <span className="truncate">{file.split('/').pop()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-900">
                <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-600 transition-colors">
                    <button 
                        onClick={toggleRecording} 
                        className={`p-3 transition-colors ${isRecording ? 'text-red-500 animate-pulse bg-red-950/20' : 'text-slate-500 hover:text-blue-500 hover:bg-slate-900'} border-r border-slate-800`}
                        title={isRecording ? "Stop Recording" : "Record Audio"}
                        disabled={isTranscribingAudio}
                    >
                        {isTranscribingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />)}
                    </button>
                    <label className="p-3 cursor-pointer text-slate-500 hover:text-blue-500 hover:bg-slate-900 transition-colors border-r border-slate-800" title="Attach any file (images, PDFs, text, zip, code files...)">
                        <Paperclip className="w-4 h-4" />
                        <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) blobToBase64(f).then(d => setChatAttachment({ name: f.name, mimeType: f.type || 'application/octet-stream', data: d })) }} />
                    </label>
                    <textarea 
                        value={chatInput} 
                        onChange={(e) => setChatInput(e.target.value)} 
                        onKeyDown={(e) => {
                            if (window.innerWidth < 768) { return; }
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                        }} 
                        placeholder="Ask Zee to build..." 
                        className="flex-1 bg-transparent px-4 py-3 text-slate-900 dark:text-white focus:outline-none resize-none text-sm min-h-[50px]" 
                        rows={1} 
                    />
                    <button onClick={() => handleSendMessage()} disabled={isGenerating} className="p-3 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"><Send className="w-4 h-4" /></button>
                </div>
                {chatAttachment && (
                    <div className="mt-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {chatAttachment.mimeType.startsWith('image/') ? (
                                    <img 
                                        src={`data:${chatAttachment.mimeType};base64,${chatAttachment.data}`} 
                                        alt="Preview" 
                                        className="w-12 h-12 object-cover rounded border border-slate-600"
                                    />
                                ) : (
                                    <div className={`w-10 h-10 rounded flex items-center justify-center ${
                                        chatAttachment.mimeType === 'application/pdf' ? 'bg-red-900/30' :
                                        chatAttachment.mimeType === 'application/zip' || chatAttachment.name.endsWith('.zip') ? 'bg-yellow-900/30' :
                                        chatAttachment.mimeType.startsWith('text/') || chatAttachment.name.match(/\.(txt|md|json|js|ts|tsx|jsx|py|html|css|xml|yaml|yml)$/i) ? 'bg-blue-900/30' :
                                        'bg-slate-700'
                                    }`}>
                                        {chatAttachment.mimeType === 'application/pdf' ? (
                                            <FileCode className="w-4 h-4 text-red-400" />
                                        ) : chatAttachment.mimeType === 'application/zip' || chatAttachment.name.endsWith('.zip') ? (
                                            <PackageIcon className="w-4 h-4 text-yellow-400" />
                                        ) : chatAttachment.mimeType.startsWith('text/') || chatAttachment.name.match(/\.(txt|md|json|js|ts|tsx|jsx|py|html|css)$/i) ? (
                                            <File className="w-4 h-4 text-blue-400" />
                                        ) : (
                                            <Paperclip className="w-4 h-4 text-slate-400" />
                                        )}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-slate-300 truncate max-w-[150px]">{chatAttachment.name}</p>
                                    <p className="text-[10px] text-slate-500">
                                        {chatAttachment.mimeType.startsWith('image/') ? '📷 Image - design reference' :
                                         chatAttachment.mimeType === 'application/pdf' ? '📄 PDF document' :
                                         chatAttachment.mimeType === 'application/zip' || chatAttachment.name.endsWith('.zip') ? '📦 Zip archive' :
                                         chatAttachment.mimeType.startsWith('text/') || chatAttachment.name.match(/\.(txt|md)$/i) ? '📝 Text document' :
                                         chatAttachment.name.match(/\.(json|js|ts|tsx|jsx|py|html|css)$/i) ? '💻 Code file' :
                                         'File attached'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setChatAttachment(null)} className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-purple-400 mt-2 flex items-center">
                            {chatAttachment.mimeType.startsWith('image/') ? (
                                <><Image className="w-3 h-3 mr-1" /> Tip: "Build this UI" or "Use this color scheme"</>
                            ) : chatAttachment.mimeType === 'application/pdf' ? (
                                <><FileCode className="w-3 h-3 mr-1" /> Tip: "Extract ideas from this PDF" or "Build based on this spec"</>
                            ) : chatAttachment.mimeType === 'application/zip' || chatAttachment.name.endsWith('.zip') ? (
                                <><PackageIcon className="w-3 h-3 mr-1" /> Tip: "Analyze these files" or "Use assets from this zip"</>
                            ) : (
                                <><File className="w-3 h-3 mr-1" /> Tip: Describe what you want to do with this file</>
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    if (isWizardOpen) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950/90 p-4 backdrop-blur-sm overflow-y-auto">
                <div className="min-h-full flex items-center justify-center py-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl p-8 animate-in zoom-in-95 duration-200 relative">
                    <button 
                        onClick={() => setIsWizardOpen(false)} 
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-slate-800 rounded-full hover:bg-slate-700 transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-3xl font-bold text-white mb-2">Create Project</h2>
                    <p className="text-slate-400 mb-8">Choose a stack to get started.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { id: 'react', label: 'React', icon: CodeIcon, color: 'text-blue-500' },
                            { id: 'react-ts', label: 'TypeScript', icon: FileType, color: 'text-blue-400' },
                            { id: 'vue', label: 'Vue.js', icon: Layers, color: 'text-green-500' },
                            { id: 'flutter', label: 'Flutter', icon: Smartphone, color: 'text-cyan-500' },
                            { id: 'python', label: 'Python', icon: TerminalIcon, color: 'text-yellow-500' },
                            { id: 'nextjs', label: 'Next.js', icon: Globe, color: 'text-slate-400' },
                            { id: 'html', label: 'HTML/JS', icon: Globe, color: 'text-orange-500' },
                        ].map((s) => (
                            <button key={s.id} onClick={() => initProject(s.id as Stack)} className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 hover:bg-slate-750 text-left transition-all group">
                                <s.icon className={`w-8 h-8 ${s.color} mb-3 group-hover:scale-110 transition-transform`} />
                                <h3 className="text-lg font-bold text-white">{s.label}</h3>
                            </button>
                        ))}
                    </div>
                    {savedProjects.length > 0 && (
                        <div className="border-t border-slate-800 pt-6">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Recent Projects</h3>
                            <div className="flex flex-wrap gap-3">
                                {savedProjects.slice(0, 5).map(p => (
                                    <button key={p.id} onClick={() => loadProject(p)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors text-sm flex items-center">
                                        <FileCode className="w-3 h-3 mr-2 text-slate-500"/> {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-5rem)] flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
            
            {/* Full Screen Preview Overlay */}
            {isFullScreenPreview && renderPreviewPanel(true)}

            {/* Header */}
            <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center space-x-3">
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"><Sidebar className="w-5 h-5"/></button>
                    <div className="flex items-center">
                        <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="bg-transparent text-white font-bold text-sm focus:outline-none w-32 md:w-auto px-1 rounded focus:bg-slate-800" />
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center space-x-1 mr-2">
                        <button onClick={restoreCheckpoint} disabled={historyStack.length===0} className="p-2 hover:bg-slate-800 rounded text-slate-400 disabled:opacity-30" title="Undo"><Undo2 className="w-4 h-4"/></button>
                        <button onClick={() => {}} className="p-2 hover:bg-slate-800 rounded text-slate-400 disabled:opacity-30" title="Redo"><Redo2 className="w-4 h-4"/></button>
                        <button 
                            onClick={() => { setSidebarTab('term'); setIsSidebarCollapsed(false); }}
                            className={`p-2 hover:bg-slate-800 rounded transition-colors ${sidebarTab === 'term' && !isSidebarCollapsed ? 'text-green-400 bg-slate-800' : 'text-slate-400'}`}
                            title="Open Terminal"
                        >
                            <TerminalIcon className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

                    {/* Import Project Button */}
                    <label className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer" title="Import ZIP Project">
                        <UploadCloud className="w-4 h-4" />
                        <input type="file" accept=".zip" className="hidden" onChange={handleImportProject} />
                    </label>

                    <button onClick={handlePublish} className={`p-2 hover:bg-slate-700 rounded transition-colors ${currentProjectId && isProjectPublished(currentProjectId) ? 'bg-green-900/30 text-green-400' : 'bg-slate-800 text-slate-300'}`} title={currentProjectId && isProjectPublished(currentProjectId) ? "Unpublish" : "Publish to Community"}>
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button onClick={handleDownload} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors" title="Export">
                        <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsWizardOpen(true)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors shadow-lg shadow-blue-900/20">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                
                {/* Left Sidebar */}
                <div className={`${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-64'} absolute md:relative z-20 h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 flex-shrink-0 overflow-hidden shadow-2xl md:shadow-none`}>
                    <div className="flex border-b border-slate-800 overflow-x-auto custom-scrollbar">
                        {[{id:'files',icon:File,label:'Files'}, {id:'code',icon:CodeIcon,label:'Code'}, {id:'term',icon:TerminalIcon,label:'Terminal'}, {id:'git',icon:GithubIcon,label:'Git'}, {id:'db',icon:Database,label:'DB'}, {id:'services',icon:Zap,label:'Services'}, {id:'pkg',icon:PackageIcon,label:'Packages'}, {id:'snaps', icon:History,label:'Snaps'}].map((t:any) => (
                            <button key={t.id} onClick={() => setSidebarTab(t.id)} className={`flex-shrink-0 px-3 py-3 flex flex-col items-center border-b-2 transition-colors ${sidebarTab === t.id ? 'border-blue-500 text-blue-500 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`} title={t.label}>
                                <t.icon className="w-4 h-4"/>
                                <span className="text-[9px] mt-0.5 hidden md:block">{t.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {sidebarTab === 'files' && <div className="space-y-1 pt-2">{getFileTree(files).map(n => <FileTreeNode key={n.path} node={n} level={0} activeFile={activeFile} onSelect={setActiveFile} onRename={handleRenameFile} onDelete={handleDeleteFile} />)}</div>}
                        
                        {/* Code View Tab with Syntax Highlighting */}
                        {sidebarTab === 'code' && (
                            <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <select 
                                        value={activeFile}
                                        onChange={e => setActiveFile(e.target.value)}
                                        className="flex-1 bg-slate-950 text-white text-xs p-2 rounded border border-slate-800"
                                    >
                                        {files.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                                    </select>
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(files.find(f => f.name === activeFile)?.content || '')}
                                        className="ml-2 p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                                        title="Copy code"
                                    >
                                        <Copy className="w-3 h-3"/>
                                    </button>
                                </div>
                                <div className="flex-1 bg-[#1e1e1e] rounded border border-slate-800 overflow-hidden font-mono text-xs flex flex-col">
                                    {(() => {
                                        const content = files.find(f => f.name === activeFile)?.content || '';
                                        const lineCount = content.split('\n').length;
                                        return (
                                            <div className="flex-1 overflow-auto custom-scrollbar">
                                                <div className="flex min-h-full">
                                                    {/* Line numbers column */}
                                                    <div className="bg-[#1a1a1a] text-slate-600 text-right px-2 py-2 select-none flex-shrink-0 border-r border-slate-800">
                                                        {Array.from({length: lineCount}, (_, i) => (
                                                            <div key={i} style={{ lineHeight: '18px', height: '18px', fontSize: '11px' }}>{i + 1}</div>
                                                        ))}
                                                    </div>
                                                    {/* Code textarea */}
                                                    <textarea 
                                                        value={content} 
                                                        onChange={e => {
                                                            const v = e.target.value;
                                                            setFiles(files.map(f => f.name === activeFile ? {...f, content: v} : f));
                                                        }}
                                                        className="flex-1 bg-transparent text-slate-300 p-2 resize-none focus:outline-none min-w-0"
                                                        style={{ lineHeight: '18px', fontSize: '11px', tabSize: 2 }}
                                                        spellCheck={false}
                                                        wrap="off"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                        
                        {/* Terminal Tab */}
                        {sidebarTab === 'term' && (
                            <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                        <TerminalIcon className="w-3 h-3 text-green-500"/> Terminal
                                    </span>
                                    <button 
                                        onClick={() => {
                                            setTerminalOutput(['ZeeBuilder Shell v1.0', 'Cleared.']);
                                            if (xtermRef.current) {
                                                xtermRef.current.clear();
                                                shellRef.current?.prompt();
                                            }
                                        }}
                                        className="text-xs text-slate-500 hover:text-white"
                                    >
                                        Clear
                                    </button>
                                </div>
                                
                                {/* Terminal Commands Panel */}
                                <div className="flex-1 bg-black rounded border border-slate-800 overflow-hidden flex flex-col">
                                    {/* Terminal Output Display */}
                                    <div className="flex-1 p-2 font-mono text-xs overflow-y-auto custom-scrollbar min-h-[200px]">
                                        {terminalOutput.map((line, i) => (
                                            <div key={i} className={line.startsWith('$') ? 'text-green-400' : line.startsWith('Error') ? 'text-red-400' : 'text-slate-300'}>
                                                {line}
                                            </div>
                                        ))}
                                        
                                        {/* Quick Command Buttons */}
                                        <div className="space-y-1 mt-3 border-t border-slate-800 pt-3">
                                            <p className="text-slate-600 text-[10px] mb-2">Quick Commands:</p>
                                            <div className="flex flex-wrap gap-1">
                                                <button 
                                                    onClick={() => {
                                                        const output = files.map(f => f.name.split('/')[0]).filter((v, i, a) => a.indexOf(v) === i);
                                                        setTerminalOutput(prev => [...prev, '$ ls', ...output]);
                                                    }}
                                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded text-blue-400 text-[10px]"
                                                >
                                                    ls
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const tree = files.map(f => `  ${f.name}`);
                                                        setTerminalOutput(prev => [...prev, '$ tree', '.', ...tree]);
                                                    }}
                                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded text-blue-400 text-[10px]"
                                                >
                                                    tree
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const file = files.find(f => f.name === activeFile);
                                                        if (file) {
                                                            const lines = file.content.split('\n').slice(0, 20);
                                                            setTerminalOutput(prev => [...prev, `$ cat ${activeFile}`, ...lines, lines.length >= 20 ? '...(truncated)' : '']);
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded text-blue-400 text-[10px]"
                                                >
                                                    cat
                                                </button>
                                                <button 
                                                    onClick={() => setTerminalOutput(['ZeeBuilder Shell v1.0', 'Cleared.'])}
                                                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded text-yellow-400 text-[10px]"
                                                >
                                                    clear
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Command Input */}
                                    <div className="border-t border-slate-800 p-2">
                                        <form 
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                if (terminalCmd.trim()) {
                                                    const cmd = terminalCmd.trim();
                                                    const parts = cmd.split(/\s+/);
                                                    const command = parts[0];
                                                    const args = parts.slice(1);
                                                    
                                                    let output: string[] = [`$ ${cmd}`];
                                                    
                                                    switch (command) {
                                                        case 'ls':
                                                            output.push(...files.map(f => f.name.split('/')[0]).filter((v, i, a) => a.indexOf(v) === i));
                                                            break;
                                                        case 'tree':
                                                            output.push('.', ...files.map(f => `├── ${f.name}`));
                                                            break;
                                                        case 'cat':
                                                            if (args[0]) {
                                                                const file = files.find(f => f.name === args[0] || f.name.endsWith(args[0]));
                                                                if (file) {
                                                                    output.push(...file.content.split('\n').slice(0, 30));
                                                                } else {
                                                                    output.push(`Error: File not found: ${args[0]}`);
                                                                }
                                                            } else {
                                                                output.push('Usage: cat <filename>');
                                                            }
                                                            break;
                                                        case 'npm':
                                                            if (args[0] === 'i' || args[0] === 'install') {
                                                                if (args[1]) {
                                                                    handleAddPackage(args[1]);
                                                                    output.push(`Installing ${args[1]}...`, `+ ${args[1]}@latest added`);
                                                                } else {
                                                                    output.push('Usage: npm install <package>');
                                                                }
                                                            }
                                                            break;
                                                        case 'clear':
                                                            setTerminalOutput(['ZeeBuilder Shell v1.0', 'Cleared.']);
                                                            setTerminalCmd('');
                                                            return;
                                                        case 'help':
                                                            output.push('Available commands:', '  ls - List files', '  tree - Show file tree', '  cat <file> - View file content', '  npm i <pkg> - Install package', '  clear - Clear terminal', '  help - Show this help');
                                                            break;
                                                        default:
                                                            output.push(`Command not found: ${command}. Type 'help' for available commands.`);
                                                    }
                                                    
                                                    setTerminalOutput(prev => [...prev, ...output]);
                                                    setTerminalCmd('');
                                                    
                                                    // Also sync to xterm if available
                                                    if (shellRef.current) {
                                                        shellRef.current.handleCommand(cmd);
                                                    }
                                                }
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="text-green-400 text-xs">$</span>
                                            <input 
                                                type="text"
                                                value={terminalCmd}
                                                onChange={(e) => setTerminalCmd(e.target.value)}
                                                placeholder="Enter command..."
                                                className="flex-1 bg-transparent text-white text-xs focus:outline-none font-mono"
                                                autoComplete="off"
                                            />
                                            <button type="submit" className="text-green-400 hover:text-green-300 text-xs">
                                                Run
                                            </button>
                                        </form>
                                    </div>
                                </div>
                                
                                <div className="mt-2 text-[10px] text-slate-600 px-1">
                                    <p>Try: <code className="text-green-400">npm i axios</code>, <code className="text-green-400">cat App.tsx</code>, <code className="text-green-400">help</code></p>
                                </div>
                            </div>
                        )}
                        
                        {sidebarTab === 'git' && (
                            <div className="p-2 space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase">GitHub Integration</h3>
                                {!ghUser ? (
                                    <>
                                        <p className="text-[10px] text-slate-600">Connect your GitHub to push/pull code from repositories.</p>
                                        <input 
                                            type="password" 
                                            value={ghToken} 
                                            onChange={e=>setGhToken(e.target.value)} 
                                            placeholder="GitHub Personal Access Token" 
                                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                                        />
                                        <button 
                                            onClick={()=>connectGitHub(ghToken)} 
                                            disabled={ghLoading || !ghToken}
                                            className="w-full bg-slate-800 text-white text-xs py-2 rounded hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {ghLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <GithubIcon className="w-3 h-3"/>}
                                            Connect GitHub
                                        </button>
                                        <p className="text-[10px] text-slate-600 text-center">Need a token? <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Create one here</a></p>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-slate-800 rounded p-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {ghUser.login.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-white font-medium">{ghUser.login}</p>
                                                    <p className="text-[10px] text-green-400 flex items-center gap-1"><Check className="w-2.5 h-2.5"/> Connected</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={()=>{setGhUser(null);setGhToken('');setGhRepos([]);setSelectedRepo(null);setGhOctokit(null);}}
                                                className="text-slate-500 hover:text-red-400"
                                                title="Disconnect"
                                            >
                                                <Unlink className="w-4 h-4"/>
                                            </button>
                                        </div>

                                        {ghStatus && (
                                            <div className={`text-xs p-2 rounded ${ghStatus.includes('Error') || ghStatus.includes('Failed') ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                                {ghLoading && <Loader2 className="w-3 h-3 animate-spin inline mr-1.5"/>}
                                                {ghStatus}
                                            </div>
                                        )}

                                        <div className="border-t border-slate-800 pt-3 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-[10px] text-slate-400 font-bold uppercase">Your Repositories</h4>
                                                <button onClick={async()=>{if(ghOctokit){setGhLoading(true);const repos=await githubService.getUserRepos(ghOctokit);setGhRepos(repos);setGhLoading(false);}}} disabled={ghLoading} className="text-blue-400 hover:text-blue-300">
                                                    <RefreshCw className={`w-3 h-3 ${ghLoading ? 'animate-spin' : ''}`}/>
                                                </button>
                                            </div>
                                            <select 
                                                value={selectedRepo ? `${selectedRepo.owner}/${selectedRepo.name}` : ''}
                                                onChange={e=>{
                                                    const r = ghRepos.find(r=>`${r.owner}/${r.name}`===e.target.value);
                                                    setSelectedRepo(r||null);
                                                }}
                                                className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800"
                                            >
                                                <option value="">Select a repository...</option>
                                                {ghRepos.map(r=>(
                                                    <option key={`${r.owner}/${r.name}`} value={`${r.owner}/${r.name}`}>{r.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {selectedRepo && (
                                            <div className="space-y-2 border-t border-slate-800 pt-3">
                                                <div className="bg-slate-800 rounded p-2">
                                                    <p className="text-xs text-white font-medium flex items-center gap-1.5">
                                                        <FolderGit2 className="w-3 h-3 text-purple-400"/>
                                                        {selectedRepo.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">{selectedRepo.owner}/{selectedRepo.name}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button 
                                                        onClick={()=>cloneRepo(selectedRepo.owner, selectedRepo.name)}
                                                        disabled={ghLoading}
                                                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        <ArrowDownToLine className="w-3 h-3"/>
                                                        Clone
                                                    </button>
                                                    <button 
                                                        onClick={pushToRepo}
                                                        disabled={ghLoading || files.length === 0}
                                                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        <ArrowUpFromLine className="w-3 h-3"/>
                                                        Push
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-slate-800 pt-3 space-y-2">
                                            <h4 className="text-[10px] text-slate-400 font-bold uppercase">Quick Actions</h4>
                                            <button 
                                                onClick={async()=>{
                                                    if(!selectedRepo) { alertService.warning('No Repository', 'Please select a repository first.'); return; }
                                                    await cloneRepo(selectedRepo.owner, selectedRepo.name);
                                                }}
                                                disabled={ghLoading || !selectedRepo}
                                                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <GitBranch className="w-3 h-3"/>
                                                Import from Selected Repo
                                            </button>
                                            <button 
                                                onClick={pushToRepo}
                                                disabled={ghLoading || !selectedRepo || files.length === 0}
                                                className="w-full bg-green-700 hover:bg-green-600 text-white text-xs py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <GitCommit className="w-3 h-3"/>
                                                Commit & Push Changes
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {sidebarTab === 'db' && (
                            <div className="p-2 space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase">Databases & Hosting</h3>
                                <p className="text-[10px] text-slate-600">Connect databases or hosting platforms. Credentials are injected into generated code.</p>
                                {dbConfigs.map((db,i) => (
                                    <div key={i} className="bg-slate-800 p-3 rounded text-xs text-white space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="capitalize font-bold flex items-center">
                                                {db.type === 'vercel' ? (
                                                    <Globe className="w-3 h-3 mr-1.5 text-white"/>
                                                ) : db.type === 'appwrite' ? (
                                                    <Layers className="w-3 h-3 mr-1.5 text-pink-500"/>
                                                ) : (
                                                    <Database className="w-3 h-3 mr-1.5 text-green-500"/>
                                                )}
                                                {db.name || db.type}
                                            </span>
                                            <Trash2 className="w-3 h-3 cursor-pointer text-red-400 hover:text-red-300" onClick={()=>{const n=[...dbConfigs];n.splice(i,1);setDbConfigs(n)}}/>
                                        </div>
                                        {db.config?.url && <p className="text-[10px] text-slate-400 truncate">{db.config.url}</p>}
                                        {db.config?.endpoint && <p className="text-[10px] text-slate-400 truncate">{db.config.endpoint}</p>}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${db.connected ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                                            {db.connected ? 'Connected' : 'Not Connected'}
                                        </span>
                                    </div>
                                ))}
                                <div className="pt-3 border-t border-slate-800 space-y-2">
                                    <h4 className="text-[10px] text-slate-400 font-bold uppercase">Add Connection</h4>
                                    <div className="grid grid-cols-5 gap-1">
                                        {[
                                            { id: 'supabase', label: 'Supabase', color: 'bg-green-600' },
                                            { id: 'firebase', label: 'Firebase', color: 'bg-orange-500' },
                                            { id: 'neon', label: 'Neon', color: 'bg-cyan-500' },
                                            { id: 'appwrite', label: 'Appwrite', color: 'bg-pink-500' },
                                            { id: 'vercel', label: 'Vercel', color: 'bg-white text-black' }
                                        ].map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setNewDbType(p.id as any)}
                                                className={`p-1.5 rounded text-[9px] font-bold transition-all ${
                                                    newDbType === p.id 
                                                        ? `${p.color} ring-2 ring-blue-400` 
                                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                                }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                    <input 
                                        type="text"
                                        value={newDbConfig.name || ''}
                                        onChange={e => setNewDbConfig({...newDbConfig, name: e.target.value})}
                                        placeholder="Connection Name"
                                        className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800"
                                    />
                                    
                                    {/* Dynamic fields based on provider */}
                                    {newDbType === 'supabase' && (
                                        <>
                                            <input type="text" value={newDbConfig.url || ''} onChange={e => setNewDbConfig({...newDbConfig, url: e.target.value})} placeholder="Supabase Project URL" className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800" />
                                            <input type="password" value={newDbConfig.key || ''} onChange={e => setNewDbConfig({...newDbConfig, key: e.target.value})} placeholder="Supabase Anon Key" className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800" />
                                        </>
                                    )}
                                    {newDbType === 'firebase' && (
                                        <>
                                            <input type="text" value={newDbConfig.url || ''} onChange={e => setNewDbConfig({...newDbConfig, url: e.target.value})} placeholder="Firebase Project ID" className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800" />
                                            <input type="password" value={newDbConfig.key || ''} onChange={e => setNewDbConfig({...newDbConfig, key: e.target.value})} placeholder="Firebase API Key" className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800" />
                                        </>
                                    )}
                                    {newDbType === 'neon' && (
                                        <input type="password" value={newDbConfig.url || ''} onChange={e => setNewDbConfig({...newDbConfig, url: e.target.value})} placeholder="Neon Connection String (postgres://...)" className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800" />
                                    )}
                                    {newDbType === 'appwrite' && (
                                        <>
                                            <input type="text" value={newDbConfig.endpoint || ''} onChange={e => setNewDbConfig({...newDbConfig, endpoint: e.target.value})} placeholder="Appwrite Endpoint (https://cloud.appwrite.io/v1)" className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800" />
                                            <input type="text" value={newDbConfig.url || ''} onChange={e => setNewDbConfig({...newDbConfig, url: e.target.value})} placeholder="Project ID" className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800" />
                                            <input type="password" value={newDbConfig.key || ''} onChange={e => setNewDbConfig({...newDbConfig, key: e.target.value})} placeholder="API Key" className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800" />
                                        </>
                                    )}
                                    {newDbType === 'vercel' && (
                                        <>
                                            <input type="password" value={newDbConfig.key || ''} onChange={e => setNewDbConfig({...newDbConfig, key: e.target.value})} placeholder="Vercel Token" className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800" />
                                            <input type="text" value={newDbConfig.url || ''} onChange={e => setNewDbConfig({...newDbConfig, url: e.target.value})} placeholder="Team ID (optional)" className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800" />
                                            <p className="text-[9px] text-slate-500">Connect to deploy your project directly to Vercel.</p>
                                        </>
                                    )}
                                    
                                    <button 
                                        onClick={()=>{
                                            if (newDbType === 'appwrite' && !newDbConfig.endpoint) { alertService.warning('Missing Field', 'Please enter Appwrite endpoint.'); return; }
                                            if (newDbType !== 'vercel' && !newDbConfig.url && !newDbConfig.endpoint) { alertService.warning('Missing Field', 'Please enter connection details.'); return; }
                                            if (newDbType === 'vercel' && !newDbConfig.key) { alertService.warning('Missing Field', 'Please enter Vercel token.'); return; }
                                            
                                            const config: any = { key: newDbConfig.key };
                                            if (newDbConfig.url) config.url = newDbConfig.url;
                                            if (newDbConfig.endpoint) config.endpoint = newDbConfig.endpoint;
                                            
                                            setDbConfigs([...dbConfigs, {
                                                type: newDbType, 
                                                name: newDbConfig.name || newDbType, 
                                                connected: true, 
                                                config
                                            }]);
                                            setNewDbConfig({});
                                            
                                            const msgText = newDbType === 'vercel' 
                                                ? `🚀 **Vercel connected!** You can now deploy your project directly.`
                                                : newDbType === 'appwrite'
                                                ? `✅ **Appwrite connected!** Database, Auth, and Storage are now available.`
                                                : `✅ **${newDbType} connected!** I'll use these credentials when generating backend code.`;
                                            
                                            setMessages(prev => [...prev, { 
                                                id: Date.now().toString(), 
                                                role: 'model', 
                                                text: msgText, 
                                                timestamp: Date.now() 
                                            }]);
                                        }} 
                                        className={`w-full text-white text-xs py-2 rounded font-bold transition-colors ${
                                            newDbType === 'vercel' ? 'bg-black hover:bg-gray-800' :
                                            newDbType === 'appwrite' ? 'bg-pink-600 hover:bg-pink-500' :
                                            'bg-blue-600 hover:bg-blue-500'
                                        }`}
                                    >
                                        {newDbType === 'vercel' ? 'Connect Vercel' : newDbType === 'appwrite' ? 'Connect Appwrite' : 'Connect Database'}
                                    </button>
                                </div>
                            </div>
                        )}
                        {sidebarTab === 'services' && (
                            <div className="p-2 space-y-3 overflow-y-auto custom-scrollbar" style={{maxHeight: 'calc(100vh - 200px)'}}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase">Services & Integrations</h3>
                                    <button 
                                        onClick={async () => {
                                            setIsSyncing(true);
                                            const result = await cloudStorage.syncAll();
                                            setIsSyncing(false);
                                            if (result.success) {
                                                alertService.toast.success(`Synced ${result.synced.join(', ')} to cloud.`);
                                            }
                                        }}
                                        className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center"
                                        title="Sync to cloud"
                                    >
                                        {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-600">Connect API services (with keys) or quick integrations (libraries/tools). Data syncs to cloud when logged in.</p>
                                
                                {/* Toggle between API and Integration */}
                                <div className="flex bg-slate-800 rounded-lg p-0.5">
                                    <button 
                                        onClick={() => setServiceCategory('api')}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-colors ${serviceCategory === 'api' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        ⚡ API Services ({ALL_SERVICES.api.length})
                                    </button>
                                    <button 
                                        onClick={() => setServiceCategory('integration')}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-colors ${serviceCategory === 'integration' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        🔗 Integrations ({ALL_SERVICES.integration.length})
                                    </button>
                                </div>
                                
                                {/* Connected Services List */}
                                {Object.entries(savedServiceConfigs).filter(([_, svc]: [string, ServiceConfig]) => 
                                    serviceCategory === 'api' ? svc.serviceType === 'api' : svc.serviceType === 'integration'
                                ).length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] text-green-400 font-bold uppercase flex items-center">
                                            <Check className="w-3 h-3 mr-1" /> Connected
                                        </h4>
                                        {Object.entries(savedServiceConfigs)
                                            .filter(([_, svc]: [string, ServiceConfig]) => serviceCategory === 'api' ? svc.serviceType === 'api' : svc.serviceType === 'integration')
                                            .map(([id, svc]: [string, ServiceConfig]) => (
                                            <div key={id} className="bg-slate-800 p-2 rounded text-xs text-white flex justify-between items-center">
                                                <div className="flex items-center">
                                                    {svc.serviceType === 'api' ? (
                                                        <Zap className="w-3 h-3 mr-1.5 text-yellow-500"/>
                                                    ) : (
                                                        <Link className="w-3 h-3 mr-1.5 text-blue-500"/>
                                                    )}
                                                    <span className="font-medium">{svc.serviceName}</span>
                                                </div>
                                                <Trash2 
                                                    className="w-3 h-3 cursor-pointer text-red-400 hover:text-red-300" 
                                                    onClick={async () => {
                                                        await cloudStorage.deleteServiceConfig(id);
                                                        const newConfigs = {...savedServiceConfigs};
                                                        delete newConfigs[id];
                                                        setSavedServiceConfigs(newConfigs);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* API Services Section */}
                                {serviceCategory === 'api' && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] text-slate-400 font-bold uppercase">Available API Services</h4>
                                        <div className="grid grid-cols-3 gap-1">
                                            {ALL_SERVICES.api.map(s => {
                                                const isConnected = !!savedServiceConfigs[s.id];
                                                return (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => {
                                                            if (isConnected) return;
                                                            setNewServiceType(s.id);
                                                            setNewServiceConfig({});
                                                        }}
                                                        className={`p-1.5 rounded text-[8px] font-bold transition-all relative ${
                                                            isConnected
                                                                ? 'bg-green-900/30 text-green-400 ring-1 ring-green-600'
                                                                : newServiceType === s.id 
                                                                    ? `${s.color} ring-2 ring-blue-400 text-white` 
                                                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                                        }`}
                                                        title={s.category}
                                                    >
                                                        {s.name}
                                                        {isConnected && <Check className="w-2 h-2 absolute top-0.5 right-0.5" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Config form for selected API service */}
                                        {newServiceType && ALL_SERVICES.api.find(s => s.id === newServiceType) && !savedServiceConfigs[newServiceType] && (
                                            <div className="bg-slate-800/50 p-2 rounded space-y-2 mt-2">
                                                <h5 className="text-[10px] font-bold text-white capitalize">{newServiceType} Configuration</h5>
                                                {ALL_SERVICES.api.find(s => s.id === newServiceType)?.fields.map(field => (
                                                    <input 
                                                        key={field}
                                                        type={field.toLowerCase().includes('key') || field.toLowerCase().includes('secret') || field.toLowerCase().includes('token') ? 'password' : 'text'}
                                                        value={newServiceConfig[field] || ''}
                                                        onChange={e => setNewServiceConfig({...newServiceConfig, [field]: e.target.value})}
                                                        placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                        className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800"
                                                    />
                                                ))}
                                                <button 
                                                    onClick={async () => {
                                                        const service = ALL_SERVICES.api.find(s => s.id === newServiceType);
                                                        if (!service) return;
                                                        
                                                        // Check required fields
                                                        const missing = service.fields.filter(f => !newServiceConfig[f]);
                                                        if (missing.length > 0) {
                                                            alertService.warning('Missing Fields', `Please fill in: ${missing.join(', ')}`);
                                                            return;
                                                        }
                                                        
                                                        const config: ServiceConfig = {
                                                            serviceId: newServiceType,
                                                            serviceName: service.name,
                                                            serviceType: 'api',
                                                            config: {...newServiceConfig},
                                                            connectedAt: Date.now()
                                                        };
                                                        
                                                        await cloudStorage.saveServiceConfig(config);
                                                        setSavedServiceConfigs(prev => ({...prev, [newServiceType]: config}));
                                                        setNewServiceConfig({});
                                                        
                                                        setMessages(prev => [...prev, { 
                                                            id: Date.now().toString(), 
                                                            role: 'model', 
                                                            text: `⚡ **${service.name} connected!** You can now say "add ${service.name}" in chat and I'll use your saved credentials automatically.`, 
                                                            timestamp: Date.now() 
                                                        }]);
                                                    }} 
                                                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white text-xs py-2 rounded font-bold transition-colors"
                                                >
                                                    Connect {ALL_SERVICES.api.find(s => s.id === newServiceType)?.name}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Integration Services Section */}
                                {serviceCategory === 'integration' && (
                                    <div className="space-y-2">
                                        <h4 className="text-[10px] text-slate-400 font-bold uppercase">Libraries & Tools (No Keys Needed)</h4>
                                        <p className="text-[9px] text-slate-500">Click to add to your project. These get injected into AI context for better code generation.</p>
                                        
                                        {/* Group by category */}
                                        {Array.from(new Set(ALL_SERVICES.integration.map(s => s.category))).map(category => (
                                            <div key={category} className="space-y-1">
                                                <h5 className="text-[9px] text-slate-500 uppercase font-bold mt-2">{category}</h5>
                                                <div className="flex flex-wrap gap-1">
                                                    {ALL_SERVICES.integration.filter(s => s.category === category).map(s => {
                                                        const isConnected = !!savedServiceConfigs[s.id];
                                                        return (
                                                            <button
                                                                key={s.id}
                                                                onClick={async () => {
                                                                    if (isConnected) {
                                                                        // Remove
                                                                        await cloudStorage.deleteServiceConfig(s.id);
                                                                        const newConfigs = {...savedServiceConfigs};
                                                                        delete newConfigs[s.id];
                                                                        setSavedServiceConfigs(newConfigs);
                                                                    } else {
                                                                        // Add
                                                                        const config: ServiceConfig = {
                                                                            serviceId: s.id,
                                                                            serviceName: s.name,
                                                                            serviceType: 'integration',
                                                                            config: {},
                                                                            connectedAt: Date.now()
                                                                        };
                                                                        await cloudStorage.saveServiceConfig(config);
                                                                        setSavedServiceConfigs(prev => ({...prev, [s.id]: config}));
                                                                        
                                                                        setMessages(prev => [...prev, { 
                                                                            id: Date.now().toString(), 
                                                                            role: 'model', 
                                                                            text: `🔗 **${s.name} added!** I'll now consider this library when generating code for your project.`, 
                                                                            timestamp: Date.now() 
                                                                        }]);
                                                                    }
                                                                }}
                                                                className={`px-2 py-1 rounded text-[9px] font-medium transition-all ${
                                                                    isConnected
                                                                        ? `${s.color} text-white ring-1 ring-green-400`
                                                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                                                                }`}
                                                            >
                                                                {isConnected && <span className="mr-1">✓</span>}
                                                                {s.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {sidebarTab === 'pkg' && (
                            <div className="p-2 space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase">Project Dependencies</h3>
                                <p className="text-[10px] text-slate-600">Manage npm packages for your project. Packages are auto-added to package.json and available in preview.</p>
                                
                                {/* Add Package Input */}
                                <div className="flex gap-2">
                                    <input 
                                        value={newPackage} 
                                        onChange={e => setNewPackage(e.target.value)} 
                                        onKeyDown={e => e.key === 'Enter' && handleAddPackage(newPackage)} 
                                        placeholder="Package name (e.g. axios)" 
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                                    />
                                    <button 
                                        onClick={() => handleAddPackage(newPackage)}
                                        disabled={!newPackage.trim()}
                                        className="px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-bold"
                                    >
                                        <Plus className="w-3 h-3"/>
                                    </button>
                                </div>
                                
                                {/* Installed Packages List */}
                                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                                    {Object.entries(dependencies).length === 0 ? (
                                        <p className="text-xs text-slate-600 italic py-2">No packages installed yet.</p>
                                    ) : (
                                        Object.entries(dependencies).map(([name, version]) => (
                                            <div key={name} className="text-xs text-slate-300 bg-slate-800 p-2 rounded flex justify-between items-center group">
                                                <div className="flex items-center gap-2">
                                                    <PackageIcon className="w-3 h-3 text-green-500"/>
                                                    <span className="font-mono">{name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500 text-[10px]">{version}</span>
                                                    <button 
                                                        onClick={() => {
                                                            const newDeps = {...dependencies};
                                                            delete newDeps[name];
                                                            setDependencies(newDeps);
                                                            // Update package.json
                                                            const pkgFile = files.find(f => f.name === 'package.json');
                                                            if (pkgFile) {
                                                                try {
                                                                    const json = JSON.parse(pkgFile.content);
                                                                    delete json.dependencies[name];
                                                                    const newFiles = files.map(f => f.name === 'package.json' ? {...f, content: JSON.stringify(json, null, 2)} : f);
                                                                    setFiles(newFiles);
                                                                } catch (e) {}
                                                            }
                                                            if (shellRef.current) shellRef.current.log(`\x1b[31m- ${name} removed\x1b[0m`);
                                                        }}
                                                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove package"
                                                    >
                                                        <X className="w-3 h-3"/>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                
                                {/* Quick Install Suggestions */}
                                <div className="border-t border-slate-800 pt-3">
                                    <h4 className="text-[10px] text-slate-500 font-bold uppercase mb-2">Popular Packages</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {['axios', 'lodash', 'dayjs', 'uuid', 'zustand', 'framer-motion', 'react-router-dom', 'react-query'].filter(p => !dependencies[p]).slice(0, 6).map(pkg => (
                                            <button
                                                key={pkg}
                                                onClick={() => handleAddPackage(pkg)}
                                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] transition-colors"
                                            >
                                                + {pkg}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Import Map Info */}
                                <div className="bg-slate-950 rounded p-2 border border-slate-800">
                                    <p className="text-[10px] text-slate-500">
                                        <span className="text-green-400">✓</span> Packages are loaded via ESM from <span className="text-blue-400">esm.sh</span>
                                    </p>
                                </div>
                            </div>
                        )}
                        {sidebarTab === 'snaps' && (
                            <div className="p-2 space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                                    Checkpoints
                                    <button onClick={createSnapshot} className="text-blue-400 hover:text-blue-300"><Plus className="w-3 h-3"/></button>
                                </h3>
                                <div className="space-y-2">
                                    {snapshots.map(s => (
                                        <div key={s.id} onClick={() => restoreSnapshot(s)} className="bg-slate-800 p-2 rounded cursor-pointer hover:bg-slate-700 group">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-white font-bold">{s.name}</span>
                                                <span className="text-[10px] text-slate-500">{new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">{s.files.length} files</p>
                                        </div>
                                    ))}
                                    {snapshots.length === 0 && <p className="text-xs text-slate-600 italic">No snapshots saved.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0 border-r-0 md:border-r border-slate-800 bg-[#0f172a]">
                    <textarea 
                        value={files.find(f=>f.name===activeFile)?.content || ''} 
                        onChange={e=>{
                            const v = e.target.value;
                            setFiles(files.map(f=>f.name===activeFile?{...f,content:v}:f));
                        }}
                        className="flex-1 bg-transparent text-slate-300 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                        spellCheck={false}
                    />
                    <div className={`bg-black border-t border-slate-800 flex flex-col ${isTerminalOpen ? 'h-48' : 'h-8'} transition-all duration-300 flex-shrink-0`}>
                        <div className="h-8 bg-slate-900 flex items-center px-3 justify-between cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setIsTerminalOpen(!isTerminalOpen)}>
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-2"><TerminalIcon className="w-3 h-3 text-blue-500"/> Terminal</span>
                            {isTerminalOpen ? <ChevronDown className="w-3 h-3 text-slate-500"/> : <ChevronRight className="w-3 h-3 text-slate-500"/>}
                        </div>
                        <div className="flex-1 bg-black relative overflow-hidden">
                             <div ref={terminalRef} className="absolute inset-0 bg-black pl-2" style={{visibility: isTerminalOpen ? 'visible' : 'hidden'}} />
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-[400px] lg:w-[450px] h-1/2 md:h-auto bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shrink-0">
                    <div className="flex border-b border-slate-800 bg-slate-950">
                        <button 
                            onClick={() => setRightPanelTab('chat')} 
                            className={`flex-1 py-2 text-xs font-bold flex items-center justify-center ${rightPanelTab === 'chat' ? 'text-blue-500 bg-slate-900 border-t-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <MessageSquare className="w-3.5 h-3.5 mr-2"/> Chat
                        </button>
                        <button 
                            onClick={() => setRightPanelTab('preview')} 
                            className={`flex-1 py-2 text-xs font-bold flex items-center justify-center ${rightPanelTab === 'preview' ? 'text-green-500 bg-slate-900 border-t-2 border-green-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Play className="w-3.5 h-3.5 mr-2"/> Preview
                        </button>
                        <button 
                            onClick={() => setIsFullScreenPreview(true)} 
                            className="py-2 px-3 text-xs font-bold flex items-center justify-center text-purple-500 hover:text-purple-400 hover:bg-slate-800"
                            title="Full Device Preview"
                        >
                            <Maximize2 className="w-3.5 h-3.5"/>
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        {rightPanelTab === 'chat' ? renderChatPanel() : renderPreviewPanel()}
                    </div>
                </div>
            </div>

            {showProjectModal && (
                <div className="fixed inset-0 z-50 bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="min-h-full flex items-center justify-center py-4">
                    <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-800">
                        <h3 className="text-lg font-bold text-white mb-4">Switch Project</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {savedProjects.map(p => (
                                <div key={p.id} onClick={() => loadProject(p)} className="group relative p-3 hover:bg-slate-800 rounded-lg cursor-pointer border border-slate-800 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-200 font-medium">{p.name}</span>
                                        <span className="text-[10px] text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded w-fit mt-1">{p.stack}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 p-2 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowProjectModal(false)} className="mt-4 w-full py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors">Close</button>
                    </div>
                    </div>
                </div>
            )}
            {/* Permission Help Modal */}
            <PermissionHelpModal 
                isOpen={showPermissionHelp}
                onClose={() => setShowPermissionHelp(false)}
                onRetry={toggleRecording}
            />
        </div>
    );
};

export default Builder;
