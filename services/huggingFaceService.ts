
import { InferenceClient } from "@huggingface/inference";
import { BuilderChatMessage, ProjectFile, Stack, DatabaseConfig, ModelType } from "../types";

// Use a free model that is good at coding
const MODEL = "meta-llama/Llama-3.1-8B-Instruct"; 
const FALLBACK_MODEL = "microsoft/Phi-3-mini-4k-instruct";

const getClient = (apiKey?: string) => new InferenceClient(apiKey || process.env.HUGGING_FACE_API_KEY);

export const huggingFaceService = {
  chat: async (
    messages: BuilderChatMessage[], 
    systemPrompt: string,
    apiKey?: string
  ): Promise<string> => {
    const client = getClient(apiKey);
    
    const hfMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.text
      }))
    ];

    try {
      const response = await client.chatCompletion({
        model: MODEL,
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
          response = await makeRequest(MODEL);
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
      // Map aspect ratio to dimensions (approximate for SDXL)
      let width = 1024;
      let height = 1024;
      
      if (aspectRatio === '16:9') { width = 1024; height = 576; }
      else if (aspectRatio === '9:16') { width = 576; height = 1024; }
      else if (aspectRatio === '4:3') { width = 1024; height = 768; }
      else if (aspectRatio === '3:4') { width = 768; height = 1024; }

      // Enhance prompt for vibrancy if not already present
      const enhancedPrompt = prompt.toLowerCase().includes('vibrant') ? prompt : `${prompt}, vibrant colors, high quality, detailed, 8k resolution, cinematic lighting`;

      const response = await client.textToImage({
        model: "black-forest-labs/FLUX.1-schnell", // Newer, faster, better quality model
        inputs: enhancedPrompt,
        parameters: {
          width,
          height,
        }
      });
      
      if (typeof response === 'string') {
        // Handle case where response is a string (URL or base64)
        const url = (response as string).startsWith('http') || (response as string).startsWith('data:') 
          ? response 
          : `data:image/png;base64,${response}`;
        const res = await fetch(url);
        return await res.blob();
      }

      return response as Blob;
    } catch (error) {
      console.warn("Primary image model failed, trying fallback...", error);
      try {
          // Fallback to SDXL if FLUX fails
          const response = await client.textToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            inputs: prompt + ", vibrant, high quality",
            parameters: { width: 1024, height: 1024 }
          });
          return response as Blob;
      } catch (e) {
          console.error("Hugging Face Image Gen Error:", e);
          throw e;
      }
    }
  },

  generateSpeech: async (text: string, voice: string = "default"): Promise<Blob> => {
    const client = getClient();
    try {
      const response = await client.textToSpeech({
        model: "microsoft/speecht5_tts",
        inputs: text,
        // Note: speecht5 requires speaker embeddings, but the inference API might handle defaults or we might need a different model for simple usage
        // Using facebook/mms-tts-eng for simpler API usage if speecht5 fails or needs embeddings
      });
      return response;
    } catch (error) {
      // Fallback to a simpler model if the first one fails
      try {
        const client2 = getClient();
        const response = await client2.textToSpeech({
            model: "facebook/mms-tts-eng",
            inputs: text
        });
        return response;
      } catch (e) {
        console.error("Hugging Face TTS Error:", error);
        throw error;
      }
    }
  },

  transcribeAudio: async (audioBlob: Blob): Promise<string> => {
    const client = getClient();
    try {
      const response = await client.automaticSpeechRecognition({
        model: "openai/whisper-large-v3",
        data: audioBlob
      });
      return response.text;
    } catch (error) {
      console.error("Hugging Face Transcription Error:", error);
      throw error;
    }
  },
  
  ensureApiKey: async () => {
      return true; 
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
            model: MODEL,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500
        });
        return {
            status: 200,
            model: MODEL,
            data: {
                content: response.choices[0].message.content,
                usage: { totalTokenCount: 100 } // Mock usage as HF doesn't always return it
            }
        };
      } catch (e) {
          return {
              status: 500,
              model: MODEL,
              data: { content: "Error: " + (e as any).message }
          };
      }
  }
};
