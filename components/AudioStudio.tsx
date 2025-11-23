
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { generateSpeech, transcribeAudio, pcmToBlob, decodeAudio, arrayBufferToAudioBuffer, blobToBase64, pcm16ToWavBlob } from '../services/geminiService';
import { Mic, Volume2, StopCircle, Radio, Loader2, FileText, AlertCircle, Download } from 'lucide-react';

const AudioStudio: React.FC = () => {
    // Mode
    const [activeTab, setActiveTab] = useState<'live' | 'tts' | 'transcribe'>('live');

    // Live API State
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [sessionLogs, setSessionLogs] = useState<string[]>([]);
    
    // TTS State
    const [ttsText, setTtsText] = useState('');
    const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
    const [audioDownloadUrl, setAudioDownloadUrl] = useState<string | null>(null);

    // Transcribe State
    const [transcription, setTranscription] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);

    // Live API Logic
    const sessionRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            disconnectLive();
        };
    }, []);

    const connectLive = async (retry = false) => {
        // Cleanup any previous contexts before starting new ones
        if (inputAudioContextRef.current) {
            try { await inputAudioContextRef.current.close(); } catch (e) {}
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            try { await outputAudioContextRef.current.close(); } catch (e) {}
            outputAudioContextRef.current = null;
        }

        setIsConnecting(true);
        setConnectionError(null);
        
        if (!retry) {
            setSessionLogs(prev => [...prev, "Initializing Live session..."]);
        } else {
            setSessionLogs(prev => [...prev, "Retrying connection with new key..."]);
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Setup Audio Contexts
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const outputNode = outputAudioContextRef.current!.createGain();
            outputNode.connect(outputAudioContextRef.current!.destination);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setSessionLogs(prev => [...prev, "Connected to Zee AI Live."]);
                        setIsConnected(true);
                        setIsConnecting(false);

                        // Mic Stream Setup
                        if (!inputAudioContextRef.current) return;
                        
                        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = pcmToBlob(inputData);
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            
                            const audioBuffer = await arrayBufferToAudioBuffer(
                                decodeAudio(base64Audio),
                                ctx
                            );
                            
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            
                            sourcesRef.current.add(source);
                            source.onended = () => sourcesRef.current.delete(source);
                        }

                        if (msg.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => s.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                        
                        // Handle transcription logging if available
                        if (msg.serverContent?.modelTurn?.parts?.[0]?.text) {
                             setSessionLogs(prev => [...prev, `Zee: ${msg.serverContent?.modelTurn?.parts?.[0]?.text}`]);
                        }
                    },
                    onclose: () => {
                        setSessionLogs(prev => [...prev, "Disconnected."]);
                        setIsConnected(false);
                        setIsConnecting(false);
                    },
                    onerror: (e) => {
                        console.error(e);
                        // Don't set connection error here, let the promise rejection handle it if it's startup error
                        // Runtime errors can be logged
                        setSessionLogs(prev => [...prev, "Runtime Error: " + e.toString()]);
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    },
                    systemInstruction: "You are Zee AI, an intelligent and friendly voice assistant created by Mikael Kraft. Be concise and helpful."
                }
            });
            
            // Handle initial connection rejection (e.g. Auth failure)
            sessionPromise.catch(async (err) => {
                console.error("Live Connection Failed:", err);
                const msg = err.toString().toLowerCase();

                // Retry logic for Auth errors (404/403)
                if (msg.includes("404") || msg.includes("requested entity was not found") || msg.includes("403")) {
                    if (window.aistudio && window.aistudio.openSelectKey) {
                        try {
                            await window.aistudio.openSelectKey();
                            // Auto-Retry
                            setIsConnecting(false);
                            connectLive(true); 
                            return;
                        } catch (e) {
                             // User cancelled
                        }
                    }
                }

                setConnectionError("Failed to connect to Live API. " + (err.message || "Network Error"));
                setIsConnecting(false);
                setIsConnected(false);
            });

            sessionRef.current = sessionPromise;

        } catch (error: any) {
            console.error(error);
            setIsConnecting(false);
            setConnectionError("Failed to initialize Live API: " + error.message);
        }
    };

    const disconnectLive = () => {
        if (inputAudioContextRef.current) {
            try { inputAudioContextRef.current.close(); } catch(e) {}
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
             try { outputAudioContextRef.current.close(); } catch(e) {}
             outputAudioContextRef.current = null;
        }
        setIsConnected(false);
        // Reset logs to indicate new session potential
        setSessionLogs(prev => [...prev, "Session ended."]);
    };

    // TTS Logic
    const handleTTS = async () => {
        if (!ttsText) return;
        setIsGeneratingTTS(true);
        setAudioDownloadUrl(null);
        try {
            const base64 = await generateSpeech(ttsText);
            if (base64) {
                 const audioBytes = decodeAudio(base64);
                 // Prepare playback
                 const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                 const buffer = await arrayBufferToAudioBuffer(audioBytes, ctx);
                 const source = ctx.createBufferSource();
                 source.buffer = buffer;
                 source.connect(ctx.destination);
                 source.start();

                 // Prepare download
                 const wavBlob = pcm16ToWavBlob(audioBytes);
                 const url = URL.createObjectURL(wavBlob);
                 setAudioDownloadUrl(url);
            }
        } catch (e) {
            console.error(e);
            alert("TTS Generation failed. Please check API key or network.");
        } finally {
            setIsGeneratingTTS(false);
        }
    };

    // Transcription Logic
    const handleFileTranscribe = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsTranscribing(true);
        try {
             // Convert to base64
             const reader = new FileReader();
             reader.readAsDataURL(file);
             reader.onloadend = async () => {
                 const result = reader.result;
                 if (typeof result === 'string') {
                    const base64 = result.split(',')[1];
                    const text = await transcribeAudio(base64, file.type);
                    setTranscription(text || "No transcription available.");
                 } else {
                    setTranscription("Error reading file.");
                 }
                 setIsTranscribing(false);
             }
        } catch (e) {
            setTranscription("Error transcribing.");
            setIsTranscribing(false);
        }
    };

    const downloadTranscription = () => {
        if (!transcription) return;
        const blob = new Blob([transcription], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcription-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full flex flex-col p-6 max-w-5xl mx-auto">
            <div className="flex space-x-2 mb-6 bg-slate-900 p-1 rounded-lg w-fit">
                <button 
                    onClick={() => setActiveTab('live')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'live' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Live Conversation
                </button>
                <button 
                    onClick={() => setActiveTab('tts')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Text-to-Speech
                </button>
                <button 
                    onClick={() => setActiveTab('transcribe')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'transcribe' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Transcription
                </button>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                
                {/* Live Tab */}
                {activeTab === 'live' && (
                    <div className="flex flex-col items-center justify-center h-full">
                         <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isConnected ? 'bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'bg-slate-800'}`}>
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isConnected ? 'bg-red-600 animate-pulse-slow' : 'bg-slate-700'}`}>
                                <Mic className="w-10 h-10 text-white" />
                            </div>
                         </div>
                         
                         <h2 className="text-2xl font-bold text-white mb-2">{isConnected ? 'Zee Live Session Active' : 'Start Conversation'}</h2>
                         <p className="text-slate-400 mb-8 text-center max-w-md">
                            Speak naturally with Zee AI. Low-latency voice interaction powered by the Live API.
                         </p>

                         {connectionError && (
                             <div className="mb-6 px-4 py-2 bg-red-900/50 border border-red-800 text-red-200 text-sm rounded-lg flex items-center">
                                 <AlertCircle className="w-4 h-4 mr-2" />
                                 {connectionError}
                             </div>
                         )}

                         {!isConnected ? (
                            <button 
                                onClick={() => connectLive(false)}
                                disabled={isConnecting}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isConnecting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Radio className="w-5 h-5 mr-2" />}
                                {isConnecting ? 'Connecting...' : 'Connect Live'}
                            </button>
                         ) : (
                             <button 
                                onClick={disconnectLive}
                                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold transition-all shadow-lg flex items-center"
                            >
                                <StopCircle className="w-5 h-5 mr-2" />
                                End Session
                            </button>
                         )}

                         <div className="mt-8 w-full max-w-md h-32 overflow-y-auto bg-slate-950 rounded-lg p-4 text-xs font-mono text-green-400 border border-slate-800 custom-scrollbar">
                             {sessionLogs.map((log, i) => <div key={i}>{`> ${log}`}</div>)}
                             {sessionLogs.length === 0 && <span className="text-slate-600">Session logs will appear here...</span>}
                         </div>
                    </div>
                )}

                {/* TTS Tab */}
                {activeTab === 'tts' && (
                    <div className="max-w-xl mx-auto space-y-6">
                        <div className="text-center mb-8">
                             <Volume2 className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                             <h2 className="text-xl font-bold text-white">Neural Text-to-Speech</h2>
                        </div>
                        <textarea 
                            value={ttsText}
                            onChange={(e) => setTtsText(e.target.value)}
                            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-teal-500 resize-none"
                            placeholder="Type something to hear it spoken..."
                        />
                        <div className="flex gap-4">
                            <button 
                                onClick={handleTTS}
                                disabled={isGeneratingTTS || !ttsText}
                                className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                {isGeneratingTTS ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Generate Speech'}
                            </button>
                            
                            {audioDownloadUrl && (
                                <a 
                                    href={audioDownloadUrl}
                                    download={`zee-speech-${Date.now()}.wav`}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 flex items-center transition-colors"
                                    title="Download WAV"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Transcribe Tab */}
                {activeTab === 'transcribe' && (
                    <div className="max-w-xl mx-auto space-y-6 text-center">
                         <div className="mb-8">
                             <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                             <h2 className="text-xl font-bold text-white">Audio Transcription</h2>
                        </div>
                        
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:bg-slate-800 transition-colors">
                            <label className="cursor-pointer">
                                <span className="block text-sm text-slate-400 mb-2">Click to upload audio file</span>
                                <input type="file" accept="audio/*" className="hidden" onChange={handleFileTranscribe} />
                                <div className="px-4 py-2 bg-slate-700 text-white rounded-lg inline-block text-sm">Select File</div>
                            </label>
                        </div>

                        {isTranscribing && <div className="text-blue-400 animate-pulse">Transcribing...</div>}

                        {transcription && (
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xs text-slate-500 uppercase">Output</h4>
                                    <button 
                                        onClick={downloadTranscription}
                                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                                        title="Download Text"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-slate-200 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar">{transcription}</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default AudioStudio;
