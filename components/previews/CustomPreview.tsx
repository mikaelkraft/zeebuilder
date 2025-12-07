
import React, { useEffect, useRef } from 'react';
import { ProjectFile, Stack } from '../../types';

interface CustomPreviewProps {
    files: ProjectFile[];
    stack: Stack;
    className?: string;
}

const CustomPreview: React.FC<CustomPreviewProps> = ({ files, stack, className }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!iframeRef.current) return;

        // Simple preview logic for HTML/JS/CSS
        // For React, we'd need a bundler like in Builder.tsx
        // Since Builder.tsx already has a bundler, this component might be redundant 
        // if it's just for the "Preview" tab.
        // But if the user wants to replace StackBlitz, we can try to render basic HTML here.
        
        const htmlFile = files.find(f => f.name.endsWith('.html'))?.content || '<h1>No HTML file found</h1>';
        const cssFile = files.find(f => f.name.endsWith('.css'))?.content || '';
        const jsFile = files.find(f => f.name.endsWith('.js'))?.content || '';

        const srcDoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${cssFile}</style>
            </head>
            <body>
                ${htmlFile}
                <script>${jsFile}</script>
            </body>
            </html>
        `;

        iframeRef.current.srcdoc = srcDoc;

    }, [files, stack]);

    return (
        <div className={`w-full h-full bg-white ${className}`}>
            <iframe 
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Custom Preview"
                sandbox="allow-scripts"
            />
        </div>
    );
};

export default CustomPreview;
