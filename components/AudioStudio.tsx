
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { generateSpeech, transcribeAudio, pcmToBlob, decodeAudio, arrayBufferToAudioBuffer, blobToBase64, pcm16ToWavBlob, ensureApiKey } from '../services/geminiService';
import { Mic, Volume2, StopCircle, Radio, Loader2, FileText, AlertCircle, Download, Activity, Copy, Check, Code } from 'lucide-react';
import { View, SavedProject, Stack } from '../types';

interface AudioStudioProps {
    onNavigate?: (view: View) => void;
}

const AudioStudio: React.FC<AudioStudioProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'live' | 'tts' | 'transcribe'>('live');

    // Live API State
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [sessionLogs, setSessionLogs] = useState<string[]>([]);
    const [selectedVoice, setSelectedVoice] = useState('Zephyr');
    
    // Interactive App Building State
    const [generatedApp, setGeneratedApp] = useState<{id: string, name: string} | null>(null);
    
    // TTS State
    const [ttsText, setTtsText] = useState('');
    const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
    const [audioDownloadUrl, setAudioDownloadUrl] = useState<string | null>(null);
    const [ttsVoice, setTtsVoice] = useState('Kore');

    // Transcribe State
    const [transcription, setTranscription] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const sessionRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const analyserRef = useRef<AnalyserNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    const disconnectLive = async () => {
        setIsConnected(false);
        setIsConnecting(false);
        
        if (sessionRef.current) {
             try {
                 const session = await sessionRef.current;
                 session.close();
             } catch(e) { console.log("Session close error", e); }
             sessionRef.current = null;
        }

        if (inputAudioContextRef.current) {
            try { inputAudioContextRef.current.close(); } catch(e) {}
            inputAudioContextRef.current = null;
        }
        
        if (outputAudioContextRef.current) {
            try { outputAudioContextRef.current.close(); } catch(e) {}
            outputAudioContextRef.current = null;
        }
        
        sourcesRef.current.forEach(s => { try{ s.stop(); } catch(e){} });
        sourcesRef.current.clear();
        
        if (analyserRef.current) {
             try { analyserRef.current.disconnect(); } catch(e) {}
             analyserRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            disconnectLive();
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    const drawVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2.5; // Scale down for compact view
                ctx.fillStyle = `rgba(59, 130, 246, ${barHeight / 100 + 0.2})`; // Blue dynamic opacity
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };
        draw();
    };

    const connectLive = async (retry = false) => {
        disconnectLive();
        setIsConnecting(true);
        setConnectionError(null);
        setGeneratedApp(null);
        
        if (!retry) setSessionLogs(prev => [...prev, "Initializing..."]);

        try {
            await ensureApiKey();
            await new Promise(r => setTimeout(r, 500));

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            analyserRef.current = inputAudioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 128; 
            
            const outputNode = outputAudioContextRef.current.createGain();
            outputNode.connect(outputAudioContextRef.current.destination);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Tool Definition for App Building
            const createAppTool = {
                functionDeclarations: [{
                    name: "createApp",
                    description: "Build or generate a web or mobile application based on user description. Call this when user says 'build an app' or describes a project.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            description: { type: "STRING", description: "Full description of the app features and style" },
                            stack: { type: "STRING", description: "Tech stack: react, flutter, or html", enum: ["react", "flutter", "html"] }
                        },
                        required: ["description"]
                    }
                }]
            };

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setSessionLogs(prev => [...prev, "Connected."]);
                        setIsConnected(true);
                        setIsConnecting(false);
                        drawVisualizer();

                        if (inputAudioContextRef.current) {
                            inputAudioContextRef.current.resume();
                            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                            source.connect(analyserRef.current!);
                            
                            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                            scriptProcessor.onaudioprocess = (e) => {
                                const inputData = e.inputBuffer.getChannelData(0);
                                const pcmBlob = pcmToBlob(inputData);
                                sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                            };
                            
                            source.connect(scriptProcessor);
                            scriptProcessor.connect(inputAudioContextRef.current.destination);
                        }
                        if (outputAudioContextRef.current) outputAudioContextRef.current.resume();
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Audio Output
                        const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            try {
                                const ctx = outputAudioContextRef.current;
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                                const audioBuffer = await arrayBufferToAudioBuffer(decodeAudio(base64Audio), ctx);
                                const source = ctx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputNode);
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                sourcesRef.current.add(source);
                                source.onended = () => sourcesRef.current.delete(source);
                            } catch(e) {}
                        }

                        // Tool Calling (App Generation)
                        const toolCall = msg.toolCall;
                        if (toolCall) {
                            for (const fc of toolCall.functionCalls) {
                                if (fc.name === 'createApp') {
                                    const { description, stack } = fc.args as any;
                                    
                                    // Generate Project
                                    const projectId = Date.now().toString();
                                    const newProject: SavedProject = {
                                        id: projectId,
                                        name: `Voice App: ${stack || 'React'}`,
                                        stack: (stack as Stack) || 'react',
                                        files: [
                                            { name: 'README.md', content: `# App Request\n\n${description}`, language: 'json' }
                                        ],
                                        lastModified: Date.now(),
                                        dbConfigs: [],
                                        messages: [{
                                            id: 'init', role: 'user', text: `Build an app: ${description}`, timestamp: Date.now()
                                        }]
                                    };
                                    
                                    const stored = localStorage.getItem('zee_projects');
                                    const projects = stored ? JSON.parse(stored) : [];
                                    projects.unshift(newProject);
                                    localStorage.setItem('zee_projects', JSON.stringify(projects));
                                    localStorage.setItem('zee_active_project_id', projectId);
                                    
                                    setGeneratedApp({ id: projectId, name: newProject.name });
                                    setSessionLogs(prev => [...prev, ` Generating app: ${description.slice(0,20)}...`]);

                                    // Send success response to model
                                    sessionPromise.then(s => s.sendToolResponse({
                                        functionResponses: [
                                            { id: fc.id, name: fc.name, response: { result: "App created successfully. Tell user they can open it in Builder." } }
                                        ]
                                    }));
                                }
                            }
                        }

                        if (msg.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => s.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onclose: () => {
                        setIsConnected(false);
                        setIsConnecting(false);
                    },
                    onerror: (e) => {
                        let errorMsg = "Connection Error";
                        if (e instanceof ErrorEvent) errorMsg = e.message;
                        else if (typeof e === 'object') errorMsg = "Check API Key / Network";
                        
                        if (errorMsg.includes("400") || errorMsg.includes("API_KEY_INVALID")) {
                             setConnectionError("Invalid API Key.");
                        } else {
                             setConnectionError(errorMsg);
                             setSessionLogs(prev => [...prev, "Error: " + errorMsg]);
                        }
                        
                        setIsConnecting(false);
                        setIsConnected(false);
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice === 'Zee' ? 'Zephyr' : selectedVoice } }
                    },
                    // FIXED: systemInstruction must be a Content object { parts: [...] } for Live API
                    systemInstruction: { parts: [{ text: "You are Zee AI. If user asks to build/create an app, use the createApp tool." }] },
                    tools: [createAppTool]
                }
            });
            sessionRef.current = sessionPromise;
        } catch (error: any) {
            setIsConnecting(false);
            setConnectionError(error.message);
        }
    };

    const handleTTS = async () => {
        if (!ttsText) return;
        setIsGeneratingTTS(true);
        setAudioDownloadUrl(null);
        try {
            const base64 = await generateSpeech(ttsText, ttsVoice);
            if (base64) {
                 const audioBytes = decodeAudio(base64);
                 const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                 const buffer = await arrayBufferToAudioBuffer(audioBytes, ctx);
                 const source = ctx.createBufferSource();
                 source.buffer = buffer;
                 source.connect(ctx.destination);
                 source.start();
                 const wavBlob = pcm16ToWavBlob(audioBytes);
                 const url = URL.createObjectURL(wavBlob);
                 setAudioDownloadUrl(url);
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsGeneratingTTS(false);
        }
    };

    const handleFileTranscribe = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedAudioUrl(URL.createObjectURL(file));
        setIsTranscribing(true);
        try {
             const reader = new FileReader();
             reader.readAsDataURL(file);
             reader.onloadend = async () => {
                 if (typeof reader.result === 'string') {
                    const base64 = reader.result.split(',')[1];
                    const text = await transcribeAudio(base64, file.type);
                    setTranscription(text || "No speech detected.");
                 }
                 setIsTranscribing(false);
             }
        } catch (e: any) {
            setTranscription("Error: " + (e.message || e));
            setIsTranscribing(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(transcription);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownloadTranscript = () => {
        const b = new Blob([transcription], { type: 'text/plain' });
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u;
        a.download = `transcript-${Date.now()}.txt`;
        a.click();
    };

    const voices = ['Zee', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

    return (
        <div className="h-full flex flex-col p-4 max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4 bg-slate-900 p-1 rounded-xl w-fit shadow-lg shrink-0 mx-auto md:mx-0">
                <button onClick={() => setActiveTab('live')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'live' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Live Voice</button>
                <button onClick={() => setActiveTab('tts')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'tts' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Text-to-Speech</button>
                <button onClick={() => setActiveTab('transcribe')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'transcribe' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Transcription</button>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col">
                
                {activeTab === 'live' && (
                    <div className="flex flex-col h-full max-w-md mx-auto w-full justify-center">
                         <div className="flex flex-col items-center justify-center relative z-10 w-full">
                             {/* Status Ring - Resized to be compact */}
                             <div className={`relative w-32 h-32 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${isConnected ? 'shadow-[0_0_50px_rgba(59,130,246,0.3)]' : ''}`}>
                                 {isConnected && <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>}
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${isConnected ? 'bg-gradient-to-br from-blue-600 to-cyan-500' : 'bg-slate-800 border-2 border-slate-700'}`}>
                                    {isConnecting ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Mic className={`w-8 h-8 ${isConnected?'text-white':'text-slate-500'}`} />}
                                </div>
                             </div>
                             
                             <h2 className="text-lg font-bold text-white mb-4 tracking-tight">{isConnected ? 'Listening...' : 'Start Session'}</h2>
                             
                             {!isConnected ? (
                                <div className="flex flex-col gap-3 w-full">
                                     <div className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                                         <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Voice</span>
                                         <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="bg-slate-900 text-white text-xs font-bold rounded px-2 py-1 border border-slate-600 focus:outline-none">
                                             {voices.map(v => <option key={v} value={v}>{v}</option>)}
                                         </select>
                                     </div>
                                     <button onClick={() => connectLive(false)} disabled={isConnecting} className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg flex items-center justify-center disabled:opacity-50">
                                        <Radio className="w-4 h-4 mr-2 text-blue-600" /> Connect Live
                                    </button>
                                </div>
                             ) : (
                                 <>
                                    <canvas ref={canvasRef} width="300" height="40" className="w-full h-10 mb-4 rounded opacity-60" />
                                    <button onClick={disconnectLive} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-xs transition-all shadow-lg flex items-center">
                                        <StopCircle className="w-3 h-3 mr-2" /> Disconnect
                                    </button>
                                 </>
                             )}

                             {connectionError && <div className="mt-4 px-3 py-2 bg-red-900/30 border border-red-800/50 text-red-200 text-xs rounded-lg flex items-center"><AlertCircle className="w-3 h-3 mr-2" /> {connectionError}</div>}
                             
                             {generatedApp && (
                                 <div className="mt-4 w-full bg-green-900/20 border border-green-800/50 p-3 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                                     <div className="flex items-center">
                                         <Code className="w-4 h-4 text-green-400 mr-2" />
                                         <div className="text-left">
                                             <p className="text-xs font-bold text-green-100">App Generated</p>
                                             <p className="text-[10px] text-green-300">{generatedApp.name}</p>
                                         </div>
                                     </div>
                                     <button onClick={() => onNavigate?.(View.BUILDER)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg">Open</button>
                                 </div>
                             )}
                        </div>
                        
                        <div className="mt-6 h-20 bg-black/20 border border-slate-800 p-2 overflow-y-auto custom-scrollbar text-[10px] font-mono text-blue-300/60 rounded-lg w-full">
                             {sessionLogs.map((log, i) => <div key={i}>{`> ${log}`}</div>)}
                        </div>
                    </div>
                )}

                {activeTab === 'tts' && (
                    <div className="max-w-lg mx-auto w-full space-y-4 h-full flex flex-col justify-center">
                        <div className="text-center">
                             <h2 className="text-lg font-bold text-white">Neural Text-to-Speech</h2>
                             <p className="text-slate-400 text-xs mt-1">Convert text into lifelike audio using Gemini models.</p>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-1">
                            <div className="flex border-b border-slate-800 px-3 py-2 items-center justify-between bg-slate-900/50 rounded-t-lg">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Input</span>
                                <select value={ttsVoice} onChange={(e) => setTtsVoice(e.target.value)} className="bg-slate-800 text-white text-[10px] rounded px-2 py-0.5 border border-slate-700">
                                    {voices.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <textarea value={ttsText} onChange={(e) => setTtsText(e.target.value)} className="w-full h-32 bg-transparent p-3 text-white focus:outline-none resize-none text-sm placeholder:text-slate-700" placeholder="Text to speak..."/>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleTTS} disabled={isGeneratingTTS || !ttsText} className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-xs flex items-center justify-center disabled:opacity-50">
                                {isGeneratingTTS ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Activity className="w-3 h-3 mr-2" />} Generate
                            </button>
                            {audioDownloadUrl && <a href={audioDownloadUrl} download="speech.wav" className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center text-xs font-bold"><Download className="w-3 h-3 mr-1" /> Save</a>}
                        </div>
                    </div>
                )}

                {activeTab === 'transcribe' && (
                    <div className="max-w-md mx-auto w-full text-center space-y-4 h-full flex flex-col justify-center">
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 hover:bg-slate-800/50 transition-all cursor-pointer bg-slate-900/50 relative w-full">
                            <label className="cursor-pointer block w-full h-full flex flex-col items-center justify-center">
                                <Download className="w-6 h-6 text-purple-500 mb-2 rotate-180" />
                                <span className="text-xs font-bold text-white mb-1">Drop Audio File</span>
                                <span className="text-[10px] text-slate-500 mb-2">MP3, WAV</span>
                                <input type="file" accept="audio/*" className="hidden" onChange={handleFileTranscribe} />
                                <div className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-[10px] font-bold">Browse</div>
                            </label>
                        </div>

                        {uploadedAudioUrl && <audio controls src={uploadedAudioUrl} className="w-full h-8 rounded bg-slate-950 border border-slate-800" />}
                        
                        {isTranscribing && <div className="text-purple-400 text-xs font-bold animate-pulse flex justify-center"><Loader2 className="w-3 h-3 animate-spin mr-2"/> Transcribing...</div>}

                        {transcription && (
                            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-left shadow-lg flex-1 min-h-0 flex flex-col">
                                <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center"><FileText className="w-3 h-3 mr-1"/> Result</h4>
                                    <div className="flex space-x-2">
                                        <button onClick={handleCopy} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 hover:text-white transition-colors flex items-center">
                                            {isCopied ? <Check className="w-3 h-3 mr-1"/> : <Copy className="w-3 h-3 mr-1"/>} {isCopied ? 'Copied' : 'Copy'}
                                        </button>
                                        <button onClick={handleDownloadTranscript} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 hover:text-white transition-colors flex items-center">
                                            <Download className="w-3 h-3 mr-1"/> Download
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3 overflow-y-auto custom-scrollbar flex-1">
                                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{transcription}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioStudio;
