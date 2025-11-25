
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { generateProject, blobToBase64, generateImage, transcribeAudio, ensureApiKey } from '../services/geminiService';
import { githubService } from '../services/githubService';
import { DatabaseConfig, User, ModelType, ProjectFile, Stack, BuilderChatMessage, SavedProject, FileAttachment } from '../types';
import { 
    Code as CodeIcon, Download, Plus, Trash2, Github, Bot, Send, Loader2,
    File, RefreshCw, Terminal as TerminalIcon, X, Sidebar,
    RotateCcw, Image, FileCode, ChevronRight, ChevronDown, Database, Package as PackageIcon,
    Smartphone, Layers, Globe, Paperclip, MonitorPlay,
    Undo2, Redo2, Play, FileType, Eye, ArrowLeftRight, Check, AlertCircle, Maximize2, Minimize2, MessageSquare,
    Mic, MicOff, UploadCloud
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

// --- Diff View ---
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

// --- Shell Emulator ---
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
            case 'help': this.term.writeln('Commands: ls, cat, npm install <pkg>, node, clear'); break;
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
    // --- State ---
    const [stack, setStack] = useState<Stack>('react');
    const [isWizardOpen, setIsWizardOpen] = useState(true);
    
    // Layout State
    const [sidebarTab, setSidebarTab] = useState<'files' | 'git' | 'db' | 'pkg'>('files');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [rightPanelTab, setRightPanelTab] = useState<'chat' | 'preview'>('chat');
    const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
    
    // Project
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [activeFile, setActiveFile] = useState<string>('');
    const [projectName, setProjectName] = useState('Untitled Project');
    const [showProjectModal, setShowProjectModal] = useState(false);
    
    // History
    const [historyStack, setHistoryStack] = useState<ProjectFile[][]>([]);
    const [redoStack, setRedoStack] = useState<ProjectFile[][]>([]);

    // Chat
    const [messages, setMessages] = useState<BuilderChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatAttachment, setChatAttachment] = useState<FileAttachment | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('');
    const [model, setModel] = useState(ModelType.PRO_PREVIEW);
    const [useSearch, setUseSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Audio Recording
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Tools
    const [ghToken, setGhToken] = useState('');
    const [ghUser, setGhUser] = useState<any>(null);
    const [dependencies, setDependencies] = useState<{[key: string]: string}>({});
    const [dbConfigs, setDbConfigs] = useState<DatabaseConfig[]>([]);
    const [newDbType, setNewDbType] = useState<'firebase' | 'supabase' | 'neon'>('firebase');
    const [newDbConfig, setNewDbConfig] = useState<any>({});
    const [newPackage, setNewPackage] = useState('');

    // Preview & Terminal
    const [iframeSrc, setIframeSrc] = useState('');
    const [previewKey, setPreviewKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<any>(null);
    const shellRef = useRef<Shell | null>(null);
    const fitAddonRef = useRef<any>(null);

    // --- Initialization ---

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
    }, []);

    useEffect(() => {
        if (currentProjectId) {
            const p: SavedProject = {
                id: currentProjectId, name: projectName, stack, files, lastModified: Date.now(), dbConfigs, messages
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
    }, [files, messages, dbConfigs, projectName, stack, currentProjectId]);

    // Terminal Init
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

                    term.write('Welcome to Zee Terminal. Type "help" for commands.\r\n');
                    shell.prompt();
                    
                    try {
                        fitAddon.fit();
                    } catch (e) {}
                }
            }
        }, 100);
        return () => clearTimeout(initTimer);
    }, []);

    // Terminal Resize Trigger
    useEffect(() => {
        const t = setTimeout(() => {
            if (fitAddonRef.current && isTerminalOpen && terminalRef.current) {
                try { fitAddonRef.current.fit(); } catch(e){}
            }
        }, 50);
        return () => clearTimeout(t);
    }, [isTerminalOpen, isSidebarCollapsed, window.innerWidth]);

    // Auto Preview Refresh
    useEffect(() => {
        if (files.length > 0 && (rightPanelTab === 'preview' || isFullScreenPreview)) {
            const t = setTimeout(updateWebPreview, 800);
            return () => clearTimeout(t);
        }
    }, [files, rightPanelTab, isFullScreenPreview]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // --- Logic ---

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
        } else {
            initialFiles = [{ name: 'index.html', content: '<html><body><h1>Hello World</h1></body></html>', language: 'html'}];
            setActiveFile('index.html');
        }

        setFiles(initialFiles);
        setHistoryStack([]);
        setRedoStack([]);
        setIsWizardOpen(false);
    };

    const loadProject = (p: SavedProject) => {
        setCurrentProjectId(p.id);
        setProjectName(p.name);
        setStack(p.stack);
        setFiles(p.files);
        setDbConfigs(p.dbConfigs || []);
        setMessages(p.messages || []);
        setActiveFile(p.files[0]?.name || '');
        setIsWizardOpen(false);
        setShowProjectModal(false);
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
            const snapshot = [...files]; 
            const result = await generateProject([...messages, userMsg], stack, model, files, dbConfigs, useSearch);
            
            // Handle Image/Logo Tool Calls
            if (result.toolCall === 'generateLogo' || result.toolCall === 'generateImage') {
                setGenerationStatus('Generating asset...');
                const imgPrompt = result.explanation || userMsg.text;
                const response = await generateImage(imgPrompt, '1:1', '1K', ModelType.PRO_IMAGE);
                const parts = response?.candidates?.[0]?.content?.parts;
                
                if (parts && parts.length > 0 && parts[0].inlineData) {
                    const base64 = parts[0].inlineData.data;
                    const fileName = `src/assets/${result.toolCall === 'generateLogo' ? 'logo' : 'image'}-${Date.now()}.png`;
                    
                    const imageFile: ProjectFile = {
                        name: fileName,
                        content: `data:image/png;base64,${base64}`,
                        language: 'image'
                    };
                    
                    const newFiles = [...files, imageFile];
                    setFiles(newFiles);
                    setMessages(prev => [...prev, { 
                        id: Date.now().toString(), 
                        role: 'model', 
                        text: `Generated ${result.toolCall === 'generateLogo' ? 'logo' : 'image'} and saved to ${fileName}.`,
                        attachment: { name: fileName, mimeType: 'image/png', data: base64 },
                        timestamp: Date.now() 
                    }]);
                } else {
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Failed to generate image.", timestamp: Date.now() }]);
                }
            } else if (result.files && result.files.length > 0) {
                setHistoryStack(prev => [...prev, snapshot]); 
                setRedoStack([]);
                
                const newFiles = [...files];
                result.files.forEach((rf: ProjectFile) => {
                    const idx = newFiles.findIndex(f => f.name === rf.name);
                    if (idx >= 0) newFiles[idx] = rf;
                    else newFiles.push(rf);
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

    // Audio Recording Logic
    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
                setIsTranscribingAudio(true);
            }
        } else {
            // Start recording
            try {
                await ensureApiKey();
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    
                    // Stop stream tracks
                    stream.getTracks().forEach(track => track.stop());

                    try {
                        const base64 = await blobToBase64(audioBlob);
                        // Use Flash model for quick transcription
                        const transcript = await transcribeAudio(base64, 'audio/webm');
                        if (transcript) {
                            setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
                        }
                    } catch (error) {
                        console.error("Transcription failed:", error);
                        alert("Failed to transcribe audio.");
                    } finally {
                        setIsTranscribingAudio(false);
                    }
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (error) {
                console.error("Error accessing microphone:", error);
                alert("Could not access microphone. Please check permissions.");
            }
        }
    };

    const restoreCheckpoint = () => {
        if (historyStack.length === 0) return;
        const prev = historyStack[historyStack.length - 1];
        setRedoStack([...redoStack, files]);
        setFiles(prev);
        setHistoryStack(historyStack.slice(0, -1));
        if (shellRef.current) shellRef.current.log('\x1b[33mRestored previous state.\x1b[0m');
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

    // --- Project Import Logic ---
    const handleImportProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            const newFiles: ProjectFile[] = [];
            
            const entries = Object.keys(contents.files);
            
            // Check for package.json to guess stack, default to html
            let detectedStack: Stack = 'html';
            if (entries.some(e => e.endsWith('package.json'))) detectedStack = 'react'; // simplified assumption

            for (const filename of entries) {
                const fileData = contents.files[filename];
                if (fileData.dir) continue;

                // Filter supported extensions
                if (filename.match(/\.(js|jsx|ts|tsx|html|css|json|md)$/i)) {
                    const content = await fileData.async('string');
                    // Determine language
                    let lang: ProjectFile['language'] = 'javascript';
                    if (filename.endsWith('.html')) lang = 'html';
                    else if (filename.endsWith('.css')) lang = 'css';
                    else if (filename.endsWith('.json')) lang = 'json';
                    else if (filename.match(/\.tsx?$/)) lang = 'typescript';

                    newFiles.push({ name: filename, content, language: lang });
                }
            }

            if (newFiles.length > 0) {
                setFiles(newFiles);
                setStack(detectedStack);
                setProjectName(file.name.replace(/\.zip$/i, ''));
                const newId = Date.now().toString();
                setCurrentProjectId(newId);
                setHistoryStack([]);
                setRedoStack([]);
                setMessages([{ id: 'import', role: 'model', text: `Imported project: ${file.name}`, timestamp: Date.now() }]);
                
                // Try to find a good active file
                const entry = newFiles.find(f => f.name.match(/src\/(App|main)\./) || f.name === 'index.html');
                if (entry) setActiveFile(entry.name);
                else setActiveFile(newFiles[0].name);

                updateWebPreview();
                alert("Project imported successfully!");
            } else {
                alert("No supported files found in the ZIP.");
            }

        } catch (error: any) {
            console.error("Import failed:", error);
            alert("Failed to import project: " + error.message);
        }
    };

    const updateWebPreview = () => {
        if (stack === 'flutter') return;
        setIsRefreshing(true);
        
        // 1. Blobs
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

        // 2. Resolvers
        const processedBlobs: Record<string, string> = {};
        files.forEach(f => {
            if (f.name.match(/\.(js|jsx|ts|tsx)$/)) {
                let content = f.content;
                content = content.replace(/from\s+['"](\..*?)['"]/g, (match, path) => {
                    const cleanPath = path.replace(/^\.\//, 'src/').replace(/\.(js|jsx|ts|tsx)$/, '');
                    
                    // Try finding JS match
                    let found = files.find(x => x.name.startsWith(cleanPath) || x.name === cleanPath);
                    
                    // If not found, try extensions for images/css
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

        // 3. Import Map
        const importMap = {
            imports: {
                "react": "https://esm.sh/react@18.2.0",
                "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
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
            <script>
                window.onerror = function(msg, url, line) {
                    document.body.innerHTML = '<div style="color:red;padding:20px;font-family:monospace">RUNTIME ERROR: ' + msg + '<br>Line: ' + line + '</div>';
                };
            </script>
            <script type="text/babel" data-type="module" data-presets="react,typescript">
                import React from 'react';
                import { createRoot } from 'react-dom/client';
                import App from '${entryUrl}';
                try {
                    const root = createRoot(document.getElementById('root'));
                    root.render(<App />);
                } catch (e) {
                    document.body.innerHTML = '<div style="color:red;padding:20px;">RENDER ERROR: ' + e.message + '</div>';
                }
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

    // Inlined Panels to prevent re-renders on input change
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
            {stack === 'flutter' ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
                    <Smartphone className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm mb-4">Flutter Preview requires Zapp!</p>
                    <a href="https://zapp.run" target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-blue-500">Open Compiler</a>
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
                            <div className="whitespace-pre-wrap">{m.text}</div>
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
                    <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (window.innerWidth < 768) return; if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} placeholder="Ask Zee to build..." className="flex-1 bg-transparent px-3 py-3 text-xs text-white focus:outline-none resize-none text-sm min-h-[50px]" rows={1} />
                    <button onClick={handleSendMessage} disabled={isGenerating} className="p-3 text-blue-500 hover:text-white hover:bg-blue-600 transition-colors">
                        <Send className="w-4 h-4" />
                    </button>
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
                            { id: 'flutter', label: 'Flutter', icon: Smartphone, color: 'text-cyan-500' },
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
                        {[{id:'files',icon:File}, {id:'git',icon:Github}, {id:'db',icon:Database}, {id:'pkg',icon:PackageIcon}].map((t:any) => (
                            <button key={t.id} onClick={() => setSidebarTab(t.id)} className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${sidebarTab === t.id ? 'border-blue-500 text-blue-500 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}><t.icon className="w-4 h-4"/></button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {sidebarTab === 'files' && <div className="space-y-1 pt-2">{getFileTree(files).map(n => <FileTreeNode key={n.path} node={n} level={0} activeFile={activeFile} onSelect={setActiveFile} />)}</div>}
                        {sidebarTab === 'git' && (
                            <div className="p-2 space-y-3">
                                <input type="password" value={ghToken} onChange={e=>setGhToken(e.target.value)} placeholder="GitHub Token" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"/>
                                <button onClick={async()=>{try{await githubService.connect(ghToken);setGhUser({login:'Connected'});}catch(e:any){alert(e.message)}}} className="w-full bg-slate-800 text-white text-xs py-1 rounded hover:bg-slate-700">Connect</button>
                                {ghUser && <p className="text-xs text-green-500 flex items-center"><Check className="w-3 h-3 mr-1"/> Logged in</p>}
                            </div>
                        )}
                        {sidebarTab === 'db' && (
                            <div className="p-2 space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase">Connections</h3>
                                {dbConfigs.map((db,i) => (
                                    <div key={i} className="bg-slate-800 p-2 rounded text-xs text-white mb-2 flex justify-between">
                                        <span className="capitalize">{db.type}</span>
                                        <Trash2 className="w-3 h-3 cursor-pointer text-red-400" onClick={()=>{const n=[...dbConfigs];n.splice(i,1);setDbConfigs(n)}}/>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-slate-800 space-y-2">
                                    <select onChange={e=>setNewDbType(e.target.value as any)} className="w-full bg-slate-950 text-white text-xs p-2 rounded border border-slate-800"><option value="firebase">Firebase</option><option value="supabase">Supabase</option></select>
                                    <button onClick={()=>setDbConfigs([...dbConfigs, {type:newDbType, name:newDbType, connected:true, config:{}}])} className="w-full bg-blue-600 text-white text-xs py-1.5 rounded font-bold">Add</button>
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
        </div>
    );
};

export default Builder;
