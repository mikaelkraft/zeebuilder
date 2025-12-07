
import { InferenceClient } from "@huggingface/inference";
import { BuilderChatMessage, ProjectFile, Stack, DatabaseConfig, ModelType } from "../types";

// Use a free model that is good at coding
const MODEL = "meta-llama/Llama-3.1-8B-Instruct"; 

const getClient = (apiKey?: string) => new InferenceClient(apiKey);

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
    } catch (error) {
      console.error("Hugging Face Chat Error:", error);
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

    const systemPrompt = `You are an expert full-stack developer specializing in ${stack}.
    Your task is to generate or modify code based on the user's request.
    
    Current File Structure:
    ${currentFiles.map(f => `- ${f.name} (${f.language})`).join('\n')}
    
    Return ONLY a JSON array of file objects. Each object must have "name", "content", and "language".
    Do not include markdown formatting like \`\`\`json. Just the raw JSON array.
    Example:
    [
      { "name": "src/App.tsx", "content": "...", "language": "typescript" }
    ]
    `;

    try {
      const response = await client.chatCompletion({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.2 
      });

      const content = response.choices[0].message.content || "";
      const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let files: ProjectFile[] = [];
      try {
        files = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse generated code as JSON:", content);
        return { files: [], explanation: content };
      }
      
      return { files, explanation: "Generated code based on your request." };
    } catch (error) {
      console.error("Hugging Face Code Gen Error:", error);
      throw error;
    }
  },

  generateImage: async (prompt: string, aspectRatio: string, size: string, model: ModelType): Promise<any> => {
      return {
          candidates: [{
              content: {
                  parts: [{
                      inlineData: {
                          data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" 
                      }
                  }]
              }
          }]
      };
  },

  transcribeAudio: async (base64Audio: string, mimeType: string): Promise<string> => {
      return "Audio transcription is not yet implemented with Hugging Face.";
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
  }
};
