
import React, { useState, useRef, useEffect } from 'react';
import { createChatSession, transcribeAudio, blobToBase64, ensureApiKey } from '../services/geminiService';
import { ChatMessage, ModelType, ChatSession, FileAttachment, Task } from '../types';
import { 
    Send, 
    Map, 
    MessageSquare, 
    Trash2, 
    Copy, 
    Bot,
    User as UserIcon,
    Loader2,
    Globe,
    History,
    Plus,
    X,
    Clock,
    Paperclip,
    FileText,
    BrainCircuit,
    Mic,
    MicOff,
    CheckCircle2
} from 'lucide-react';

const MarkdownRenderer = ({ content }: { content: string }) => {
    if (!content) return null;
    const parts = content.split(/(```[\w-]*\n[\s\S]*?```)/g);

    return (
        <div className="space-y-3 text-sm leading-relaxed">
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    const match = part.match(/^```([\w-]*)\n([\s\S]*?)```$/);
                    const lang = match ? match[1] : 'code';
                    const code = match ? match[2] : part.slice(3, -3);

                    return (
                        <div key={index} className="my-3 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden group relative">
                            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                                <span className="text-xs font-mono text-slate-400">{lang}</span>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(code)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                    title="Copy Code"
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="p-4 overflow-x-auto custom-scrollbar">
                                <pre className="font-mono text-xs text-blue-100 whitespace-pre">{code}</pre>
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
                                        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-bold text-white">{p.slice(2, -2)}</strong>;
                                        if (p.startsWith('*') && p.endsWith('*')) return <em key={i} className="italic">{p.slice(1, -1)}</em>;
                                        if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-blue-300">{p.slice(1, -1)}</code>;
                                        return p;
                                    });
                                };
                                return (
                                    <div key={lineIdx} className={`min-h-[1.5em] ${isBullet ? 'flex items-start ml-4 mb-1' : 'mb-1'}`}>
                                        {isBullet && <span className="mr-2 text-slate-400 mt-1.5 text-[10px]">●</span>}
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

const ChatInterface: React.FC = () => {
    const [currentSessionId, setCurrentSessionId] = useState<string>('');
    const [savedSessions, setSavedSessions] = useState<ChatSession[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachment, setAttachment] = useState<FileAttachment | null>(null);
    
    const [model, setModel] = useState(ModelType.FLASH);
    const [isThinking, setIsThinking] = useState(false);
    const [useMaps, setUseMaps] = useState(false);
    const [useSearch, setUseSearch] = useState(false);

    // Audio Recording
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const chatSessionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Determine if tools are supported
    const supportsTools = model !== ModelType.FLASH_LITE;

    useEffect(() => {
        const stored = localStorage.getItem('zee_chat_sessions');
        if (stored) setSavedSessions(JSON.parse(stored));
        
        // Check for pending prompt from homepage
        const pending = localStorage.getItem('zee_pending_prompt');
        if (pending) {
            localStorage.removeItem('zee_pending_prompt');
            startNewSession(pending);
        } else if (!currentSessionId) {
            startNewSession();
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0 && currentSessionId) saveCurrentSession();
    }, [messages, model]);

    // If switching to a model that doesn't support tools, disable them
    useEffect(() => {
        if (!supportsTools) {
            setUseMaps(false);
            setUseSearch(false);
        }
        initChat();
    }, [model, isThinking, useMaps, useSearch]);

    useEffect(() => { 
        // Scroll within the messages container only, not the whole page
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const startNewSession = (initialPrompt?: string) => {
        const newId = Date.now().toString();
        setCurrentSessionId(newId);
        setMessages([]);
        setIsHistoryOpen(false);
        setAttachment(null);
        chatSessionRef.current = null;
        initChat().then(() => {
            if (initialPrompt) {
                handleSend(initialPrompt);
            }
        });
    };

    const loadSession = (session: ChatSession) => {
        setCurrentSessionId(session.id);
        setMessages(session.messages);
        setModel(session.model);
        setIsHistoryOpen(false);
        setTimeout(() => initChat(), 100);
    };

    const saveCurrentSession = () => {
        if (messages.length === 0) return;
        const firstUserMsg = messages.find(m => m.role === 'user');
        const title = firstUserMsg ? (firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '')) : 'New Conversation';
        const updatedSession: ChatSession = { id: currentSessionId, title, messages, updatedAt: Date.now(), model };
        setSavedSessions(prev => {
            const existingIdx = prev.findIndex(s => s.id === currentSessionId);
            let newSessions = existingIdx >= 0 ? [...prev] : [updatedSession, ...prev];
            if (existingIdx >= 0) newSessions[existingIdx] = updatedSession;
            localStorage.setItem('zee_chat_sessions', JSON.stringify(newSessions));
            return newSessions;
        });
    };

    const deleteSession = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        (window as any).swal({
            title: "Delete Conversation?",
            text: "This conversation will be permanently deleted.",
            icon: "warning",
            buttons: ["Cancel", "Delete"],
            dangerMode: true,
        }).then((willDelete: boolean) => {
            if (willDelete) {
                const newSessions = savedSessions.filter(s => s.id !== id);
                setSavedSessions(newSessions);
                localStorage.setItem('zee_chat_sessions', JSON.stringify(newSessions));
                if (currentSessionId === id) startNewSession();
            }
        });
    };

    const initChat = async () => {
        const history = messages.map(m => {
            const parts: any[] = [];
            if (m.attachment) parts.push({ inlineData: { data: m.attachment.data, mimeType: m.attachment.mimeType } });
            parts.push({ text: m.text });
            return { role: m.role, parts };
        });
        chatSessionRef.current = await createChatSession(model, history, isThinking, useMaps, useSearch);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await blobToBase64(file);
                setAttachment({ name: file.name, mimeType: file.type, data: base64 });
            } catch (error) { console.error("File upload error:", error); }
        }
    };

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if ((!textToSend.trim() && !attachment) || isLoading) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, attachment: attachment ? attachment : undefined };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setAttachment(null);
        setIsLoading(true);

        // --- HANDLE @TASK COMMAND ---
        // Format: @task Title | Description | Priority
        if (textToSend.trim().toLowerCase().startsWith('@task')) {
            setTimeout(() => {
                try {
                    const content = textToSend.replace(/^@task\s*/i, '');
                    const parts = content.split('|').map(p => p.trim());
                    
                    if (parts.length === 0 || !parts[0]) throw new Error("Task title is required.");

                    const title = parts[0];
                    const description = parts[1] || "No description provided.";
                    // Simple fuzzy match for priority
                    const pInput = (parts[2] || 'medium').toLowerCase();
                    const priority: 'low'|'medium'|'high' = pInput.includes('high') ? 'high' : pInput.includes('low') ? 'low' : 'medium';

                    const newTask: Task = {
                        id: Date.now().toString(),
                        title,
                        description,
                        status: 'todo',
                        priority,
                        createdAt: Date.now()
                    };

                    // Save to local storage (TaskBoard sync)
                    const existingTasksStr = localStorage.getItem('zee_tasks');
                    const existingTasks: Task[] = existingTasksStr ? JSON.parse(existingTasksStr) : [];
                    localStorage.setItem('zee_tasks', JSON.stringify([...existingTasks, newTask]));

                    const botMsg: ChatMessage = { 
                        id: (Date.now() + 1).toString(), 
                        role: 'model', 
                        text: `✅ **Task Created Successfully!**\n\n**Title:** ${title}\n**Description:** ${description}\n**Priority:** ${priority.toUpperCase()}\n\nI've added this to your Task Board.` 
                    };
                    setMessages(prev => [...prev, botMsg]);
                } catch (e: any) {
                    setMessages(prev => [...prev, { 
                        id: (Date.now() + 1).toString(), 
                        role: 'model', 
                        text: `❌ **Could not create task.**\n\nPlease use the format: \`@task Title | Description | Priority\`\nExample: \`@task Fix Login | Auth bug on mobile | High\`` 
                    }]);
                } finally {
                    setIsLoading(false);
                }
            }, 600); // Simulate processing delay
            return;
        }

        try {
            const performSend = async (text: string, retry = false): Promise<any> => {
                try {
                    if (!chatSessionRef.current || retry) await initChat();
                    return await chatSessionRef.current.sendMessage({ message: text || ' ' });
                } catch (error: any) {
                    if ((error?.toString().includes("403") || error?.toString().includes("404")) && !retry) {
                        if (window.aistudio && window.aistudio.openSelectKey) {
                            await window.aistudio.openSelectKey();
                            return await performSend(text, true);
                        }
                    }
                    throw error;
                }
            };

            let result = await performSend(userMsg.text);
            const responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text || "Processed.";
            const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, groundingUrls: result?.candidates?.[0]?.groundingMetadata?.groundingChunks, isThinking: isThinking };
            setMessages(prev => [...prev, botMsg]);
        } catch (error: any) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Error: " + (error.message || "Connection Failed") }]);
        } finally { setIsLoading(false); }
    };

    // Audio Recording Logic
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

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    stream.getTracks().forEach(track => track.stop());

                    try {
                        const base64 = await blobToBase64(audioBlob);
                        const transcript = await transcribeAudio(base64, 'audio/webm');
                        if (transcript) {
                            setInput(prev => prev + (prev ? ' ' : '') + transcript);
                        }
                    } catch (error) {
                        console.error("Transcription failed:", error);
                        (window as any).swal("Transcription Failed", "Failed to transcribe audio. Please try again.", "error");
                    } finally {
                        setIsTranscribingAudio(false);
                    }
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (error) {
                console.error("Error accessing microphone:", error);
                (window as any).swal("Microphone Error", "Could not access microphone. Please check permissions.", "error");
            }
        }
    };

    return (
        <div className="h-[calc(100vh-10rem)] flex gap-4 p-0 overflow-hidden">
            <div className={`flex-shrink-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-xl transition-all duration-300 flex flex-col ${isHistoryOpen ? 'w-64' : 'w-0 opacity-0 pointer-events-none'} overflow-hidden absolute z-20 h-full md:static`}>
                <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center"><History className="w-4 h-4 mr-2" /> History</h3>
                    <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-2"><button onClick={() => startNewSession()} className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold mb-2 transition-colors"><Plus className="w-4 h-4 mr-2" /> New Chat</button></div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {savedSessions.map(session => (
                        <div key={session.id} onClick={() => loadSession(session)} className={`p-3 rounded-lg text-sm cursor-pointer group flex items-center justify-between ${currentSessionId === session.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent'}`}>
                            <div className="flex flex-col min-w-0"><span className="font-medium truncate text-slate-700 dark:text-slate-300">{session.title}</span><span className="text-[10px] text-slate-400 flex items-center mt-1"><Clock className="w-3 h-3 mr-1" />{new Date(session.updatedAt).toLocaleDateString()}</span></div>
                            <button onClick={(e) => deleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden relative">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg text-slate-500"><History className="w-5 h-5" /></button>
                        <div className="flex items-center gap-2">
                            <select value={model} onChange={(e) => setModel(e.target.value as ModelType)} className="bg-transparent text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 focus:outline-none cursor-pointer">
                                <option value={ModelType.FLASH}>Gemini Flash 2.5</option>
                                <option value={ModelType.FLASH_LITE}>Gemini Flash Lite</option>
                                <option value={ModelType.PRO_PREVIEW}>Gemini Pro 3.0</option>
                            </select>
                            
                            {/* Thinking Toggle */}
                            <button 
                                onClick={() => {
                                    if(model === ModelType.FLASH_LITE) return; // Lite doesn't support thinking nicely
                                    setIsThinking(!isThinking);
                                }}
                                disabled={model === ModelType.FLASH_LITE}
                                className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${isThinking ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'bg-gray-100 dark:bg-slate-800 text-slate-400 hover:text-purple-400'} ${model === ModelType.FLASH_LITE ? 'opacity-30 cursor-not-allowed' : ''}`}
                                title="Toggle Thinking Mode"
                            >
                                <BrainCircuit className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase hidden sm:inline">Think</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Tools Toolbar */}
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                             <button 
                                onClick={() => setUseMaps(!useMaps)} 
                                disabled={!supportsTools}
                                className={`p-1.5 rounded ${useMaps ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'} ${!supportsTools ? 'opacity-30 cursor-not-allowed' : ''}`} 
                                title={supportsTools ? "Enable Maps" : "Not supported by this model"}
                            >
                                <Map className="w-4 h-4" />
                            </button>
                             <button 
                                onClick={() => setUseSearch(!useSearch)} 
                                disabled={!supportsTools}
                                className={`p-1.5 rounded ${useSearch ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'} ${!supportsTools ? 'opacity-30 cursor-not-allowed' : ''}`} 
                                title={supportsTools ? "Enable Web Search" : "Not supported by this model"}
                            >
                                <Globe className="w-4 h-4" />
                            </button>
                        </div>
                        <button onClick={() => startNewSession()} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Plus className="w-5 h-5" /></button>
                    </div>
                </div>

                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-slate-950">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-50 text-center p-4">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4"><MessageSquare className="w-8 h-8 text-blue-500" /></div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hello, I'm Zee AI.</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">I can help you analyze code, answer questions, or guide you through the App Builder.</p>
                            <div className="mt-4 text-xs text-slate-400 bg-slate-100 dark:bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                                Tip: Type <code className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1 rounded">@task</code> to add to your task board.
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600 ml-3' : 'bg-slate-700 mr-3'}`}>
                                        {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl shadow-sm text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-800 rounded-tl-none'}`}>
                                        {msg.attachment && (
                                            <div className="mb-3 p-2 bg-black/10 rounded flex items-center gap-2">
                                                <FileText className="w-4 h-4"/> <span className="text-xs truncate max-w-[150px]">{msg.attachment.name}</span>
                                            </div>
                                        )}
                                        {msg.role === 'model' ? <MarkdownRenderer content={msg.text} /> : <div className="whitespace-pre-wrap">{msg.text}</div>}
                                        {msg.groundingUrls?.length > 0 && (
                                            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700"><p className="text-[10px] font-bold uppercase mb-1 opacity-70">Sources</p><div className="flex flex-wrap gap-2">{msg.groundingUrls.map((c:any, i:number) => <a key={i} href={c.web?.uri} target="_blank" className="text-xs text-blue-500 hover:underline bg-blue-50 dark:bg-slate-800 px-2 py-1 rounded">{c.web?.title || 'Source'}</a>)}</div></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && <div className="flex justify-start"><div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 ml-11"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div></div>}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 relative">
                    {attachment && <div className="absolute bottom-full left-4 bg-slate-800 text-white text-xs px-3 py-1 rounded-t-lg flex items-center"><Paperclip className="w-3 h-3 mr-2"/>{attachment.name}<button onClick={()=>setAttachment(null)} className="ml-2 text-red-400"><X className="w-3 h-3"/></button></div>}
                    <div className="relative flex items-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-600 transition-colors">
                        <button 
                            onClick={toggleRecording} 
                            className={`p-3 transition-colors ${isRecording ? 'text-red-500 animate-pulse bg-red-950/20' : 'text-slate-500 hover:text-blue-500 hover:bg-slate-900'} border-r border-gray-200 dark:border-slate-800`}
                            title={isRecording ? "Stop Recording" : "Record Audio"}
                            disabled={isTranscribingAudio}
                        >
                            {isTranscribingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />)}
                        </button>
                        <label className="p-3 cursor-pointer text-slate-500 hover:text-blue-500 hover:bg-slate-900 transition-colors border-r border-gray-200 dark:border-slate-800">
                            <Paperclip className="w-4 h-4" />
                            <input type="file" className="hidden" onChange={handleFileUpload}/>
                        </label>
                        <textarea 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyDown={(e) => {
                                // Fix: Mobile enter usually means "Go", but users want "New Line".
                                // Desktop enter means "Send".
                                if (window.innerWidth < 768) {
                                    // On mobile, let Enter be a new line naturally. Do nothing to preventDefault.
                                    return;
                                }
                                // On Desktop
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }} 
                            placeholder="Type a message... (@task Title | Desc | Priority)" 
                            className="flex-1 bg-transparent px-4 py-3 text-slate-900 dark:text-white focus:outline-none resize-none text-sm min-h-[50px]" 
                            rows={1} 
                        />
                        <button onClick={() => handleSend()} disabled={isLoading || (!input && !attachment)} className="p-3 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"><Send className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
