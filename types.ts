
export enum View {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  BUILDER = 'BUILDER',
  TASKS = 'TASKS',
  CHAT = 'CHAT',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VIDEO_STUDIO = 'VIDEO_STUDIO',
  AUDIO_STUDIO = 'AUDIO_STUDIO',
  PROFILE = 'PROFILE',
  POLICY = 'POLICY',
  TERMS = 'TERMS',
  DOCS = 'DOCS',
  DEVELOPERS = 'DEVELOPERS'
}

export enum ModelType {
  FLASH = 'gemini-2.5-flash',
  FLASH_LITE = 'gemini-2.5-flash-lite',
  PRO_PREVIEW = 'gemini-3-pro-preview',
  PRO_IMAGE = 'gemini-3-pro-image-preview',
  FLASH_IMAGE = 'gemini-2.5-flash-image',
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO = 'veo-3.1-generate-preview',
  TTS = 'gemini-2.5-flash-preview-tts',
  AUDIO_PREVIEW = 'gemini-2.5-flash-native-audio-preview-09-2025'
}

export interface FileAttachment {
    name: string;
    mimeType: string;
    data: string; // Base64
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Deprecated, use attachment
  attachment?: FileAttachment;
  videoUrl?: string;
  groundingUrls?: Array<{ uri: string; title: string }>;
  isThinking?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
  model: ModelType;
}

export interface BuilderChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Deprecated, use attachment
  attachment?: FileAttachment; 
  timestamp: number;
  toolCall?: 'connectDB' | 'generateLogo'; 
}

export interface ProjectFile {
  name: string;
  content: string;
  language: 'javascript' | 'typescript' | 'html' | 'css' | 'json' | 'dart' | 'vue';
}

export type Stack = 'react' | 'react-ts' | 'flutter' | 'html' | 'vue';

export interface SavedProject {
  id: string;
  name: string;
  stack: Stack;
  files: ProjectFile[];
  lastModified: number;
  dbConfigs: DatabaseConfig[];
  messages: BuilderChatMessage[];
}

export interface User {
  username: string;
  email: string;
  avatar: string;
  isAdmin?: boolean;
  apiKeys?: ApiKey[];
}

export interface ApiKey {
    id: string;
    key: string;
    name: string;
    createdAt: number;
    lastUsed?: number;
    requests: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface DatabaseConfig {
  type: 'firebase' | 'supabase' | 'neon';
  name: string;
  connected: boolean;
  config?: any;
}

export interface SupabaseConfig {
    url: string;
    key: string;
    enabled: boolean;
}
