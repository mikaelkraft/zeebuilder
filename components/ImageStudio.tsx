
import React, { useState, useRef, useEffect } from 'react';
import { generateImage, editImage } from '../services/geminiService';
import { Image, Wand2, Loader2, Upload, ZoomIn, ZoomOut, RefreshCcw, Download, Stamp, FolderPlus, Check } from 'lucide-react';
import { ModelType, SavedProject } from '../types';

const ImageStudio: React.FC = () => {
    const [mode, setMode] = useState<'generate' | 'edit' | 'logo'>('generate');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<{data: string, mimeType: string} | null>(null);

    // Configs
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [imageSize, setImageSize] = useState('1K');
    const [selectedModel, setSelectedModel] = useState(ModelType.PRO_IMAGE);

    // Logo Specifics
    const [appName, setAppName] = useState('');
    const [logoStyle, setLogoStyle] = useState('Modern');

    // Preview Controls
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const startPan = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Project Integration State
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    // Reset view when result changes
    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setSaveStatus('idle');
    }, [resultUrl, mode]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (typeof result === 'string') {
                const base64 = result.split(',')[1];
                setUploadedImage({ data: base64, mimeType: file.type });
                setResultUrl(`data:${file.type};base64,${base64}`); // Show preview
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAction = async () => {
        setIsLoading(true);
        if (mode === 'generate' || mode === 'logo') setResultUrl(null);
        setSaveStatus('idle');
        
        try {
            if (mode === 'generate') {
                const response = await generateImage(prompt, aspectRatio, imageSize, selectedModel);
                const parts = response?.candidates?.[0]?.content?.parts;
                if (parts && parts.length > 0) {
                    for (const part of parts) {
                        if (part.inlineData) {
                            setResultUrl(`data:image/png;base64,${part.inlineData.data}`);
                            break;
                        }
                    }
                } else {
                    alert("Generation produced no content.");
                }
            } else if (mode === 'logo') {
                const logoPrompt = `Design a ${logoStyle.toLowerCase()} logo for an application named "${appName}". Context/Description: ${prompt}. The logo should be high-quality, professional, iconic, and suitable for an app icon. Ensure a clean background.`;
                // Force Pro Image for quality logos
                const response = await generateImage(logoPrompt, aspectRatio, imageSize, ModelType.PRO_IMAGE);
                const parts = response?.candidates?.[0]?.content?.parts;
                 if (parts && parts.length > 0) {
                    for (const part of parts) {
                        if (part.inlineData) {
                            setResultUrl(`data:image/png;base64,${part.inlineData.data}`);
                            break;
                        }
                    }
                } else {
                    alert("Logo generation failed.");
                }
            } else if (mode === 'edit') {
                if (!uploadedImage) return;
                const response = await editImage(uploadedImage.data, uploadedImage.mimeType, prompt);
                 const parts = response?.candidates?.[0]?.content?.parts;
                if (parts && parts.length > 0) {
                    for (const part of parts) {
                        if (part.inlineData) {
                            setResultUrl(`data:image/png;base64,${part.inlineData.data}`);
                            break;
                        }
                    }
                } else {
                    alert("Editing failed.");
                }
            }
        } catch (error) {
            console.error(error);
            alert("Error generating content.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToProject = () => {
        if (!resultUrl) return;

        const activeId = localStorage.getItem('zee_active_project_id');
        if (!activeId) {
            alert("No active project found. Please open a project in the Builder first.");
            return;
        }

        const storedProjects = localStorage.getItem('zee_projects');
        if (storedProjects) {
            const projects: SavedProject[] = JSON.parse(storedProjects);
            const projectIndex = projects.findIndex(p => p.id === activeId);
            
            if (projectIndex >= 0) {
                const project = projects[projectIndex];
                const fileName = `src/assets/${mode === 'logo' ? 'logo' : 'generated'}-${Date.now()}.png`;
                
                project.files.push({
                    name: fileName,
                    content: resultUrl, // Storing Data URL directly
                    language: 'image'
                });
                
                project.lastModified = Date.now();
                projects[projectIndex] = project;
                
                localStorage.setItem('zee_projects', JSON.stringify(projects));
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        }
    };

    // Panning Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!resultUrl) return;
        setIsDragging(true);
        startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPan({
            x: e.clientX - startPan.current.x,
            y: e.clientY - startPan.current.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!resultUrl) return;
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(z => Math.min(Math.max(z + delta, 0.5), 5));
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {/* Controls */}
            <div className="w-full md:w-80 flex flex-col space-y-6 bg-slate-900 p-6 rounded-xl border border-slate-800 overflow-y-auto custom-scrollbar">
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Studio Mode</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => { setMode('generate'); }}
                            className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center justify-center gap-1 transition-colors ${mode === 'generate' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            <Image className="w-4 h-4" /> Generate
                        </button>
                         <button 
                            onClick={() => { setMode('logo'); }}
                            className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center justify-center gap-1 transition-colors ${mode === 'logo' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            <Stamp className="w-4 h-4" /> Logo Design
                        </button>
                        <button 
                            onClick={() => { setMode('edit'); }}
                            className={`p-2 rounded-lg text-xs font-medium flex flex-col items-center justify-center gap-1 transition-colors ${mode === 'edit' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            <Wand2 className="w-4 h-4" /> Edit
                        </button>
                    </div>
                </div>

                {(mode === 'edit') && (
                    <div className="p-4 border border-dashed border-slate-700 rounded-lg bg-slate-950/50 text-center">
                         <label className="cursor-pointer block">
                            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                            <span className="text-xs text-slate-400 block">Upload Source Image</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                        {uploadedImage && <p className="text-xs text-green-400 mt-2">Image Loaded</p>}
                    </div>
                )}

                {mode === 'logo' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">App Name</label>
                            <input 
                                type="text"
                                value={appName}
                                onChange={(e) => setAppName(e.target.value)}
                                placeholder="e.g. Zee Builder"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                         <div>
                            <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Logo Style</label>
                            <select 
                                value={logoStyle} 
                                onChange={(e) => setLogoStyle(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                            >
                                <option value="Modern">Modern</option>
                                <option value="Minimalist">Minimalist</option>
                                <option value="Playful">Playful</option>
                                <option value="Abstract">Abstract</option>
                                <option value="Retro">Retro</option>
                                <option value="Futuristic">Futuristic</option>
                                <option value="3D Render">3D Render</option>
                            </select>
                        </div>
                    </div>
                )}

                {(mode === 'generate' || mode === 'logo') && (
                    <div className="space-y-4">
                        {mode === 'generate' && (
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Model</label>
                                <select 
                                    value={selectedModel} 
                                    onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                                >
                                    <option value={ModelType.PRO_IMAGE}>Zee Pro Image (High Quality)</option>
                                    <option value={ModelType.FLASH_IMAGE}>Zee Flash Image (Fast)</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Aspect Ratio</label>
                            <select 
                                value={aspectRatio} 
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                            >
                                <option value="1:1">1:1 (Square)</option>
                                <option value="16:9">16:9 (Landscape)</option>
                                <option value="9:16">9:16 (Portrait)</option>
                                <option value="3:4">3:4</option>
                                <option value="4:3">4:3</option>
                            </select>
                        </div>
                        <div>
                             <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Size</label>
                             <select 
                                value={imageSize} 
                                onChange={(e) => setImageSize(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                            >
                                <option value="1K">1K</option>
                                <option value="2K">2K (Pro)</option>
                                <option value="4K">4K (Pro)</option>
                            </select>
                        </div>
                    </div>
                )}
                
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-800">
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Instructions</h4>
                     <p className="text-xs text-slate-400 leading-relaxed">
                         Ensure you have a stable network connection.
                         Use mouse wheel to zoom in/out. Click and drag to pan.
                     </p>
                </div>

                <div>
                    <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">
                        {mode === 'logo' ? 'Brief Description' : 'Prompt'}
                    </label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={mode === 'edit' ? "e.g. Add a retro filter..." : mode === 'logo' ? "e.g. A stylized rocket ship launching..." : "Describe your image..."}
                        className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    />
                </div>

                <button 
                    onClick={handleAction}
                    disabled={isLoading || !prompt}
                    className={`w-full text-white font-bold py-3 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                        mode === 'logo' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-900/30' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-purple-900/30'
                    }`}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'logo' ? 'Create Logo' : 'Generate')}
                </button>
            </div>

            {/* Canvas / Preview */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative group">
                {/* Zoom & Download Controls Overlay */}
                {resultUrl && (
                    <div className="absolute top-4 right-4 z-20 flex items-center space-x-1 bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 hover:bg-slate-700 rounded text-slate-300" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                        <span className="text-xs font-mono text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(z + 0.2, 5))} className="p-2 hover:bg-slate-700 rounded text-slate-300" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-slate-700 mx-1"></div>
                        <button onClick={() => { setZoom(1); setPan({x:0,y:0}); }} className="p-2 hover:bg-slate-700 rounded text-slate-300" title="Reset View"><RefreshCcw className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-slate-700 mx-1"></div>
                        <button 
                            onClick={handleAddToProject}
                            className="p-2 hover:bg-slate-700 rounded text-green-400 hover:text-green-300 flex items-center"
                            title="Add to Active Project"
                        >
                            {saveStatus === 'saved' ? <Check className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
                        </button>
                        <a 
                            href={resultUrl} 
                            download={`zee-gen-${Date.now()}.png`} 
                            className="p-2 hover:bg-slate-700 rounded text-blue-400 hover:text-blue-300"
                            title="Download"
                        >
                            <Download className="w-4 h-4" />
                        </a>
                    </div>
                )}

                <div 
                    ref={containerRef}
                    className={`flex-1 flex items-center justify-center overflow-hidden relative ${resultUrl ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onWheel={handleWheel}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
                    
                    {isLoading ? (
                        <div className="text-center pointer-events-none">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-400 animate-pulse">Creating Magic with Zee...</p>
                        </div>
                    ) : resultUrl ? (
                        <div 
                            style={{ 
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                            }}
                            className="relative will-change-transform"
                        >
                            <img src={resultUrl} alt="Generated" className="max-w-none rounded-lg shadow-2xl pointer-events-none" style={{ maxHeight: '80vh' }} />
                        </div>
                    ) : (
                        <div className="text-center text-slate-600 pointer-events-none">
                            <Image className="w-24 h-24 mx-auto mb-4 opacity-20" />
                            <p>Result will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageStudio;
