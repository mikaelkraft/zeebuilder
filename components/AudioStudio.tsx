
import React, { useState, useRef, useEffect } from 'react';
import { huggingFaceService } from '../services/huggingFaceService';
import { Volume2, Loader2, FileText, Download, Activity, Copy, Check, Mic, MicOff, FolderPlus, Cloud, AlertCircle, RefreshCcw, XCircle } from 'lucide-react';
import { View, SavedProject, CloudProviderConfig } from '../types';
import { alertService } from '../services/alertService';
import PermissionHelpModal from './PermissionHelpModal';

interface AudioStudioProps {
    onNavigate?: (view: View) => void;
}

const AudioStudio: React.FC<AudioStudioProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'tts' | 'transcribe'>('tts');

    // TTS State
    const [ttsText, setTtsText] = useState('');
    const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
    const [audioDownloadUrl, setAudioDownloadUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [ttsVoice, setTtsVoice] = useState('Puck');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');

    // Transcribe State
    const [transcription, setTranscription] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    
    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [showPermissionHelp, setShowPermissionHelp] = useState(false);
    const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('prompt');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const refreshMicStatus = async () => {
        if (!navigator.permissions?.query) return;
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            const state = permissionStatus.state as any;
            setMicPermission(state === 'granted' ? 'granted' : state === 'denied' ? 'denied' : 'prompt');
            permissionStatus.onchange = () => setMicPermission(permissionStatus.state as any);
        } catch (err) {
            // Permission API may be unsupported; ignore
        }
    };

    useEffect(() => {
        refreshMicStatus();
    }, []);

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleTTS = async () => {
        if (!ttsText) return;
        setIsGeneratingTTS(true);
        setAudioDownloadUrl(null);
        try {
            const audioBlob = await huggingFaceService.generateSpeech(ttsText, ttsVoice);
            if (audioBlob) {
                 const url = URL.createObjectURL(audioBlob);
                 const audio = new Audio(url);
                 audio.play();
                 
                 setAudioDownloadUrl(url);
                 setAudioBlob(audioBlob);
                 setSaveStatus('idle');
            } else {
                alertService.error('Generation Failed', 'Failed to generate speech. Please try again.');
            }
        } catch (e: any) {
            const message = (e as any).message || '';
            if (message.toLowerCase().includes('inference provider') || message.includes('401') || message.includes('403')) {
                alertService.error('TTS Error', 'Speech model unavailable. Please ensure HUGGING_FACE_API_KEY is set and try again.');
            } else {
                alertService.error('TTS Error', message || 'Unable to generate speech.');
            }
        } finally {
            setIsGeneratingTTS(false);
        }
    };

    const handleFileTranscribe = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        setUploadedAudioUrl(url);

        setIsTranscribing(true);
        setTranscription('');
        
        try {
             const text = await huggingFaceService.transcribeAudio(file);
             setTranscription(text || "No speech detected.");
             setIsTranscribing(false);
        } catch (e: any) {
            setTranscription("Error: " + (e.message || e));
            setIsTranscribing(false);
        }
    };

    const requestMicStream = async (): Promise<MediaStream | null> => {
        if (!navigator.mediaDevices?.getUserMedia) {
            alertService.error('Microphone Error', 'Browser does not support audio capture or is in an insecure context (https required).');
            return null;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicPermission('granted');
            setShowPermissionHelp(false);
            return stream;
        } catch (error: any) {
            console.error('Error accessing microphone:', error);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setMicPermission('denied');
                setShowPermissionHelp(true);
            } else {
                let errorMessage = 'Could not access microphone.';
                if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                    errorMessage = 'No microphone found. Please ensure a microphone is connected.';
                } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                    errorMessage = 'Microphone is already in use by another application.';
                }
                alertService.error('Microphone Error', errorMessage);
            }
            return null;
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
                setIsTranscribing(true);
            }
            return;
        }

        if (micPermission === 'denied') {
            setShowPermissionHelp(true);
            return;
        }

        const stream = await requestMicStream();
        if (!stream) return;

        try {
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
                const url = URL.createObjectURL(audioBlob);
                setUploadedAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());

                try {
                    const transcript = await huggingFaceService.transcribeAudio(audioBlob);
                    setTranscription(transcript || "No speech detected.");
                } catch (error: any) {
                    console.error("Transcription failed:", error);
                    setTranscription("Error: " + error.message);
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsTranscribing(true);
        } catch (error: any) {
            console.error('Error starting recorder:', error);
            alertService.error('Microphone Error', 'Unable to start recording.');
            stream.getTracks().forEach(track => track.stop());
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

    const handleAddToProject = async () => {
        if (!audioBlob) return;
        
        setSaveStatus('saving');
        setSaveMessage('');
        
        // Check for cloud config
        const cloudConfigStr = localStorage.getItem('zee_cloud_config');
        const cloudConfig: CloudProviderConfig | null = cloudConfigStr ? JSON.parse(cloudConfigStr) : null;
        
        // Get active project
        const activeId = localStorage.getItem('zee_active_project_id');
        if (!activeId) {
            alertService.warning('No Active Project', 'Please open a project in the Builder first.');
            setSaveStatus('idle');
            return;
        }
        
        try {
            // Convert blob to base64 data URL
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            
            reader.onloadend = () => {
                const base64Data = reader.result as string;
                
                const storedProjects = localStorage.getItem('zee_projects');
                if (storedProjects) {
                    const projects: SavedProject[] = JSON.parse(storedProjects);
                    const projectIndex = projects.findIndex(p => p.id === activeId);
                    
                    if (projectIndex >= 0) {
                        const project = projects[projectIndex];
                        const fileName = `src/assets/audio-${Date.now()}.wav`;
                        
                        // If cloud is connected, show info about storage
                        if (cloudConfig?.enabled) {
                            setSaveMessage(`Saved locally. Cloud sync via ${cloudConfig.provider} available.`);
                        }
                        
                        project.files.push({
                            name: fileName,
                            content: base64Data,
                            language: 'html' // Using html as a generic binary type
                        });
                        
                        project.lastModified = Date.now();
                        projects[projectIndex] = project;
                        
                        localStorage.setItem('zee_projects', JSON.stringify(projects));
                        setSaveStatus('saved');
                        
                        alertService.toast.success(`Audio saved to ${fileName}`);
                        
                        setTimeout(() => setSaveStatus('idle'), 3000);
                    }
                }
            };
        } catch (error) {
            console.error('Error saving audio:', error);
            setSaveStatus('error');
            
            // Prompt to connect cloud if not connected
            const cloudConfigExists = localStorage.getItem('zee_cloud_config');
            if (!cloudConfigExists) {
                alertService.confirm({
                    title: 'Connect Cloud Storage?',
                    text: 'For larger files, connect a cloud provider in your Profile settings.',
                    confirmText: 'Go to Profile',
                    cancelText: 'Later'
                }).then((confirmed) => {
                    if (confirmed && onNavigate) {
                        onNavigate(View.PROFILE);
                    }
                });
            }
        }
    };

    const voices = [
        'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede', 'Leda', 'Orus', 'Umbriel',
        'Achernar', 'Achird', 'Algenib', 'Algieba', 'Alnilam', 'Autonoe', 'Callirrhoe', 
        'Despina', 'Enceladus', 'Erinome', 'Gacrux', 'Iapetus', 'Laomedeia', 'Pulcherrima', 
        'Rasalgethi', 'Sadachbia', 'Sadaltager', 'Schedar', 'Sulafat', 'Vindemiatrix', 'Zubenelgenubi'
    ];

    return (
        <div className="h-full flex flex-col p-4 max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4 bg-slate-900 p-1 rounded-xl w-fit shadow-lg shrink-0 mx-auto md:mx-0">
                <button onClick={() => setActiveTab('tts')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'tts' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Text-to-Speech</button>
                <button onClick={() => setActiveTab('transcribe')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'transcribe' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Transcription</button>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-3 right-4 flex items-center gap-2 text-[10px] uppercase font-bold">
                    <span className="text-slate-500">Mic</span>
                    <span className={`px-2 py-1 rounded-full ${micPermission === 'granted' ? 'bg-green-900/40 text-green-300 border border-green-700' : micPermission === 'denied' ? 'bg-red-900/40 text-red-300 border border-red-700' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                        {micPermission === 'granted' ? 'Granted' : micPermission === 'denied' ? 'Blocked' : 'Ask to use'}
                    </span>
                    <button className="text-slate-300 underline" onClick={refreshMicStatus}>Refresh</button>
                    {micPermission === 'denied' && (
                        <button className="text-red-300 underline" onClick={() => setShowPermissionHelp(true)}>Fix</button>
                    )}
                </div>

                {activeTab === 'tts' && (
                    <div className="max-w-lg mx-auto w-full space-y-4 h-full flex flex-col justify-center">
                            <div className="text-center">
                                <h2 className="text-lg font-bold text-white">Neural Text-to-Speech</h2>
                                <p className="text-slate-400 text-xs mt-1">Convert text into audio with free Hugging Face voices.</p>
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
                            {audioDownloadUrl && (
                                <>
                                    <button 
                                        onClick={handleTTS}
                                        className="px-3 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs flex items-center justify-center"
                                        title="Remix / Regenerate"
                                    >
                                        <RefreshCcw className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={handleAddToProject}
                                        disabled={saveStatus === 'saving'}
                                        className={`px-4 py-2.5 rounded-lg border flex items-center text-xs font-bold transition-all ${
                                            saveStatus === 'saved' 
                                                ? 'bg-green-600 border-green-500 text-white' 
                                                : saveStatus === 'saving'
                                                ? 'bg-slate-700 border-slate-600 text-slate-400'
                                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                                        }`}
                                        title="Add to Active Project"
                                    >
                                        {saveStatus === 'saving' ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : saveStatus === 'saved' ? (
                                            <><Check className="w-3 h-3 mr-1" /> Added</>
                                        ) : (
                                            <><FolderPlus className="w-3 h-3 mr-1" /> Add to Project</>
                                        )}
                                    </button>
                                    <a href={audioDownloadUrl} download="speech.wav" className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center text-xs font-bold">
                                        <Download className="w-3 h-3 mr-1" /> Save
                                    </a>
                                </>
                            )}
                        </div>
                        {saveMessage && (
                            <p className="text-xs text-slate-400 flex items-center mt-2">
                                <Cloud className="w-3 h-3 mr-1" /> {saveMessage}
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'transcribe' && (
                    <div className="max-w-md mx-auto w-full text-center space-y-4 h-full flex flex-col justify-center">
                        <div className="text-center">
                             <h2 className="text-lg font-bold text-white">Audio Transcription</h2>
                             <p className="text-slate-400 text-xs mt-1">Record voice or upload audio files.</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={toggleRecording}
                                disabled={isTranscribing}
                                className={`flex-1 py-4 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center transition-all ${isRecording ? 'bg-red-900/20 border-red-500 text-red-500' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}
                            >
                                {isRecording ? <MicOff className="w-6 h-6 mb-2 animate-pulse" /> : <Mic className="w-6 h-6 mb-2" />}
                                <span className="text-xs font-bold">{isRecording ? "Stop Recording" : "Record Audio"}</span>
                            </button>

                            <div className="flex-1 border-2 border-dashed border-slate-700 rounded-xl p-4 hover:bg-slate-800/50 transition-all cursor-pointer bg-slate-900/50 relative">
                                <label className="cursor-pointer block w-full h-full flex flex-col items-center justify-center">
                                    <Download className="w-6 h-6 text-purple-500 mb-2 rotate-180" />
                                    <span className="text-xs font-bold text-white mb-1">Upload File</span>
                                    <input type="file" accept="audio/*" className="hidden" onChange={handleFileTranscribe} />
                                </label>
                            </div>
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

            {/* Permission Help Modal */}
            <PermissionHelpModal 
                isOpen={showPermissionHelp}
                onClose={() => setShowPermissionHelp(false)}
                onRetry={toggleRecording}
            />
        </div>
    );
};

export default AudioStudio;
