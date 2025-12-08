import React from 'react';
import { XCircle, MicOff } from 'lucide-react';

interface PermissionHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRetry: () => void;
}

const PermissionHelpModal: React.FC<PermissionHelpModalProps> = ({ isOpen, onClose, onRetry }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <XCircle className="w-6 h-6" />
                </button>
                
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <MicOff className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Microphone Access Denied</h3>
                    <p className="text-slate-400 text-sm mb-6">
                        Zee Builder needs access to your microphone to record audio. 
                        It seems permission was denied or blocked.
                    </p>
                    
                    <div className="bg-slate-800 rounded-xl p-4 text-left w-full mb-6">
                        <h4 className="text-xs font-bold text-slate-300 uppercase mb-2">How to enable:</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="bg-slate-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                                Click the lock/settings icon in your browser address bar.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-slate-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                                Find "Microphone" and set it to "Allow".
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-slate-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                                Refresh the page and try again.
                            </li>
                        </ul>
                    </div>
                    
                    <button 
                        onClick={() => {
                            onClose();
                            onRetry();
                        }}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
                    >
                        I've Enabled It, Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionHelpModal;
