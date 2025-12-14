
import { InferenceClient } from "@huggingface/inference";
import { BuilderChatMessage, ProjectFile, Stack, DatabaseConfig, ModelType, FileAttachment } from "../types";

// Default free/open models
const DEFAULT_MODEL = ModelType.HF_LLAMA;
const FALLBACK_MODEL = ModelType.HF_PHI;

const HF_TOKEN_STORAGE_KEY = "zee_hf_token";

const getEnvToken = (): string | undefined => {
  try {
    const env: any = (import.meta as any)?.env;
    return (
      env?.VITE_HF_TOKEN ||
      env?.VITE_HUGGINGFACE_API_KEY ||
      env?.VITE_HUGGING_FACE_API_KEY ||
      undefined
    );
  } catch {
    return undefined;
  }
};

const getStoredToken = (): string | undefined => {
  try {
    if (typeof window === "undefined") return undefined;
    const token = window.localStorage.getItem(HF_TOKEN_STORAGE_KEY);
    return token || undefined;
  } catch {
    return undefined;
  }
};

const getProcessToken = (): string | undefined => {
  try {
    return (
      process.env.HF_TOKEN ||
      process.env.HUGGINGFACE_API_KEY ||
      process.env.HUGGING_FACE_API_KEY ||
      process.env.HUGGING_FACE_ACCESS_TOKEN ||
      undefined
    );
  } catch {
    return undefined;
  }
};

const resolveToken = (explicit?: string): string | undefined => {
  return explicit || getEnvToken() || getStoredToken() || getProcessToken();
};

const getClient = (apiKey?: string) => new InferenceClient(resolveToken(apiKey));

export const huggingFaceService = {
  chat: async (
    messages: Array<{ role: 'user' | 'model'; text: string; attachment?: FileAttachment }>, 
    systemPrompt: string,
    options?: { apiKey?: string; model?: ModelType; searchContext?: string }
  ): Promise<string> => {
    const client = getClient(options?.apiKey);

    const modelToUse = options?.model || DEFAULT_MODEL;

    const hfMessages = [
      { role: "system", content: options?.searchContext ? `${systemPrompt}\n\nLive data context:\n${options.searchContext}` : systemPrompt },
      ...messages.map(m => {
        const role = m.role === 'model' ? 'assistant' : 'user';
        const contentParts: any[] = [];

        // If there's an image attachment, send as vision content; otherwise include textual attachment summary
        if (m.attachment && m.attachment.mimeType?.startsWith('image/')) {
          const dataUrl = `data:${m.attachment.mimeType};base64,${m.attachment.data}`;
          if (m.text) contentParts.push({ type: 'text', text: m.text });
          contentParts.push({ type: 'image_url', image_url: dataUrl });
        } else {
          const baseText = m.text || (m.attachment ? 'Please analyze the attached file.' : '');
          contentParts.push({ type: 'text', text: baseText });
          if (m.attachment) {
            contentParts.push({ 
              type: 'text', 
              text: `[Attachment: ${m.attachment.name} | ${m.attachment.mimeType}] Base64 (truncated): ${m.attachment.data.slice(0, 1200)}`
            });
          }
        }

        return { role, content: contentParts } as any;
      })
    ];

    try {
      const response = await client.chatCompletion({
        model: modelToUse,
        provider: "hf-inference",
        messages: hfMessages as any,
        max_tokens: 2000,
        temperature: 0.7
      });

      return response.choices[0].message.content || "";
    } catch (error: any) {
      console.warn("Primary model failed, trying fallback...", error);
      if (error.message?.includes("auto-router") || error.message?.includes("401") || error.message?.includes("403")) {
          try {
            const response = await client.chatCompletion({
                model: FALLBACK_MODEL,
                provider: "hf-inference",
                messages: hfMessages as any,
                max_tokens: 2000,
                temperature: 0.7
            });
            return response.choices[0].message.content || "";
          } catch (fallbackError) {
              console.error("Fallback model also failed:", fallbackError);
              throw error;
          }
      }
      throw error;
    }
  },

  generateProject: async (
    history: BuilderChatMessage[], 
    stack: Stack, 
    model: ModelType, 
    currentFiles: ProjectFile[],
    dbConfigs: DatabaseConfig[],
    useSearch: boolean = false
  ): Promise<{ files: ProjectFile[], explanation: string, toolCall?: string }> => {
    const client = getClient();
    
    const lastMessage = history[history.length - 1];
    const prompt = lastMessage.text;

    const dbConfigText = dbConfigs.length > 0 
        ? `\nACTIVE INTEGRATIONS (Use these credentials/configs in the code):\n${dbConfigs.map(db => `- ${db.name} (${db.type}): ${JSON.stringify(db.config)}`).join('\n')}`
        : "";

    const systemPrompt = `You are an expert full-stack developer specializing in ${stack}.
    Your task is to generate or modify code based on the user's request.
    Today is ${new Date().toDateString()}.
    ${dbConfigText}
    
    MEDIA HANDLING RULES:
    1. If the user asks to GENERATE new images or audio, refuse and reply: "Please use the Image Studio or Audio Studio for media generation."
    2. If the user provides an image for analysis (OCR, design to code), you SHOULD analyze it and generate code based on it.
    3. You can help users add/import existing image assets into their project.
    
    Current File Structure:
    ${currentFiles.map(f => `- ${f.name} (${f.language})`).join('\n')}
    
    Return ONLY a JSON object with the following structure:
    {
      "message": "A brief explanation of what you did or an answer to the user's question.",
      "files": [
        { "name": "path/to/file", "content": "full file content", "language": "language" }
      ]
    }
    If no code changes are needed, return an empty "files" array.
    Do not include markdown formatting like \`\`\`json. Just the raw JSON object.
    `;

    const makeRequest = async (modelName: string) => {
        return await client.chatCompletion({
            model: modelName,
        provider: "hf-inference",
            messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
            ],
            max_tokens: 4000,
            temperature: 0.2 
        });
    };

    try {
      let response;
      try {
        response = await makeRequest(model || DEFAULT_MODEL);
      } catch (error: any) {
          console.warn("Primary model failed for code gen, trying fallback...", error);
          if (error.message?.includes("auto-router") || error.message?.includes("401") || error.message?.includes("403")) {
          response = await makeRequest(FALLBACK_MODEL);
          } else {
              throw error;
          }
      }

      const content = response.choices[0].message.content || "";
      
      // Robust JSON extraction
      const extractJson = (text: string) => {
          // First try cleaning markdown
          let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          try { return JSON.parse(cleanText); } catch (e) {}
          
          // Try finding the JSON object boundaries
          const firstOpen = text.indexOf('{');
          const lastClose = text.lastIndexOf('}');
          if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
              try { return JSON.parse(text.substring(firstOpen, lastClose + 1)); } catch (e) {}
          }
          return null;
      };

      const result = extractJson(content);
      let parsed: { message: string, files: ProjectFile[] } = { message: "", files: [] };
      
      if (result) {
        if (Array.isArray(result)) {
            parsed = { message: "Generated code based on your request.", files: result };
        } else {
            parsed = result;
        }
      } else {
        console.error("Failed to parse generated code as JSON:", content);
        // If parsing fails, assume it's just a message
        return { files: [], explanation: content };
      }
      
      return { files: parsed.files || [], explanation: parsed.message || "Generated code based on your request." };
    } catch (error) {
      console.error("Hugging Face Code Gen Error:", error);
      throw error;
    }
  },

  generateImage: async (prompt: string, aspectRatio: string, size: string, model: ModelType): Promise<Blob> => {
    const client = getClient();
    try {
      // Map aspect ratio to dimensions (approximate for SDXL/FLUX)
      let width = 1024;
      let height = 1024;
      if (aspectRatio === '16:9') { width = 1280; height = 720; }
      else if (aspectRatio === '9:16') { width = 720; height = 1280; }
      else if (aspectRatio === '4:3') { width = 1344; height = 1008; }
      else if (aspectRatio === '3:4') { width = 1008; height = 1344; }

      // Scale dimensions based on requested size
      const sizeLower = (size || '').toLowerCase();
      if (sizeLower.includes('4k')) { width = Math.min(width * 2, 2048); height = Math.min(height * 2, 2048); }
      else if (sizeLower.includes('2k')) { width = Math.min(Math.floor(width * 1.5), 1536); height = Math.min(Math.floor(height * 1.5), 1536); }

      // Enhance prompt for vibrancy if not already present
      const enhancedPrompt = prompt.toLowerCase().includes('vibrant') ? prompt : `${prompt}, vibrant colors, high quality, detailed, 8k resolution, cinematic lighting`;

      const response = await client.textToImage({
        model: model || "black-forest-labs/FLUX.1-schnell",
        provider: "hf-inference",
        inputs: enhancedPrompt,
        parameters: {
          width,
          height,
        }
      });
      
      if (typeof response === 'string') {
        const url = response.startsWith('http') || response.startsWith('data:') 
          ? response 
          : `data:image/png;base64,${response}`;
        const res = await fetch(url);
        return await res.blob();
      }

      const maybeBlob: any = response;
      if (maybeBlob && typeof maybeBlob === 'object' && 'size' in maybeBlob) {
        return maybeBlob as Blob;
      }

      // Fallback: wrap unknown response into a Blob to avoid type issues
      return new Blob([maybeBlob as any]);
    } catch (error) {
      console.warn("Primary image model failed, trying fallback...", error);
      try {
          // Fallback to SDXL if FLUX fails
          const response = await client.textToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            provider: "hf-inference",
            inputs: prompt + ", vibrant, high quality",
            parameters: { width: 1024, height: 1024 }
          });
          const fallbackBlob: any = response;
          if (typeof fallbackBlob === 'string') {
            const url = fallbackBlob.startsWith('http') || fallbackBlob.startsWith('data:') ? fallbackBlob : `data:image/png;base64,${fallbackBlob}`;
            const res = await fetch(url);
            return await res.blob();
          }
          return fallbackBlob as Blob;
      } catch (e) {
          console.error("Hugging Face Image Gen Error:", e);
          throw e;
      }
    }
  },

  editImage: async (base64Image: string, mimeType: string, prompt: string, strength: number = 0.55): Promise<Blob> => {
    const client = getClient();
    try {
      const response: any = await client.imageToImage({
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        provider: "hf-inference",
        // image_to_image expects an object with image + prompt; cast to any to satisfy types
        inputs: {
          image: `data:${mimeType};base64,${base64Image}`,
          prompt,
          strength
        } as any
      } as any);

      if (response instanceof Blob) return response;
      if (typeof response === 'string') {
        const url = response.startsWith('http') || response.startsWith('data:') ? response : `data:image/png;base64,${response}`;
        const res = await fetch(url);
        return await res.blob();
      }
      return new Blob([response as any]);
    } catch (error) {
      console.error("Hugging Face Image Edit Error:", error);
      throw error;
    }
  },

  generateSpeech: async (text: string, voice: string = "default"): Promise<Blob> => {
    const client = getClient();
    const toBlob = async (resp: any) => {
      if (resp instanceof Blob) return resp;
      if (typeof resp === 'string') {
        const url = resp.startsWith('http') || resp.startsWith('data:') ? resp : `data:audio/wav;base64,${resp}`;
        const res = await fetch(url);
        return await res.blob();
      }
      return new Blob([resp as any]);
    };

    try {
      const response = await client.textToSpeech({
        model: "facebook/mms-tts-eng",
        provider: "hf-inference",
        inputs: text
      });
      return await toBlob(response);
    } catch (primaryError) {
      try {
        const fallback = await client.textToSpeech({
          model: "espnet/kan-bayashi-ljspeech-vits",
          provider: "hf-inference",
          inputs: text
        });
        return await toBlob(fallback);
      } catch (fallbackError) {
        console.error("Hugging Face TTS Error:", primaryError, fallbackError);
        throw fallbackError;
      }
    }
  },

  transcribeAudio: async (audioBlob: Blob): Promise<string> => {
    const client = getClient();
    try {
      const response = await client.automaticSpeechRecognition({
        model: "openai/whisper-large-v3",
        provider: "hf-inference",
        data: audioBlob
      });
      return response.text;
    } catch (error) {
      console.error("Hugging Face Transcription Error:", error);
      throw error;
    }
  },
  
  ensureApiKey: async () => {
      const existing = resolveToken();
      if (existing) return true;

      // In the browser, prompt once and persist to localStorage.
      if (typeof window !== "undefined") {
        try {
          const entered = window.prompt(
            "Hugging Face token required for chat/audio. Paste your HF token (starts with hf_)"
          );
          const token = (entered || "").trim();
          if (!token) return false;
          window.localStorage.setItem(HF_TOKEN_STORAGE_KEY, token);
          return true;
        } catch {
          return false;
        }
      }

      return false;
  },
  
  blobToBase64: (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  simulateApiCall: async (prompt: string) => {
      const client = getClient();
      try {
        const response = await client.chatCompletion({
        model: DEFAULT_MODEL,
      provider: "hf-inference",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500
        });
        return {
            status: 200,
        model: DEFAULT_MODEL,
            data: {
                content: response.choices[0].message.content,
                usage: { totalTokenCount: 100 } // Mock usage as HF doesn't always return it
            }
        };
      } catch (e) {
          return {
              status: 500,
          model: DEFAULT_MODEL,
              data: { content: "Error: " + (e as any).message }
          };
      }
  }
};
