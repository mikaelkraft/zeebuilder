
import { GoogleGenAI, Type, Modality, FunctionDeclaration } from "@google/genai";
import { ModelType, ProjectFile, Stack, BuilderChatMessage, DatabaseConfig } from "../types";

// Helper to handle API Key selection for paid models
const ensureApiKey = async () => {
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

        if (msg.includes("503") || msg.includes("unavailable") || msg.includes("overloaded") || msg.includes("fetch failed")) {
            if (retries > 0) {
                console.warn("Service unavailable, retrying...", error);
                await new Promise(resolve => setTimeout(resolve, 2000)); 
                return withAuthRetry(operation, retries - 1);
            }
        }

        if (msg.includes("404") || msg.includes("requested entity was not found") || 
            msg.includes("403") || msg.includes("permission denied") || msg.includes("permission")) {
            
            console.warn("Auth error detected, prompting for key selection retry:", error);
            
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
        
        // Lite models usually don't support complex tools robustly or at all in some environments
        const supportsTools = model !== ModelType.FLASH_LITE;

        if (!isThinking && supportsTools) {
            if (useSearch) tools.push({ googleSearch: {} });
            if (useMaps) {
                tools.push({ googleMaps: {} });
            }
            tools.push({ functionDeclarations: [createTaskFunction] });
        }

        const systemInstruction = `
You are Zee AI, an intelligent assistant created by Mikael Kraft.
You are helpful, creative, and concise. Identify yourself as Zee AI.

CAPABILITIES OF THIS APP (ZEE BUILDER):
1. **App Builder**: Full IDE to build React, Vue, Flutter, and HTML apps. Supports real Preview, Terminal, and Git.
2. **Image Studio**: Generate, Edit, and Animate images using Zee Pro Image and Veo.
3. **Video Studio**: Generate high-quality videos from text using Veo models.
4. **Audio Studio**: Live Voice conversations, TTS generation, and Audio Transcription.
5. **Task Board**: Kanban style project management.
6. **Developer API**: Generate API keys to use Zee models in external apps.
`;

        const config: any = {
            systemInstruction,
        };

        if (isThinking) {
            // Thinking requires Pro model primarily, but can work with Flash 2.0 thinking if available.
            // Using budget for 3.0 Pro
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
        
        const chatHistory = history.map(msg => {
            const parts: any[] = [];
            if (msg.attachment) {
                parts.push({ inlineData: { data: msg.attachment.data, mimeType: msg.attachment.mimeType } });
            }
            parts.push({ text: msg.text });
            return {
                role: msg.role,
                parts
            };
        });

        const lastMsg = chatHistory.pop(); 

        const fileContext = currentFiles.map(f => `${f.name}:\n\`\`\`${f.language}\n${f.content}\n\`\`\``).join('\n\n');
        
        const dbContext = dbConfigs.length > 0 
            ? `ACTIVE DATABASE CREDENTIALS (MUST be used if backend logic is requested):
${JSON.stringify(dbConfigs, null, 2)}
IMPORTANT: When writing connection code (e.g. firebase.initializeApp), use these EXACT values from the JSON above. Do NOT use placeholders like "YOUR_API_KEY".`
            : "No active database connections configured.";

        const isTs = stack === 'react-ts';
        const ext = isTs ? 'tsx' : 'js';

        const prompt = `
        You are Zee Builder, an expert AI software engineer. 
        You are building a ${stack} application.
        
        CURRENT FILES:
        ${fileContext}

        DATABASE CONTEXT:
        ${dbContext}

        USER REQUEST:
        ${lastMsg?.parts.map((p:any) => p.text).join(' ')}

        INSTRUCTIONS:
        1. **Analyze the User Request**:
           - If the user asks to "build", "create", "add", "fix", or "update" something, YOU MUST GENERATE CODE.
           - If the user is just saying "hi" or asking a general question, return an empty "files" array and an explanation.
        
        2. **Code Generation Rules**:
           - For Web (React/Vue/HTML), you MUST use Tailwind CSS for styling.
           - For React, use 'export default function App() {}' or similar.
           - If Stack is 'react-ts', use TypeScript (.tsx/.ts) files and interfaces.
           - Ensure 'package.json' is present and valid. Include 'dependencies' and 'devDependencies'.
           - Organize components in 'src/components/'.
           - **DATABASE**: If 'dbConfigs' are provided and relevant, WRITE THE ACTUAL CONNECTION CODE using the provided credentials.
        
        3. **Response Format**:
           Return ONLY a valid JSON object. Do not wrap it in markdown if possible, but if you do, use \`\`\`json.
           IMPORTANT: Ensure the JSON is valid and parseable.
        
        JSON STRUCTURE:
        {
          "files": [
            { "name": "src/App.${ext}", "content": "code here...", "language": "${isTs ? 'typescript' : 'javascript'}" }
          ],
          "explanation": "Brief summary of changes or answer to the user",
          "toolCall": "connectDB" | "generateLogo" | null
        }
        `;

        const config: any = {
             responseMimeType: "application/json",
        };
        
        // Config logic: 
        // 1. Search tool is NOT compatible with responseMimeType: "application/json"
        // 2. Search is not available on Lite models or Thinking mode
        if (useSearch && !model.includes('thinking') && model !== ModelType.FLASH_LITE) {
             config.tools = [{ googleSearch: {} }];
             // Remove responseMimeType to prevent "Request contains an invalid argument" error
             delete config.responseMimeType;
        }

        // If tool call is forced via tools config, we must remove responseMimeType as well
        if (config.tools && config.tools.length > 0) {
            delete config.responseMimeType;
        }

        const result = await ai.models.generateContent({
            model: model,
            contents: [...chatHistory.map(m => ({ role: m.role, parts: m.parts })), { role: 'user', parts: [{ text: prompt }] }],
            config
        });

        let text = result.text || "{}";
        
        // Robust JSON extraction
        try {
            // Try direct parse first
            return JSON.parse(text);
        } catch (e) {
            // Try cleaning markdown
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // Try extracting object
            const firstOpen = text.indexOf('{');
            const lastClose = text.lastIndexOf('}');
            
            if (firstOpen !== -1 && lastClose !== -1) {
                const jsonStr = text.substring(firstOpen, lastClose + 1);
                try {
                    return JSON.parse(jsonStr);
                } catch (e2) {
                    console.error("JSON Parse Error (Extracted):", jsonStr);
                    throw new Error("Failed to parse generated project code.");
                }
            } else {
                console.error("No JSON found in response:", text);
                throw new Error("AI response was not valid JSON.");
            }
        }
    });
};

// --- Image & Video ---

export const generateImage = async (prompt: string, aspectRatio: string, size: string, model: ModelType) => {
    return withAuthRetry(async () => {
        await ensureApiKey();
        const ai = getClient();
        const config: any = { imageConfig: { aspectRatio } };
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

export const generateVideo = async (prompt: string, aspectRatio: string, image?: {data: string, mimeType: string}, model: ModelType = ModelType.VEO_FAST) => {
    return withAuthRetry(async () => {
        await ensureApiKey();
        const ai = getClient();
        
        const req: any = {
            model,
            prompt,
            config: {
                numberOfVideos: 1,
                aspectRatio: aspectRatio as any,
                resolution: '1080p'
            }
        };

        if (image) {
            req.image = { imageBytes: image.data, mimeType: image.mimeType };
        }

        let operation = await ai.models.generateVideos(req);
        
        let attempts = 0;
        while (!operation.done && attempts < 30) { 
             await new Promise(r => setTimeout(r, 10000));
             try {
                operation = await ai.operations.getVideosOperation({ operation });
             } catch (e: any) {
                 if (e.message && e.message.includes("Deadline")) {
                     // keep waiting
                 } else {
                     throw e;
                 }
             }
             attempts++;
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
             const key = process.env.API_KEY; 
             return `${videoUri}&key=${key}`;
        }
        return null;
    });
};

// --- Audio ---

export const generateSpeech = async (text: string) => {
    return withAuthRetry(async () => {
        await ensureApiKey();
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: ModelType.TTS,
            contents: { parts: [{ text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
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

export const arrayBufferToAudioBuffer = async (
  chunk: ArrayBuffer | Uint8Array,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  // Fix: DataView requires pure ArrayBuffer, not Uint8Array
  const arrayBuffer = chunk instanceof Uint8Array 
    ? chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength) 
    : chunk;

  try {
      return await audioContext.decodeAudioData(arrayBuffer.slice(0)); 
  } catch (e) {
      // Manual PCM16 Decoding Fallback
      const dataView = new DataView(arrayBuffer);
      const numSamples = arrayBuffer.byteLength / 2;
      const buffer = audioContext.createBuffer(1, numSamples, 24000);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < numSamples; i++) {
          channel[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }
      return buffer;
  }
};

export const pcmToBlob = (pcmData: Float32Array): Blob => {
  const l = pcmData.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = pcmData[i] * 32768;
  }
  return new Blob([int16], { type: 'audio/pcm' }); 
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
