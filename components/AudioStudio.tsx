
import React, { useState } from 'react';
import { generateSpeech, transcribeAudio, decodeAudio, arrayBufferToAudioBuffer, pcm16ToWavBlob } from '../services/geminiService';
import { Volume2, Loader2, FileText, Download, Activity, Copy, Check } from 'lucide-react';
import { View } from '../types';

interface AudioStudioProps {
    onNavigate?: (view: View) => void;
}

const AudioStudio: React.FC<AudioStudioProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'tts' | 'transcribe'>('tts');

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
            } else {
                alert("Failed to generate speech.");
            }
        } catch (e: any) {
            alert("TTS Error: " + (e as any).message);
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
                <button onClick={() => setActiveTab('tts')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'tts' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Text-to-Speech</button>
                <button onClick={() => setActiveTab('transcribe')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'transcribe' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Transcription</button>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col">
                
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
                        <div className="text-center">
                             <h2 className="text-lg font-bold text-white">Audio Transcription</h2>
                             <p className="text-slate-400 text-xs mt-1">Get accurate text from audio files.</p>
                        </div>
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
