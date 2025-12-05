import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            // Content hash in filenames for cache busting
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
            manualChunks(id) {
              // Vendor chunks based on node_modules
              if (id.includes('node_modules')) {
                // React core
                if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) {
                  return 'vendor-react';
                }
                // UI libraries
                if (id.includes('lucide-react') || id.includes('sweetalert2')) {
                  return 'vendor-ui';
                }
                // CodeMirror - often very large
                if (id.includes('@codemirror') || id.includes('@lezer')) {
                  return 'vendor-codemirror';
                }
                // Sandpack - code preview
                if (id.includes('sandpack') || id.includes('codesandbox')) {
                  return 'vendor-sandpack';
                }
                // Supabase
                if (id.includes('supabase')) {
                  return 'vendor-supabase';
                }
                // Other large vendors
                if (id.includes('marked') || id.includes('prismjs')) {
                  return 'vendor-markdown';
                }
              }
              
              // Split app components by feature
              if (id.includes('/components/')) {
                if (id.includes('AudioStudio')) return 'feature-audio';
                if (id.includes('ImageStudio')) return 'feature-image';
                if (id.includes('VideoStudio')) return 'feature-video';
                if (id.includes('Builder')) return 'feature-builder';
                if (id.includes('ChatInterface')) return 'feature-chat';
              }
            }
          }
        },
        chunkSizeWarningLimit: 600,
      }
    };
});
