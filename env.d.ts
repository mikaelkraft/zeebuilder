/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_ADMIN_PASSWORD_HASH: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_HF_TOKEN?: string;
  readonly VITE_HUGGINGFACE_API_KEY?: string;
  readonly VITE_HUGGING_FACE_API_KEY?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly JWT_SECRET: string;
  readonly GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
