
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
  HF_LLAMA = 'meta-llama/Llama-3.2-11B-Vision-Instruct',
  HF_PHI = 'microsoft/Phi-3-mini-4k-instruct',
  HF_VISION_LITE = 'meta-llama/Llama-3.2-3B-Instruct',
  PRO_IMAGE = 'black-forest-labs/FLUX.1-schnell',
  FLASH_IMAGE = 'stabilityai/stable-diffusion-xl-base-1.0',
  TTS = 'facebook/mms-tts-eng'
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

export type Stack = 'react' | 'react-ts' | 'flutter' | 'vue' | 'python' | 'nextjs' | 'html';

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
  originalProjectId?: string; // For remixes
  originalAuthor?: string;
}

export interface CommunityProject {
  id: string;
  projectId: string;
  originalProjectId?: string; // For remixes
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
