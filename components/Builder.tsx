
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { generateProject, blobToBase64, generateImage, transcribeAudio, ensureApiKey } from '../services/geminiService';
import { githubService } from '../services/githubService';
import { DatabaseConfig, User, ModelType, ProjectFile, Stack, BuilderChatMessage, SavedProject, FileAttachment, Snapshot } from '../types';
import { 
    Code as CodeIcon, Download, Plus, Trash2, Github, Bot, Send, Loader2,
    File, RefreshCw, Terminal as TerminalIcon, X, Sidebar,
    RotateCcw, Image, FileCode, ChevronRight, ChevronDown, Database, Package as PackageIcon,
    Smartphone, Layers, Globe, Paperclip, MonitorPlay,
    Undo2, Redo2, Play, FileType, Eye, ArrowLeftRight, Check, AlertCircle, Maximize2, Minimize2, MessageSquare,
    Mic, MicOff, UploadCloud, Copy, Save, History, GitBranch, GitCommit, ArrowUpFromLine, ArrowDownToLine, FolderGit2, Unlink
} from 'lucide-react';
import JSZip from 'jszip';

interface BuilderProps {
    user: User | null;
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
                        this.term.writeln(`\x1b[33mFetching ${args[1]} from npm registry...\x1b[0m`);
                        this.onNpmInstall(args[1]); 
                    } else {
                        this.term.writeln(`npm ERR! Missing package name.`);
                    }
                }
                break;
            case 'node':
                 this.term.writeln(`\x1b[33mRunning node simulation...\x1b[0m`);
                 if (args[0]) {
                     this.term.writeln(`Executing ${args[0]}... (Logs will appear in console)`);
                 }
                 break;
            case 'python':
                 this.term.writeln(`\x1b[33mPython Runtime (Simulated)...\x1b[0m`);
                 if (args[0]) this.term.writeln(`Executing ${args[0]}...`);
                 break;
            case 'help': this.term.writeln('Commands: ls, cat, npm install <pkg>, node, python, clear'); break;
            case '': break;
            default: this.term.writeln(`bash: ${command}: command not found`);
        }
        this.prompt();
    }
    
    updateFiles(newFiles: ProjectFile[]) { this.files = newFiles; }
}

const FileTreeNode: React.FC<{ node: TreeNode; level: number; activeFile: string; onSelect: (path: string) => void }> = ({ node, level, activeFile, onSelect }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isFile = node.type === 'file';
    const isActive = isFile && activeFile === node.path;

    return (
        <div>
            <button
                onClick={() => isFile ? onSelect(node.path) : setIsOpen(!isOpen)}
                className={`w-full flex items-center px-2 py-1.5 text-xs rounded-md transition-colors group ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                <span className="mr-1.5 opacity-70">
                    {isFile ? (
                        node.name.endsWith('.css') ? <CodeIcon className="w-3.5 h-3.5 text-blue-400" /> :
                        node.name.match(/\.(ts|tsx)$/) ? <FileType className="w-3.5 h-3.5 text-blue-300" /> :
                        node.name.endsWith('.json') ? <Database className="w-3.5 h-3.5 text-yellow-500" /> :
                        node.name.endsWith('.py') ? <TerminalIcon className="w-3.5 h-3.5 text-yellow-400" /> :
                        node.name.match(/\.(png|jpg|jpeg|svg|gif)$/) ? <Image className="w-3.5 h-3.5 text-purple-400" /> :
                        <File className="w-3.5 h-3.5" />
                    ) : (isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
                </span>
                <span className="truncate font-mono">{node.name}</span>
            </button>
            {!isFile && isOpen && node.children && <div>{node.children.map(child => <FileTreeNode key={child.path} node={child} level={level + 1} activeFile={activeFile} onSelect={onSelect} />)}</div>}
        </div>
    );
};

const Builder: React.FC<BuilderProps> = ({ user }) => {
    const [stack, setStack] = useState<Stack>('react');
    const [isWizardOpen, setIsWizardOpen] = useState(true);
    
    const [sidebarTab, setSidebarTab] = useState<'files' | 'git' | 'db' | 'pkg' | 'snaps'>('files');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [rightPanelTab, setRightPanelTab] = useState<'chat' | 'preview'>('chat');
    const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
    
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
    const [model, setModel] = useState(ModelType.PRO_PREVIEW);
    const [useSearch, setUseSearch] = useState(true); // Enable search by default for up-to-date tools/libraries
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
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
    const [newDbType, setNewDbType] = useState<'firebase' | 'supabase' | 'neon'>('firebase');
    const [newDbConfig, setNewDbConfig] = useState<any>({});
    const [newPackage, setNewPackage] = useState('');

    const [iframeSrc, setIframeSrc] = useState('');
    const [previewKey, setPreviewKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<any>(null);
    const shellRef = useRef<Shell | null>(null);
    const fitAddonRef = useRef<any>(null);

    useEffect(() => {
        const storedProjects = localStorage.getItem('zee_projects');
        if (storedProjects) {
            const parsed = JSON.parse(storedProjects);
            setSavedProjects(parsed);
            const lastId = localStorage.getItem('zee_active_project_id');
            if (lastId) {
                const lastProj = parsed.find((p: SavedProject) => p.id === lastId);
                if (lastProj) loadProject(lastProj);
            }
        }
        
        // Check for saved GitHub token (from OAuth login)
        const savedGhToken = localStorage.getItem('zee_github_token');
        if (savedGhToken) {
            setGhToken(savedGhToken);
            connectGitHub(savedGhToken);
        }
    }, []);

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
                localStorage.setItem('zee_projects', JSON.stringify(newArr));
                return newArr;
            });
            localStorage.setItem('zee_active_project_id', currentProjectId);
            if (shellRef.current) shellRef.current.updateFiles(files);
            
            const pkg = files.find(f => f.name === 'package.json');
            if (pkg) {
                try { setDependencies(JSON.parse(pkg.content).dependencies || {}); } catch(e) {}
            }
        }
    }, [files, messages, dbConfigs, projectName, stack, currentProjectId, snapshots]);

    useLayoutEffect(() => {
        const initTimer = setTimeout(() => {
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
                }
            }
        }, 100);
        return () => clearTimeout(initTimer);
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

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const initProject = (type: Stack) => {
        setStack(type);
        setProjectName(`New ${type.toUpperCase()} App`);
        const newId = Date.now().toString();
        setCurrentProjectId(newId);
        setMessages([{ id: 'init', role: 'model', text: `Initialized ${type} project.`, timestamp: Date.now() }]);
        let initialFiles: ProjectFile[] = [];
        
        const pkgJson = { name: "app", version: "1.0.0", dependencies: { "react": "latest", "react-dom": "latest", "lucide-react": "latest" } };
        const tsConfig = { compilerOptions: { jsx: "react-jsx", target: "ES2020", moduleResolution: "node" } };

        if (type === 'react' || type === 'react-ts') {
            const isTs = type === 'react-ts';
            initialFiles = [
                { name: 'package.json', content: JSON.stringify(pkgJson, null, 2), language: 'json' },
                { name: 'public/index.html', content: '<div id="root"></div>', language: 'html' },
                { name: `src/App.${isTs?'tsx':'js'}`, content: `import React from 'react';\nimport { Sparkles } from 'lucide-react';\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">\n      <Sparkles className="w-12 h-12 text-blue-500 mb-4" />\n      <h1 className="text-3xl font-bold">Zee Builder</h1>\n      <p className="text-slate-400">Start editing to see magic happen.</p>\n    </div>\n  );\n}`, language: isTs?'typescript':'javascript' }
            ];
            if(isTs) initialFiles.push({ name: 'tsconfig.json', content: JSON.stringify(tsConfig,null,2), language: 'json' });
            setActiveFile(initialFiles[2].name);
        } else if (type === 'flutter') {
             initialFiles = [{ name: 'lib/main.dart', content: `import 'package:flutter/material.dart';\nvoid main() => runApp(const MyApp());\nclass MyApp extends StatelessWidget {\n  const MyApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      home: Scaffold(\n        appBar: AppBar(title: const Text('Zee Flutter')),\n        body: const Center(child: Text('Hello World')),\n      ),\n    );\n  }\n}`, language: 'dart' }];
             setActiveFile('lib/main.dart');
        } else if (type === 'vue') {
            initialFiles = [{ name: 'index.html', content: `<!DOCTYPE html><html><head><script src="https://unpkg.com/vue@3/dist/vue.global.js"></script></head><body><div id="app">{{ message }}</div><script>const { createApp } = Vue; createApp({ data() { return { message: 'Hello Vue!' } } }).mount('#app')</script></body></html>`, language: 'html' }];
            setActiveFile('index.html');
        } else if (type === 'node') {
             initialFiles = [
                 { name: 'package.json', content: JSON.stringify({ name: "node-app", version: "1.0.0", main: "index.js" }, null, 2), language: 'json' },
                 { name: 'index.js', content: `console.log("Hello Node.js");`, language: 'javascript' }
             ];
             setActiveFile('index.js');
        } else if (type === 'python') {
             initialFiles = [
                 { name: 'main.py', content: `print("Hello from Python!")`, language: 'python' },
                 { name: 'requirements.txt', content: ``, language: 'html' }
             ];
             setActiveFile('main.py');
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

    const deleteProject = (id: string) => {
        if (confirm("Are you sure you want to delete this project?")) {
            const newProjects = savedProjects.filter(p => p.id !== id);
            setSavedProjects(newProjects);
            localStorage.setItem('zee_projects', JSON.stringify(newProjects));
            if (currentProjectId === id) {
                setCurrentProjectId(null);
                setIsWizardOpen(true);
            }
        }
    };

    const createSnapshot = () => {
        const name = prompt("Name this checkpoint:", `Snapshot ${snapshots.length + 1}`);
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

    const restoreSnapshot = (snapshot: Snapshot) => {
        if (confirm(`Restore to checkpoint "${snapshot.name}"? Current unsaved changes will be lost.`)) {
            setHistoryStack(prev => [...prev, files]); // Save current before restoring
            setFiles(JSON.parse(JSON.stringify(snapshot.files)));
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `↺ Restored checkpoint: **${snapshot.name}**`, timestamp: Date.now() }]);
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
            alert(e.message);
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
                let detectedStack: Stack = 'html';
                if (repoFiles.some((f: any) => f.name.includes('package.json'))) detectedStack = 'react';
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
            alert('Clone failed: ' + e.message);
        } finally {
            setGhLoading(false);
        }
    };

    const pushToRepo = async () => {
        if (!ghOctokit || !selectedRepo) {
            alert('Please select a repository first');
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
            alert('Push failed: ' + e.message);
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
            alert('Failed to create repo: ' + e.message);
        } finally {
            setGhLoading(false);
        }
    };

    const pullFromRepo = async () => {
        if (!ghOctokit || !selectedRepo) return;
        if (!confirm('Pull latest changes? This will overwrite local files.')) return;
        await cloneRepo(selectedRepo.owner, selectedRepo.name);
    };

    const handleSendMessage = async () => {
        if ((!chatInput.trim() && !chatAttachment) || isGenerating) return;
        const userMsg: BuilderChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, attachment: chatAttachment || undefined, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setChatAttachment(null);
        setIsGenerating(true);
        setGenerationStatus('Thinking...');
        
        try {
            const snapshot = JSON.parse(JSON.stringify(files));
            const result = await generateProject([...messages, userMsg], stack, model, files, dbConfigs, useSearch);
            
            if (result.toolCall === 'generateLogo' || result.toolCall === 'generateImage') {
                setGenerationStatus('Generating asset...');
                const imgPrompt = result.explanation || userMsg.text;
                const response = await generateImage(imgPrompt, '1:1', '1K', ModelType.PRO_IMAGE);
                const parts = response?.candidates?.[0]?.content?.parts;
                if (parts && parts[0].inlineData) {
                    const base64 = parts[0].inlineData.data;
                    const fileName = `src/assets/${result.toolCall === 'generateLogo' ? 'logo' : 'image'}-${Date.now()}.png`;
                    const imageFile: ProjectFile = { name: fileName, content: `data:image/png;base64,${base64}`, language: 'image' };
                    setFiles([...files, imageFile]);
                    setMessages(prev => [...prev, { 
                        id: Date.now().toString(), role: 'model', text: `Generated asset: ${fileName}.`,
                        attachment: { name: fileName, mimeType: 'image/png', data: base64 }, timestamp: Date.now() 
                    }]);
                }
            } else if (result.files && result.files.length > 0) {
                setHistoryStack(prev => [...prev, snapshot]); 
                setRedoStack([]);
                const newFiles = [...files];
                result.files.forEach((rf: ProjectFile) => {
                    const idx = newFiles.findIndex(f => f.name === rf.name);
                    if (idx >= 0) newFiles[idx] = rf; else newFiles.push(rf);
                });
                setFiles(newFiles);
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: result.explanation || "Updated code.", timestamp: Date.now() }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: result.explanation || "No changes needed.", timestamp: Date.now() }]);
            }
        } catch (e: any) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Error: ${e.message}`, timestamp: Date.now() }]);
        } finally {
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
                        const base64 = await blobToBase64(audioBlob);
                        const transcript = await transcribeAudio(base64, 'audio/webm');
                        if (transcript) setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
                    } catch (error) { console.error(error); } finally { setIsTranscribingAudio(false); }
                };
                mediaRecorder.start();
                setIsRecording(true);
            } catch (error) { alert("Microphone access denied."); }
        }
    };

    const restoreCheckpoint = () => {
        if (historyStack.length === 0) return;
        const prev = historyStack[historyStack.length - 1];
        setRedoStack([...redoStack, files]);
        setFiles(prev);
        setHistoryStack(historyStack.slice(0, -1));
    };

    const handleAddPackage = (pkgName: string) => {
        if (!pkgName) return;
        const newDeps = { ...dependencies, [pkgName]: 'latest' };
        setDependencies(newDeps);
        const pkgFile = files.find(f => f.name === 'package.json');
        if (pkgFile) {
            try {
                const json = JSON.parse(pkgFile.content);
                json.dependencies = { ...json.dependencies, [pkgName]: 'latest' };
                const newFiles = files.map(f => f.name === 'package.json' ? { ...f, content: JSON.stringify(json, null, 2) } : f);
                setFiles(newFiles);
                if (shellRef.current) shellRef.current.log(`\x1b[32m+ ${pkgName}\x1b[0m`);
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
            let detectedStack: Stack = 'html';
            if (entries.some(e => e.endsWith('package.json'))) detectedStack = 'react';
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
        } catch (error: any) { alert("Failed to import: " + error.message); }
    };

    const updateWebPreview = () => {
        if (stack === 'flutter' || stack === 'python') return;
        setIsRefreshing(true);
        
        const blobs: Record<string, string> = {};
        files.forEach(f => {
            const isJs = f.name.match(/\.(js|jsx|ts|tsx)$/);
            const isCss = f.name.endsWith('.css');
            const isImage = f.name.match(/\.(png|jpg|jpeg|svg|gif)$/);
            if (isJs || isCss) {
                blobs[f.name] = URL.createObjectURL(new Blob([f.content], { type: isCss ? 'text/css' : 'application/javascript' }));
            } else if (isImage) {
                const jsModuleContent = `export default "${f.content}";`;
                blobs[f.name] = URL.createObjectURL(new Blob([jsModuleContent], { type: 'application/javascript' }));
            }
        });

        const processedBlobs: Record<string, string> = {};
        files.forEach(f => {
            if (f.name.match(/\.(js|jsx|ts|tsx)$/)) {
                let content = f.content;
                content = content.replace(/from\s+['"](\..*?)['"]/g, (match, path) => {
                    const cleanPath = path.replace(/^\.\//, 'src/').replace(/\.(js|jsx|ts|tsx)$/, '');
                    let found = files.find(x => x.name.startsWith(cleanPath) || x.name === cleanPath);
                    if (!found) {
                        const extensions = ['.png', '.jpg', '.jpeg', '.svg', '.css'];
                        for (const ext of extensions) {
                            const trialPath = cleanPath.endsWith(ext) ? cleanPath : cleanPath + ext;
                            found = files.find(x => x.name.endsWith(trialPath.replace('src/', '')));
                            if (found) break;
                        }
                    }
                    return found && blobs[found.name] ? `from "${blobs[found.name]}"` : match;
                });
                processedBlobs[f.name] = URL.createObjectURL(new Blob([content], { type: 'application/javascript' }));
            }
        });

        const importMap = {
            imports: {
                "react": "https://esm.sh/react@18.2.0",
                "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
                "vue": "https://esm.sh/vue@3.3.4",
                ...Object.keys(dependencies).reduce((acc, key) => ({ ...acc, [key]: `https://esm.sh/${key}` }), {})
            }
        };

        const entry = files.find(f => f.name.match(/src\/(App|main)\.(js|jsx|ts|tsx)$/))?.name;
        const entryUrl = entry ? processedBlobs[entry] || blobs[entry] : '';

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <script type="importmap">${JSON.stringify(importMap)}</script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>body { background-color: #ffffff; }</style>
        </head>
        <body>
            <div id="root"></div>
            <div id="app"></div>
            <script>
                window.onerror = function(msg, url, line) {
                    document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace">RUNTIME ERROR: ' + msg + '<br>Line: ' + line + '</div>';
                };
            </script>
            <script type="text/babel" data-type="module" data-presets="react,typescript">
                ${stack === 'vue' ? '' : `
                import React from 'react';
                import { createRoot } from 'react-dom/client';
                import App from '${entryUrl}';
                try {
                    const root = createRoot(document.getElementById('root'));
                    root.render(<App />);
                } catch (e) {
                    console.error(e);
                }
                `}
            </script>
        </body>
        </html>`;

        const finalBlob = new Blob([html], {type: 'text/html'});
        setIframeSrc(URL.createObjectURL(finalBlob));
        setPreviewKey(p => p + 1);
        setTimeout(() => setIsRefreshing(false), 500);
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

    // Inlined Panels
    const renderPreviewPanel = (fullScreen = false) => (
        <div className={`flex flex-col bg-white h-full relative ${fullScreen ? 'fixed inset-0 z-50' : ''}`}>
            <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
                <span className="text-xs text-slate-500 flex items-center font-bold">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                    Live Preview
                </span>
                <div className="flex items-center space-x-2">
                    <button onClick={updateWebPreview} className="p-1 hover:bg-slate-200 rounded" title="Refresh">
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setIsFullScreenPreview(!isFullScreenPreview)} className="p-1 hover:bg-slate-200 rounded" title={fullScreen ? "Minimize" : "Maximize"}>
                        {fullScreen ? <Minimize2 className="w-4 h-4 text-slate-500"/> : <Maximize2 className="w-4 h-4 text-slate-500"/>}
                    </button>
                </div>
            </div>
            {stack === 'flutter' || stack === 'python' ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                    <Smartphone className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm mb-4">{stack === 'python' ? 'Python Runtime (Console Only)' : 'Flutter Preview requires Zapp!'}</p>
                    {stack === 'flutter' && <a href="https://zapp.run" target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-500">Open Compiler</a>}
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
                        <option value={ModelType.PRO_PREVIEW}>Pro</option>
                        <option value={ModelType.FLASH}>Flash</option>
                        <option value={ModelType.FLASH_LITE}>Lite</option>
                    </select>
                    <button onClick={() => setUseSearch(!useSearch)} className={`p-1.5 rounded ${useSearch ? 'text-blue-500 bg-blue-500/10' : 'text-slate-500 hover:bg-slate-800'}`} title="Search Web">
                        <Globe className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
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
                {isGenerating && <div className="flex items-center text-xs text-blue-400 animate-pulse"><Loader2 className="w-3 h-3 animate-spin mr-2" />{generationStatus}</div>}
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
                    <label className="p-3 cursor-pointer text-slate-500 hover:text-blue-500 hover:bg-slate-900 transition-colors border-r border-slate-800">
                        <Paperclip className="w-4 h-4" />
                        <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) blobToBase64(f).then(d => setChatAttachment({ name: f.name, mimeType: f.type, data: d })) }} />
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
                {chatAttachment && <div className="mt-1 text-[10px] text-slate-500 flex items-center justify-between px-1"><span>Attached: {chatAttachment.name}</span><button onClick={() => setChatAttachment(null)} className="text-red-500 hover:underline">Remove</button></div>}
            </div>
        </div>
    );

    if (isWizardOpen) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl p-8 animate-in zoom-in-95 duration-200 relative">
                    <button 
                        onClick={() => setIsWizardOpen(false)} 
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-slate-800 rounded-full hover:bg-slate-700 transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-3xl font-bold text-white mb-2">Create Project</h2>
                    <p className="text-slate-400 mb-8">Choose a stack to get started.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { id: 'react', label: 'React', icon: CodeIcon, color: 'text-blue-500' },
                            { id: 'react-ts', label: 'React TS', icon: FileType, color: 'text-blue-400' },
                            { id: 'vue', label: 'Vue.js', icon: Layers, color: 'text-green-500' },
                            { id: 'flutter', label: 'Flutter', icon: Smartphone, color: 'text-cyan-500' },
                            { id: 'python', label: 'Python', icon: TerminalIcon, color: 'text-yellow-500' },
                            { id: 'html', label: 'HTML/JS', icon: Globe, color: 'text-orange-500' },
                            { id: 'node', label: 'Node.js', icon: TerminalIcon, color: 'text-green-600' },
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
                    </div>
                    
                    <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

                    {/* Import Project Button */}
                    <label className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer" title="Import ZIP Project">
                        <UploadCloud className="w-4 h-4" />
                        <input type="file" accept=".zip" className="hidden" onChange={handleImportProject} />
                    </label>

                    <button onClick={handleDownload} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors" title="Export">
                        <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsWizardOpen(true)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors shadow-lg shadow-blue-900/20">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Left Sidebar */}
                <div className={`${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 flex-shrink-0`}>
                    <div className="flex border-b border-slate-800">
                        {[{id:'files',icon:File}, {id:'git',icon:Github}, {id:'db',icon:Database}, {id:'pkg',icon:PackageIcon}, {id:'snaps', icon:History}].map((t:any) => (
                            <button key={t.id} onClick={() => setSidebarTab(t.id)} className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${sidebarTab === t.id ? 'border-blue-500 text-blue-500 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}><t.icon className="w-4 h-4"/></button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {sidebarTab === 'files' && <div className="space-y-1 pt-2">{getFileTree(files).map(n => <FileTreeNode key={n.path} node={n} level={0} activeFile={activeFile} onSelect={setActiveFile} />)}</div>}
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
                                            {ghLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Github className="w-3 h-3"/>}
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
                                                    if(!selectedRepo) return alert('Select a repository first');
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
                                <h3 className="text-xs font-bold text-slate-500 uppercase">Project Databases</h3>
                                <p className="text-[10px] text-slate-600">Connect databases to this project. Credentials are injected into generated code.</p>
                                {dbConfigs.map((db,i) => (
                                    <div key={i} className="bg-slate-800 p-3 rounded text-xs text-white space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="capitalize font-bold flex items-center">
                                                <Database className="w-3 h-3 mr-1.5 text-green-500"/>
                                                {db.name || db.type}
                                            </span>
                                            <Trash2 className="w-3 h-3 cursor-pointer text-red-400 hover:text-red-300" onClick={()=>{const n=[...dbConfigs];n.splice(i,1);setDbConfigs(n)}}/>
                                        </div>
                                        {db.config?.url && <p className="text-[10px] text-slate-400 truncate">{db.config.url}</p>}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${db.connected ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                                            {db.connected ? 'Connected' : 'Not Connected'}
                                        </span>
                                    </div>
                                ))}
                                <div className="pt-3 border-t border-slate-800 space-y-2">
                                    <h4 className="text-[10px] text-slate-400 font-bold uppercase">Add Connection</h4>
                                    <select 
                                        value={newDbType}
                                        onChange={e=>setNewDbType(e.target.value as any)} 
                                        className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800"
                                    >
                                        <option value="supabase">Supabase</option>
                                        <option value="firebase">Firebase</option>
                                        <option value="neon">Neon Postgres</option>
                                    </select>
                                    <input 
                                        type="text"
                                        value={newDbConfig.name || ''}
                                        onChange={e => setNewDbConfig({...newDbConfig, name: e.target.value})}
                                        placeholder="Connection Name"
                                        className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800"
                                    />
                                    <input 
                                        type="text"
                                        value={newDbConfig.url || ''}
                                        onChange={e => setNewDbConfig({...newDbConfig, url: e.target.value})}
                                        placeholder={newDbType === 'supabase' ? 'Supabase URL' : newDbType === 'firebase' ? 'Firebase Project ID' : 'Connection String'}
                                        className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800"
                                    />
                                    <input 
                                        type="password"
                                        value={newDbConfig.key || ''}
                                        onChange={e => setNewDbConfig({...newDbConfig, key: e.target.value})}
                                        placeholder={newDbType === 'supabase' ? 'Anon Key' : newDbType === 'firebase' ? 'API Key' : 'Password'}
                                        className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800"
                                    />
                                    <button 
                                        onClick={()=>{
                                            if (!newDbConfig.url) return alert('Please enter connection details');
                                            setDbConfigs([...dbConfigs, {
                                                type: newDbType, 
                                                name: newDbConfig.name || newDbType, 
                                                connected: true, 
                                                config: { url: newDbConfig.url, key: newDbConfig.key }
                                            }]);
                                            setNewDbConfig({});
                                            setMessages(prev => [...prev, { 
                                                id: Date.now().toString(), 
                                                role: 'model', 
                                                text: `✅ **${newDbType} database connected!** I'll use these credentials when generating backend code.`, 
                                                timestamp: Date.now() 
                                            }]);
                                        }} 
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded font-bold transition-colors"
                                    >
                                        Connect Database
                                    </button>
                                </div>
                            </div>
                        )}
                        {sidebarTab === 'pkg' && (
                            <div className="p-2 space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase">Dependencies</h3>
                                <div className="space-y-1">
                                    {Object.keys(dependencies).map(k => <div key={k} className="text-xs text-slate-300 bg-slate-800 p-1.5 rounded flex justify-between"><span>{k}</span><span className="opacity-50">latest</span></div>)}
                                </div>
                                <input value={newPackage} onChange={e=>setNewPackage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAddPackage(newPackage)} placeholder="npm install..." className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"/>
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
                                                <span className="text-[10px] text-slate-500">{new Date(s.timestamp).toLocaleTimeString()}</span>
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

                <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 bg-[#0f172a]">
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

                <div className="w-full md:w-[400px] lg:w-[450px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
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
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        {rightPanelTab === 'chat' ? renderChatPanel() : renderPreviewPanel()}
                    </div>
                </div>
            </div>

            {showProjectModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
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
            )}
        </div>
    );
};

export default Builder;
