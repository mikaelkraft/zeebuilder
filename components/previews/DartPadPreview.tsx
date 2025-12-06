import React, { useEffect, useRef, useState } from 'react';
import { ProjectFile } from '../../types';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface DartPadPreviewProps {
    files: ProjectFile[];
    className?: string;
}

const DartPadPreview: React.FC<DartPadPreviewProps> = ({ files, className }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showFallback, setShowFallback] = useState(false);
    const [key, setKey] = useState(0); // To force reload

    useEffect(() => {
        setIsLoading(true);
        setShowFallback(false);
        
        const timer = setTimeout(() => {
            // We can't easily read state inside timeout without ref or functional update, 
            // but here we just trigger the fallback UI if loading is still true
            setIsLoading(current => {
                if (current) setShowFallback(true);
                return current;
            });
        }, 8000); // Show fallback options if not loaded in 8s

        return () => clearTimeout(timer);
    }, [files, key]);

    const mainFile = files.find(f => f.name.endsWith('main.dart')) || files[0];
    const code = mainFile ? encodeURIComponent(mainFile.content) : '';
    const src = `https://dartpad.dev/embed-inline.html?id=&split=0&theme=dark&code=${code}`;

    return (
        <div className={`w-full h-full bg-[#1e1e1e] relative ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] z-10">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-slate-400 text-xs">Loading DartPad...</p>
                    </div>
                </div>
            )}
            
            {showFallback && isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]/90 z-20 backdrop-blur-sm p-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md text-center shadow-2xl">
                        <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                        <h3 className="text-white font-bold mb-2">Preview taking a while?</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            DartPad seems to be slow or unavailable. You can try reloading or use an external runner.
                        </p>
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => setKey(k => k + 1)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Reload Preview
                            </button>
                            <div className="flex gap-2 justify-center mt-2">
                                <a 
                                    href="https://zapp.run/new" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-medium flex items-center justify-center flex-1"
                                >
                                    <ExternalLink className="w-3 h-3 mr-1" /> Open in Zapp
                                </a>
                                <a 
                                    href="https://flutlab.io/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-lg text-xs font-medium flex items-center justify-center flex-1"
                                >
                                    <ExternalLink className="w-3 h-3 mr-1" /> Open in FlutLab
                                </a>
                            </div>
                            <button 
                                onClick={() => setShowFallback(false)} // Dismiss overlay but keep loading
                                className="mt-2 text-slate-500 hover:text-slate-300 text-xs underline"
                            >
                                Continue waiting...
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <iframe
                key={key}
                ref={iframeRef}
                src={src}
                title="DartPad Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
};

export default DartPadPreview;
