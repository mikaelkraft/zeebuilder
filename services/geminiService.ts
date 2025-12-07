
import { GoogleGenAI, Type, Modality, FunctionDeclaration } from "@google/genai";
import { ModelType, ProjectFile, Stack, BuilderChatMessage, DatabaseConfig } from "../types";

// Helper to handle API Key selection for paid models
export const ensureApiKey = async () => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey && window.aistudio.openSelectKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
    return true;
  }
  return false;
};

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Error handling wrapper
const withAuthRetry = async <T>(operation: () => Promise<T>, retries = 1): Promise<T> => {
    try {
        return await operation();
    } catch (error: any) {
        let msg = '';
        if (typeof error === 'string') {
             msg = error.toLowerCase();
        } else if (error instanceof Error) {
             msg = (error.message + ' ' + error.toString()).toLowerCase();
        } else {
             try {
                 msg = JSON.stringify(error).toLowerCase();
             } catch (e) {
                 msg = String(error).toLowerCase();
             }
        }

        if (msg.includes("500") || msg.includes("internal server error")) {
             if (retries > 0) {
                 console.warn("Server Error 500, retrying...", error);
                 await new Promise(resolve => setTimeout(resolve, 3000));
                 return withAuthRetry(operation, retries - 1);
             }
        }

        if (msg.includes("503") || msg.includes("unavailable") || msg.includes("overloaded") || msg.includes("fetch failed")) {
            if (retries > 0) {
                console.warn("Service unavailable, retrying...", error);
                await new Promise(resolve => setTimeout(resolve, 2000)); 
                return withAuthRetry(operation, retries - 1);
            }
        }

        // Handle 400 API_KEY_INVALID specifically along with other auth errors
        if (msg.includes("404") || msg.includes("requested entity was not found") || 
            msg.includes("403") || msg.includes("permission denied") || msg.includes("permission") ||
            (msg.includes("400") && (msg.includes("api key") || msg.includes("api_key_invalid")))) {
            
            console.warn("Auth/API Key error detected, prompting for key selection retry:", error);
            
            if (window.aistudio && window.aistudio.openSelectKey) {
                try {
                    await window.aistudio.openSelectKey();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return withAuthRetry(operation, retries - 1); 
                } catch (e) {
                    throw error; // User cancelled or failed
                }
            }
        }
        throw error;
    }
};

// --- Chat ---

const createTaskFunction: FunctionDeclaration = {
    name: "createTask",
    description: "Create a new task in the user's task list.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Title of the task" },
            description: { type: Type.STRING, description: "Description of the task" },
            priority: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Priority level" }
        },
        required: ["title"]
    }
};

export const createChatSession = async (
    model: ModelType, 
    history: any[] = [], 
    isThinking = false, 
    useMaps = false,
    useSearch = false
) => {
    return withAuthRetry(async () => {
        await ensureApiKey();
        const ai = getClient();
        
        const tools: any[] = [];
        const supportsTools = model !== ModelType.FLASH_LITE;

        // NOTE: Google Search and Function Calling CANNOT be used together.
        // If search is enabled, we skip function declarations.
        if (!isThinking && supportsTools) {
            if (useSearch) {
                // Only use Google Search, no function calling
                tools.push({ googleSearch: {} });
            } else {
                // Use function calling and optionally maps (maps works with functions)
                if (useMaps) tools.push({ googleMaps: {} });
                tools.push({ functionDeclarations: [createTaskFunction] });
            }
        }

        const systemInstruction = `
You are Zee AI, an intelligent assistant created by Mikael Kraft.
You are helpful, creative, and concise. Identify yourself as Zee AI.

CAPABILITIES OF THIS APP (ZEE BUILDER):
1. **App Builder**: Full IDE to build React, Vue, Python, Flutter, and HTML apps. Supports real Preview, Terminal, and Git.
2. **Image Studio**: Generate, Edit, and Animate images using Zee Pro Image.
3. **Audio Studio**: Text-to-Speech generation and Audio Transcription.
4. **Task Board**: Kanban style project management.
5. **Developer API**: Generate API keys to use Zee models in external apps.

IMPORTANT: If the user asks to generate an image or audio, explicitly direct them to use the Image Studio or Audio Studio respectively. Do not attempt to generate media here.
`;

        const config: any = { systemInstruction };

        if (isThinking) {
            config.thinkingConfig = { thinkingBudget: 16000 }; 
        }

        if (tools.length > 0) {
            config.tools = tools;
        }

        return ai.chats.create({
            model: model,
            history: history,
            config: config
        });
    });
};

// --- Project Generation ---

export const generateProject = async (
    history: BuilderChatMessage[], 
    stack: Stack, 
    model: ModelType, 
    currentFiles: ProjectFile[],
    dbConfigs: DatabaseConfig[],
    useSearch: boolean = false
) => {
    return withAuthRetry(async () => {
        await ensureApiKey();
        const ai = getClient();
        
        // Check if the last message has an attachment and what type
        const lastMessage = history[history.length - 1];
        const attachment = lastMessage?.attachment;
        const hasImageAttachment = attachment?.mimeType?.startsWith('image/');
        const hasPdfAttachment = attachment?.mimeType === 'application/pdf';
        const hasZipAttachment = attachment?.mimeType === 'application/zip' || attachment?.name?.endsWith('.zip');
        const hasTextAttachment = attachment?.mimeType?.startsWith('text/') || 
            attachment?.name?.match(/\.(txt|md|json|js|ts|tsx|jsx|py|html|css|xml|yaml|yml)$/i);
        
        const chatHistory = history.map(msg => {
            const parts: any[] = [];
            if (msg.attachment) {
                parts.push({ inlineData: { data: msg.attachment.data, mimeType: msg.attachment.mimeType } });
            }
            // Enhance prompt for different attachment types
            let textPart = msg.text || "";
            if (msg.attachment && !textPart.trim()) {
                if (msg.attachment.mimeType?.startsWith('image/')) {
                    textPart = "Analyze this image and help me build something based on it.";
                } else if (msg.attachment.mimeType === 'application/pdf') {
                    textPart = "Analyze this PDF document and extract relevant information for building.";
                } else if (msg.attachment.mimeType === 'application/zip' || msg.attachment.name?.endsWith('.zip')) {
                    textPart = "Analyze the contents of this zip file.";
                } else {
                    textPart = "Analyze this file and help me with what's inside.";
                }
            }
            parts.push({ text: textPart || "." });
            return { role: msg.role, parts };
        });

        const lastMsg = chatHistory.pop(); 

        const fileContext = currentFiles.map(f => `${f.name}:\n\`\`\`${f.language}\n${f.content}\n\`\`\``).join('\n\n');
        
        const dbContext = dbConfigs.length > 0 
            ? `ACTIVE DATABASE CREDENTIALS (MUST be used if backend logic is requested):
${JSON.stringify(dbConfigs, null, 2)}
IMPORTANT: When writing connection code, use these EXACT values.`
            : "No active database connections configured.";

        const isTs = stack === 'react-ts';
        const ext = isTs ? 'tsx' : 'js';

        // Enhanced prompt with file type specific instructions
        let attachmentInstructions = '';
        if (hasImageAttachment) {
            attachmentInstructions = `
        **IMAGE ANALYSIS MODE**:
        The user has provided an image. Carefully analyze:
        - UI/UX Layout and structure
        - Color scheme and visual design
        - Components and their arrangement  
        - Typography and spacing
        - Any text, icons, or visual elements
        
        Based on your analysis, generate code that recreates or is inspired by the design.
        Describe what you see in the image in your explanation.`;
        } else if (hasPdfAttachment) {
            attachmentInstructions = `
        **PDF ANALYSIS MODE**:
        The user has provided a PDF document. Analyze its contents:
        - Extract any UI mockups, wireframes, or design specifications
        - Identify requirements, features, or functionality described
        - Look for color schemes, branding guidelines, or style guides
        - Note any diagrams, flowcharts, or architecture descriptions
        
        Use the extracted information to generate relevant code.`;
        } else if (hasZipAttachment) {
            attachmentInstructions = `
        **ZIP FILE ANALYSIS MODE**:
        The user has provided a zip archive. If possible, analyze:
        - File structure and organization
        - Any code files, assets, or configurations
        - Images that could serve as design references
        - Documentation or specification files
        
        Use any relevant content to inform your code generation.`;
        } else if (hasTextAttachment) {
            attachmentInstructions = `
        **TEXT/CODE FILE ANALYSIS MODE**:
        The user has provided a text or code file. Analyze:
        - The content and purpose of the file
        - Any specifications, requirements, or ideas described
        - Code patterns or structures to follow or improve
        - Configuration or data that should be used
        
        Incorporate the file's content into your response appropriately.`;
        }

        const prompt = `
        You are Zee Builder, an expert AI software engineer. 
        You are building a ${stack} application.
        ${attachmentInstructions}
        
        CURRENT FILES:
        ${fileContext}

        DATABASE CONTEXT:
        ${dbContext}

        USER REQUEST:
        ${lastMsg?.parts.map((p:any) => p.text).join(' ')}

        INSTRUCTIONS:
        1. **Analyze the User Request**:
           - If the user asks to "build", "create", "add", "fix", or "update", GENERATE CODE.
           - If a FILE is provided, analyze it and use its content to inform your response.
           - If the user asks a question, explain it.
        
        2. **Code Generation Rules**:
           - Web (React): Use Tailwind CSS. 'export default function App() {}'.
           - Vue: Use CDN structure (<script src="...vue.global.js">). Use options API or Composition API in <script>.
           - Node: Provide package.json and index.js.
           - Python: Provide main.py and requirements.txt. Use standard library where possible.
           - TypeScript: Use .tsx/.ts.
           - Ensure 'package.json' is valid for JS/Node projects.
        
        3. **Response Format**:
           Return ONLY a valid JSON object. You may wrap it in \`\`\`json blocks.
           
        JSON STRUCTURE:
        {
          "files": [
            { "name": "src/App.${ext}", "content": "code here...", "language": "${isTs ? 'typescript' : 'javascript'}" }
          ],
          "explanation": "Brief summary of what you built/analyzed",
          "toolCall": null
        }
        `;

        const config: any = {};
        
        if (useSearch && !model.includes('thinking') && model !== ModelType.FLASH_LITE) {
             config.tools = [{ googleSearch: {} }];
        }

        const result = await ai.models.generateContent({
            model: model,
            contents: [...chatHistory.map(m => ({ role: m.role, parts: m.parts })), { role: 'user', parts: [{ text: prompt }] }],
            config
        });

        let text = result.text || "{}";
        
        try {
            return JSON.parse(text);
        } catch (e) {
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const firstOpen = text.indexOf('{');
            const lastClose = text.lastIndexOf('}');
            
            if (firstOpen !== -1 && lastClose !== -1) {
                const jsonStr = text.substring(firstOpen, lastClose + 1);
                try {
                    return JSON.parse(jsonStr);
                } catch (e2) {
                    throw new Error("Failed to parse generated code. Please try again.");
                }
            } else {
                return { files: [], explanation: text, toolCall: null };
            }
        }
    });
};

// --- Image ---

export const generateImage = async (prompt: string, aspectRatio: string, size: string, model: ModelType) => {
    return withAuthRetry(async () => {
        await ensureApiKey();
        const ai = getClient();
        const config: any = { imageConfig: { aspectRatio: aspectRatio || '1:1' } };
        return ai.models.generateContent({
            model: model,
            contents: { parts: [{ text: prompt }] },
            config
        });
    });
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string) => {
    return withAuthRetry(async () => {
        await ensureApiKey();
        const ai = getClient();
        return ai.models.generateContent({
            model: ModelType.PRO_IMAGE,
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType } },
                    { text: prompt }
                ]
            }
        });
    });
};

// --- Audio ---

export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
    return withAuthRetry(async () => {
        await ensureApiKey();
        const ai = getClient();
        
        const finalVoice = voiceName === 'Zee' ? 'Zephyr' : voiceName;

        const response = await ai.models.generateContent({
            model: ModelType.TTS,
            contents: { parts: [{ text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: finalVoice } }
                }
            }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    });
};

export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
    return withAuthRetry(async () => {
        await ensureApiKey();
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: ModelType.FLASH,
            contents: {
                parts: [
                    { inlineData: { data: base64Audio, mimeType } },
                    { text: "Transcribe this audio exactly." }
                ]
            }
        });
        return response.text;
    });
};

// --- Utilities ---

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result && typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to convert blob to base64"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const decodeAudio = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

// FIXED: DataView constructor must be an ArrayBuffer
export const arrayBufferToAudioBuffer = async (
  chunk: ArrayBuffer | Uint8Array,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  let buffer: ArrayBuffer;

  if (chunk instanceof Uint8Array) {
      const copy = new Uint8Array(chunk.length);
      copy.set(chunk);
      buffer = copy.buffer;
  } else if (chunk instanceof ArrayBuffer) {
      buffer = chunk;
  } else {
      throw new Error("Invalid input type for arrayBufferToAudioBuffer");
  }

  try {
      return await audioContext.decodeAudioData(buffer.slice(0)); 
  } catch (e) {
      const dataView = new DataView(buffer);
      const numSamples = buffer.byteLength / 2;
      const audioBuf = audioContext.createBuffer(1, numSamples, 24000);
      const channel = audioBuf.getChannelData(0);
      for (let i = 0; i < numSamples; i++) {
          channel[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }
      return audioBuf;
  }
};

export const pcm16ToWavBlob = (pcm16: Uint8Array, sampleRate = 24000): Blob => {
    const buffer = new ArrayBuffer(44 + pcm16.length);
    const view = new DataView(buffer);
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcm16.length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); 
    view.setUint16(20, 1, true); 
    view.setUint16(22, 1, true); 
    view.setUint32(24, sampleRate, true); 
    view.setUint32(28, sampleRate * 2, true); 
    view.setUint16(32, 2, true); 
    view.setUint16(34, 16, true); 
    writeString(view, 36, 'data');
    view.setUint32(40, pcm16.length, true);
    const bytes = new Uint8Array(buffer);
    bytes.set(pcm16, 44);
    return new Blob([buffer], { type: 'audio/wav' });
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

export const simulateApiCall = async (prompt: string) => {
    await ensureApiKey();
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: ModelType.FLASH_LITE,
        contents: { parts: [{ text: prompt }] }
    });
    return {
        status: 200,
        model: ModelType.FLASH_LITE,
        data: {
            content: response.text,
            usage: response.usageMetadata
        }
    };
};
