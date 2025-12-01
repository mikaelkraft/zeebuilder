
export enum View {
  HOME = 'HOME',
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  BUILDER = 'BUILDER',
  TASKS = 'TASKS',
  CHAT = 'CHAT',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  AUDIO_STUDIO = 'AUDIO_STUDIO',
  PROFILE = 'PROFILE',
  POLICY = 'POLICY',
  TERMS = 'TERMS',
  DOCS = 'DOCS',
  DEVELOPERS = 'DEVELOPERS',
  INTEGRATIONS = 'INTEGRATIONS',
  ADMIN = 'ADMIN'
}

export enum ModelType {
  FLASH = 'gemini-2.5-flash',
  FLASH_LITE = 'gemini-2.5-flash-lite',
  PRO_PREVIEW = 'gemini-3-pro-preview',
  PRO_IMAGE = 'gemini-3-pro-image-preview',
  FLASH_IMAGE = 'gemini-2.5-flash-image',
  TTS = 'gemini-2.5-flash-preview-tts'
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
  toolCall?: 'connectDB' | 'generateLogo' | 'generateImage'; 
}

export interface ProjectFile {
  name: string;
  content: string;
  language: 'javascript' | 'typescript' | 'html' | 'css' | 'json' | 'dart' | 'vue' | 'image' | 'python' | 'java' | 'xml' | 'markdown';
}

export type Stack = 'react' | 'react-ts' | 'flutter' | 'vue' | 'python' | 'nextjs';

export interface Snapshot {
    id: string;
    name: string;
    timestamp: number;
    files: ProjectFile[];
}

export interface SavedProject {
  id: string;
  name: string;
  stack: Stack;
  files: ProjectFile[];
  lastModified: number;
  dbConfigs: DatabaseConfig[];
  messages: BuilderChatMessage[];
  snapshots?: Snapshot[];
  isPublished?: boolean;
  publishedAt?: number;
  description?: string;
  thumbnail?: string;
}

export interface CommunityProject {
  id: string;
  projectId: string;
  name: string;
  description: string;
  stack: Stack;
  thumbnail?: string;
  authorName: string;
  authorAvatar?: string;
  files: ProjectFile[];
  likes: number;
  views: number;
  remixCount?: number;
  publishedAt: number;
  featured?: boolean;
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
  dueDate?: string;
  projectId?: string;
}

export interface DatabaseConfig {
  type: 'firebase' | 'supabase' | 'neon' | 'appwrite' | 'vercel';
  name: string;
  connected: boolean;
  config?: any;
}

export interface SupabaseConfig {
    url: string;
    key: string;
    enabled: boolean;
}

export type CloudProviderType = 'supabase' | 'firebase' | 'neon' | 'appwrite';

export interface CloudProviderConfig {
    provider: CloudProviderType;
    enabled: boolean;
    // Supabase
    supabaseUrl?: string;
    supabaseKey?: string;
    // Firebase
    firebaseApiKey?: string;
    firebaseProjectId?: string;
    firebaseAppId?: string;
    // Neon
    neonConnectionString?: string;
    // Appwrite
    appwriteEndpoint?: string;
    appwriteProjectId?: string;
    appwriteApiKey?: string;
}

export interface ApiQuota {
    plan: 'free' | 'pro' | 'enterprise';
    limits: {
        requestsPerDay: number;
        requestsPerMinute: number;
        codeGenerations: number;
        imageGenerations: number;
        audioMinutes: number;
    };
    usage: {
        requestsToday: number;
        codeGenerationsToday: number;
        imageGenerationsToday: number;
        audioMinutesToday: number;
        lastReset: number;
    };
}
