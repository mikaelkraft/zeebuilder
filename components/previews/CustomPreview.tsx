
import React, { useEffect, useState, useRef } from 'react';
import { ProjectFile, Stack } from '../../types';
import { Loader2, AlertCircle } from 'lucide-react';

interface CustomPreviewProps {
    files: ProjectFile[];
    stack: Stack;
    className?: string;
}

const CustomPreview: React.FC<CustomPreviewProps> = ({ files, stack, className }) => {
    const [iframeSrc, setIframeSrc] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        generatePreview();
        return () => {
            if (iframeSrc) URL.revokeObjectURL(iframeSrc);
        };
    }, [files, stack]);

    const generatePreview = () => {
        setLoading(true);
        setError(null);

        try {
            // Get inline CSS
            const cssFiles = files.filter(f => f.name.endsWith('.css'));
            const inlineCss = cssFiles.map(f => f.content).join('\n');
            
            // For Vue stack, use index.html directly (CDN-based)
            if (stack === 'vue') {
                const htmlFile = files.find(f => f.name === 'index.html' || f.name.endsWith('.html'));
                const jsFiles = files.filter(f => f.name.endsWith('.js'));
                
                let htmlContent = htmlFile?.content || '<!DOCTYPE html><html><head><title>Preview</title></head><body><h1>Hello World</h1></body></html>';
                
                // Ensure we have a proper HTML structure
                if (!htmlContent.includes('<head>')) {
                    htmlContent = htmlContent.replace('<html>', '<html><head></head>');
                }
                if (!htmlContent.includes('</head>')) {
                    htmlContent = htmlContent.replace('<body', '</head><body');
                }
                
                // Inject Tailwind first
                if (!htmlContent.includes('tailwindcss')) {
                    htmlContent = htmlContent.replace(/<head>/i, '<head>\n<script src="https://cdn.tailwindcss.com"></script>');
                }
                
                // Inject CSS files
                if (inlineCss) {
                    htmlContent = htmlContent.replace(/<\/head>/i, `<style>\n${inlineCss}\n</style>\n</head>`);
                }
                
                // Inject all JS files before </body>
                if (jsFiles.length > 0) {
                    const allJs = jsFiles.map(f => `// ${f.name}\n${f.content}`).join('\n\n');
                    if (htmlContent.includes('</body>')) {
                        htmlContent = htmlContent.replace(/<\/body>/i, `<script>\n${allJs}\n</script>\n</body>`);
                    } else {
                        htmlContent += `<script>\n${allJs}\n</script>`;
                    }
                }
                
                const blob = new Blob([htmlContent], {type: 'text/html'});
                setIframeSrc(URL.createObjectURL(blob));
                setLoading(false);
                return;
            }
            
            // Find all JS/TS files for React stacks
            const jsFiles = files.filter(f => f.name.match(/\.(js|jsx|ts|tsx)$/));
            const appFile = jsFiles.find(f => f.name.match(/App\.(js|jsx|ts|tsx)$/));
            
            if (!appFile && stack !== 'html') {
                // Fallback for HTML stack or missing App file
                const indexHtml = files.find(f => f.name === 'index.html')?.content;
                if (indexHtml) {
                     const blob = new Blob([indexHtml], {type: 'text/html'});
                     setIframeSrc(URL.createObjectURL(blob));
                     setLoading(false);
                     return;
                }

                const noAppHtml = `<!DOCTYPE html><html><body style="padding:20px;font-family:system-ui;"><p>No App file found. Create App.tsx or App.jsx.</p></body></html>`;
                const blob = new Blob([noAppHtml], {type: 'text/html'});
                setIframeSrc(URL.createObjectURL(blob));
                setLoading(false);
                return;
            }
            
            // Get all component files (not App) to bundle them
            const componentFiles = jsFiles.filter(f => !f.name.match(/App\.(js|jsx|ts|tsx)$/));
            
            // Clean TypeScript syntax from code - remove ALL imports
            const cleanTS = (code: string) => {
                let c = code;
                // Remove ALL import statements - match complete lines
                c = c.split('\n').filter(line => !line.trim().startsWith('import ')).join('\n');
                // Remove type exports
                c = c.replace(/export\s+type\s+\{[^}]*\};?\s*/g, '');
                c = c.replace(/export\s+type\s+\w+\s*=\s*[^;]+;/g, '');
                // Remove interfaces and type declarations
                c = c.replace(/(?:export\s+)?interface\s+\w+[^{]*\{[\s\S]*?\}/g, '');
                c = c.replace(/(?:export\s+)?type\s+\w+\s*(?:<[^>]*>)?\s*=\s*[^;]+;/g, '');
                // Remove type annotations
                c = c.replace(/:\s*(?:React\.)?(?:FC|FunctionComponent|ComponentType|ReactNode|ReactElement|JSX\.Element|string|number|boolean|any|void|null|undefined|object|Array|Record|Promise|Set|Map)(?:<[^>]*>)?(?:\s*\|\s*\w+(?:<[^>]*>)?)*(?=\s*[=,)}\];])/g, '');
                c = c.replace(/:\s*\([^)]+\)\s*=>\s*\w+(?:<[^>]*>)?/g, '');
                c = c.replace(/:\s*\{[^}]+\}(?=\s*[=,)}\];])/g, '');
                // Remove generics from function declarations
                c = c.replace(/<\s*(?:\w+\s*(?:extends\s+\w+)?(?:,\s*\w+\s*(?:extends\s+\w+)?)*)\s*>\s*\(/g, '(');
                // Remove 'as' assertions
                c = c.replace(/\s+as\s+(?:const|(?:React\.)?\w+(?:<[^>]*>)?(?:\[\])?)/g, '');
                // Clean up exports
                c = c.replace(/export\s+default\s+function\s+/g, 'function ');
                c = c.replace(/export\s+default\s+/g, 'const _DefaultExport = ');
                c = c.replace(/export\s+(?:const|let|var|function)/g, m => m.replace('export ', ''));
                return c;
            };

            // Process all component files first
            const componentCode = componentFiles.map(f => {
                const code = cleanTS(f.content);
                const name = f.name.replace(/^(src\/|components\/)?/, '').replace(/\.(js|jsx|ts|tsx)$/, '');
                // Extract component name from file
                const funcMatch = code.match(/function\s+(\w+)\s*\(/);
                const constMatch = code.match(/(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)|)\s*=>/);
                const compName = funcMatch?.[1] || constMatch?.[1] || name;
                return { name, compName, code };
            });
            
            const appCode = appFile ? cleanTS(appFile.content) : '';
            
            // Find the component name
            let componentName = 'App';
            if (appCode) {
                const funcMatch = appCode.match(/function\s+(\w+)\s*\(/);
                const constMatch = appCode.match(/(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)|)\s*=>/);
                if (funcMatch) componentName = funcMatch[1];
                else if (constMatch) componentName = constMatch[1];
            }
            
            // Common lucide icons as simple SVG components
            const lucideIcons = `
            // Common Lucide Icons as SVG components
            const Sparkles = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z'}), React.createElement('path', {d:'M5 3v4'}), React.createElement('path', {d:'M3 5h4'}), React.createElement('path', {d:'M19 17v4'}), React.createElement('path', {d:'M17 19h4'}));
            const Sparkle = Sparkles;
            const Star = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('polygon', {points:'12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'}));
            const Heart = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'}));
            const Check = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M20 6 9 17l-5-5'}));
            const X = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M18 6 6 18'}), React.createElement('path', {d:'m6 6 12 12'}));
            const Menu = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('line', {x1:4, x2:20, y1:12, y2:12}), React.createElement('line', {x1:4, x2:20, y1:6, y2:6}), React.createElement('line', {x1:4, x2:20, y1:18, y2:18}));
            const ChevronRight = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m9 18 6-6-6-6'}));
            const ChevronLeft = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m15 18-6-6 6-6'}));
            const ChevronDown = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m6 9 6 6 6-6'}));
            const ArrowRight = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M5 12h14'}), React.createElement('path', {d:'m12 5 7 7-7 7'}));
            const Search = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:11, cy:11, r:8}), React.createElement('path', {d:'m21 21-4.3-4.3'}));
            const User = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'}), React.createElement('circle', {cx:12, cy:7, r:4}));
            const Settings = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'}), React.createElement('circle', {cx:12, cy:12, r:3}));
            const Home = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'}), React.createElement('polyline', {points:'9 22 9 12 15 12 15 22'}));
            const Mail = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:20, height:16, x:2, y:4, rx:2}), React.createElement('path', {d:'m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'}));
            const Phone = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'}));
            const Plus = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M5 12h14'}), React.createElement('path', {d:'M12 5v14'}));
            const Minus = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M5 12h14'}));
            const Zap = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('polygon', {points:'13 2 3 14 12 14 11 22 21 10 12 10 13 2'}));
            const Sun = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:4}), React.createElement('path', {d:'M12 2v2'}), React.createElement('path', {d:'M12 20v2'}), React.createElement('path', {d:'m4.93 4.93 1.41 1.41'}), React.createElement('path', {d:'m17.66 17.66 1.41 1.41'}), React.createElement('path', {d:'M2 12h2'}), React.createElement('path', {d:'M20 12h2'}), React.createElement('path', {d:'m6.34 17.66-1.41 1.41'}), React.createElement('path', {d:'m19.07 4.93-1.41 1.41'}));
            const Moon = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'}));
            const Globe = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('path', {d:'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'}), React.createElement('path', {d:'M2 12h20'}));
            const Code = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('polyline', {points:'16 18 22 12 16 6'}), React.createElement('polyline', {points:'8 6 2 12 8 18'}));
            const Terminal = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('polyline', {points:'4 17 10 11 4 5'}), React.createElement('line', {x1:12, x2:20, y1:19, y2:19}));
            const Loader2 = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', className:'animate-spin', ...props}, React.createElement('path', {d:'M21 12a9 9 0 1 1-6.219-8.56'}));
            const AlertCircle = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('line', {x1:12, x2:12, y1:8, y2:12}), React.createElement('line', {x1:12, x2:12.01, y1:16, y2:16}));
            const Info = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('path', {d:'M12 16v-4'}), React.createElement('path', {d:'M12 8h.01'}));
            const Shield = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'}));
            const Rocket = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z'}), React.createElement('path', {d:'m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z'}), React.createElement('path', {d:'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0'}), React.createElement('path', {d:'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'}));
            const ChevronUp = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m18 15-6-6-6 6'}));
            const ArrowLeft = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m12 19-7-7 7-7'}), React.createElement('path', {d:'M19 12H5'}));
            const ArrowUp = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m5 12 7-7 7 7'}), React.createElement('path', {d:'M12 19V5'}));
            const ArrowDown = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M12 5v14'}), React.createElement('path', {d:'m19 12-7 7-7-7'}));
            const Trash = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M3 6h18'}), React.createElement('path', {d:'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'}), React.createElement('path', {d:'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'}));
            const Edit = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'}), React.createElement('path', {d:'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'}));
            const Pencil = Edit;
            const Copy = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:14, height:14, x:8, y:8, rx:2, ry:2}), React.createElement('path', {d:'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'}));
            const Download = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'}), React.createElement('polyline', {points:'7 10 12 15 17 10'}), React.createElement('line', {x1:12, x2:12, y1:15, y2:3}));
            const Upload = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'}), React.createElement('polyline', {points:'17 8 12 3 7 8'}), React.createElement('line', {x1:12, x2:12, y1:3, y2:15}));
            const Eye = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'}), React.createElement('circle', {cx:12, cy:12, r:3}));
            const EyeOff = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M9.88 9.88a3 3 0 1 0 4.24 4.24'}), React.createElement('path', {d:'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68'}), React.createElement('path', {d:'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61'}), React.createElement('line', {x1:2, x2:22, y1:2, y2:22}));
            const Lock = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:18, height:11, x:3, y:11, rx:2, ry:2}), React.createElement('path', {d:'M7 11V7a5 5 0 0 1 10 0v4'}));
            const Unlock = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:18, height:11, x:3, y:11, rx:2, ry:2}), React.createElement('path', {d:'M7 11V7a5 5 0 0 1 9.9-1'}));
            const Bell = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'}), React.createElement('path', {d:'M13.73 21a2 2 0 0 1-3.46 0'}));
            const Calendar = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:18, height:18, x:3, y:4, rx:2, ry:2}), React.createElement('line', {x1:16, x2:16, y1:2, y2:6}), React.createElement('line', {x1:8, x2:8, y1:2, y2:6}), React.createElement('line', {x1:3, x2:21, y1:10, y2:10}));
            const Clock = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('polyline', {points:'12 6 12 12 16 14'}));
            const Image = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('rect', {width:18, height:18, x:3, y:3, rx:2, ry:2}), React.createElement('circle', {cx:9, cy:9, r:2}), React.createElement('path', {d:'m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'}));
            const Video = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m22 8-6 4 6 4V8Z'}), React.createElement('rect', {width:14, height:12, x:2, y:6, rx:2, ry:2}));
            const Music = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M9 18V5l12-2v13'}), React.createElement('circle', {cx:6, cy:18, r:3}), React.createElement('circle', {cx:18, cy:16, r:3}));
            const File = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'}), React.createElement('polyline', {points:'14 2 14 8 20 8'}));
            const Folder = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'}));
            const Link = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'}), React.createElement('path', {d:'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'}));
            const ExternalLink = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'}), React.createElement('polyline', {points:'15 3 21 3 21 9'}), React.createElement('line', {x1:10, x2:21, y1:14, y2:3}));
            const Share = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:18, cy:5, r:3}), React.createElement('circle', {cx:6, cy:12, r:3}), React.createElement('circle', {cx:18, cy:19, r:3}), React.createElement('line', {x1:8.59, x2:15.42, y1:13.51, y2:17.49}), React.createElement('line', {x1:15.41, x2:8.59, y1:6.51, y2:10.49}));
            const Send = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('line', {x1:22, x2:11, y1:2, y2:13}), React.createElement('polygon', {points:'22 2 15 22 11 13 2 9 22 2'}));
            const MessageCircle = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z'}));
            const Gift = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('polyline', {points:'20 12 20 22 4 22 4 12'}), React.createElement('rect', {width:20, height:5, x:2, y:7}), React.createElement('line', {x1:12, x2:12, y1:22, y2:7}), React.createElement('path', {d:'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z'}), React.createElement('path', {d:'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z'}));
            const Award = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:8, r:7}), React.createElement('polyline', {points:'8.21 13.89 7 23 12 20 17 23 15.79 13.88'}));
            const Trophy = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M6 9H4.5a2.5 2.5 0 0 1 0-5H6'}), React.createElement('path', {d:'M18 9h1.5a2.5 2.5 0 0 0 0-5H18'}), React.createElement('path', {d:'M4 22h16'}), React.createElement('path', {d:'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22'}), React.createElement('path', {d:'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22'}), React.createElement('path', {d:'M18 2H6v7a6 6 0 0 0 12 0V2Z'}));
            const Crown = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14'}));
            const Flame = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('path', {d:'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'}));
            const Lightning = Zap;
            const Bolt = Zap;
            const Close = X;
            const XCircle = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('path', {d:'m15 9-6 6'}), React.createElement('path', {d:'m9 9 6 6'}));
            const CheckCircle = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:10}), React.createElement('path', {d:'m9 12 2 2 4-4'}));
            const MoreHorizontal = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:1}), React.createElement('circle', {cx:19, cy:12, r:1}), React.createElement('circle', {cx:5, cy:12, r:1}));
            const MoreVertical = (props) => React.createElement('svg', {xmlns:'http://www.w3.org/2000/svg', width:24, height:24, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', ...props}, React.createElement('circle', {cx:12, cy:12, r:1}), React.createElement('circle', {cx:12, cy:5, r:1}), React.createElement('circle', {cx:12, cy:19, r:1}));
            const Loader = Loader2;
            const Spinner = Loader2;
            const Loading = Loader2;
            `;

            const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"><\\/script>
    <script type="module">
        import * as ReactPkg from "https://esm.sh/react@19.0.0?dev";
        import * as ReactDOMPkg from "https://esm.sh/react-dom@19.0.0/client?dev";
        
        const React = ReactPkg.default || ReactPkg;
        const ReactDOM = ReactDOMPkg.default || ReactDOMPkg;

        window.React = React;
        window.ReactDOM = ReactDOM;
        
        // Expose hooks to global scope safely
        const hooks = ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useContext', 'useReducer', 'useLayoutEffect', 'createContext', 'Fragment', 'memo', 'forwardRef'];
        hooks.forEach(h => {
            if (React && React[h]) {
                window[h] = React[h];
            }
        });

        // Load Babel after React is ready
        const babelScript = document.createElement('script');
        babelScript.src = "https://unpkg.com/@babel/standalone@7.23.5/babel.min.js";
        babelScript.onload = () => {
            if (window.Babel) {
                window.Babel.transformScriptTags();
            }
        };
        document.head.appendChild(babelScript);
    <\\/script>
    <style>
        body { background-color: #ffffff; margin: 0; font-family: system-ui, -apple-system, sans-serif; }
        #root { min-height: 100vh; }
        ${inlineCss}
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script>
        window.onerror = function(msg, url, line, col, error) {
            document.getElementById('root').innerHTML = '<div style="padding:20px;color:#ef4444;font-family:monospace;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin:20px;"><strong>Error:</strong><br>' + msg + '</div>';
            return true;
        };
    <\\/script>
    
    <script type="text/babel" data-presets="react">
        // Common Lucide Icons
        ${lucideIcons}
        
        // Error boundary
        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
            }
            static getDerivedStateFromError(error) {
                return { hasError: true, error };
            }
            render() {
                if (this.state.hasError) {
                    return React.createElement('div', {
                        style: {padding: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', margin: '20px', fontFamily: 'monospace'}
                    }, [
                        React.createElement('strong', {key:'title', style: {color: '#dc2626'}}, 'Render Error:'),
                        React.createElement('pre', {key:'msg', style: {color: '#7f1d1d', marginTop: '8px', whiteSpace: 'pre-wrap'}}, this.state.error?.message)
                    ]);
                }
                return this.props.children;
            }
        }
        
        // Component files
        ${componentCode.map(c => `// ${c.name}\n${c.code}`).join('\\n\\n')}

        // User's App component
        ${appCode}
        
        // Render
        try {
            const AppComponent = typeof ${componentName} !== 'undefined' ? ${componentName} : 
                                 typeof _DefaultExport !== 'undefined' ? _DefaultExport : 
                                 typeof App !== 'undefined' ? App : null;
            
            if (AppComponent) {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(React.createElement(ErrorBoundary, null, React.createElement(AppComponent)));
            } else {
                document.getElementById('root').innerHTML = '<div style="padding:20px;color:#ef4444;font-family:monospace;">No App component found. Make sure your file exports a component.</div>';
            }
        } catch (e) {
            document.getElementById('root').innerHTML = '<div style="padding:20px;color:#ef4444;font-family:monospace;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin:20px;"><strong>Error:</strong><br>' + e.message + '</div>';
        }
    <\/script>
</body>
</html>`;

            const finalBlob = new Blob([html], {type: 'text/html'});
            setIframeSrc(URL.createObjectURL(finalBlob));
            setLoading(false);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className={`w-full h-full bg-white relative ${className}`}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10 p-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertCircle className="w-5 h-5" />
                            <h3 className="font-bold">Preview Error</h3>
                        </div>
                        <p className="text-sm text-red-500 font-mono whitespace-pre-wrap">{error}</p>
                    </div>
                </div>
            )}
            <iframe 
                ref={iframeRef}
                src={iframeSrc}
                className="w-full h-full border-0"
                title="Custom Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            />
        </div>
    );
};

export default CustomPreview;
