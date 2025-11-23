
import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { Video, Loader2, PlayCircle, Film, Download } from 'lucide-react';
import { ModelType } from '../types';

const VideoStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState(ModelType.VEO_FAST);

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setVideoUrl(null);
        try {
            const url = await generateVideo(prompt, aspectRatio, undefined, selectedModel);
            if (url) setVideoUrl(url);
        } catch (error) {
            console.error(error);
            alert("Video generation failed. Please try again or check your API key billing status.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto">
            <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-800 text-center">
                     <div className="w-12 h-12 bg-orange-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-orange-900/50">
                        <Video className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Veo Video Generator</h2>
                    <p className="text-slate-400">Create high-fidelity videos from text prompts using Google Veo.</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                            <select 
                                value={selectedModel} 
                                onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500"
                            >
                                <option value={ModelType.VEO_FAST}>Veo Fast (Preview) - Faster generation</option>
                                <option value={ModelType.VEO}>Veo 3.1 (Preview) - Higher quality</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Video Prompt</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A neon hologram of a cat driving at top speed..."
                            className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setAspectRatio('16:9')}
                                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                                        aspectRatio === '16:9' 
                                            ? 'bg-orange-600/20 border-orange-500 text-orange-400' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    Landscape (16:9)
                                </button>
                                <button 
                                    onClick={() => setAspectRatio('9:16')}
                                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                                        aspectRatio === '9:16' 
                                            ? 'bg-orange-600/20 border-orange-500 text-orange-400' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    Portrait (9:16)
                                </button>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 hover:from-orange-500 hover:to-red-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {selectedModel === ModelType.VEO ? 'Generating High-Quality Video...' : 'Generating Fast Video...'}
                            </>
                        ) : (
                            <>
                                <Film className="w-5 h-5 mr-2" />
                                Generate Video
                            </>
                        )}
                    </button>
                </div>

                {videoUrl && (
                    <div className="p-8 bg-black border-t border-slate-800 animate-in fade-in">
                        <video 
                            src={videoUrl} 
                            controls 
                            autoPlay 
                            className="w-full rounded-lg shadow-2xl border border-slate-800" 
                        />
                        <div className="mt-6 flex justify-center">
                            <a 
                                href={videoUrl} 
                                download={`veo-generated-${Date.now()}.mp4`}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Video
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoStudio;
