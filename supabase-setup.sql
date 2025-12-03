-- ZEEBUILDER DATABASE SETUP
-- Run this SQL in Supabase Dashboard -> SQL Editor -> New Query

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  plan TEXT DEFAULT 'free',
  requests INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table (stores user projects)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL, -- Local project ID for syncing
  name TEXT NOT NULL,
  stack TEXT NOT NULL,
  files JSONB DEFAULT '[]'::jsonb,
  messages JSONB DEFAULT '[]'::jsonb,
  snapshots JSONB DEFAULT '[]'::jsonb,
  db_configs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Create service_configs table (stores API keys and service connections)
CREATE TABLE IF NOT EXISTS service_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL, -- e.g., 'stripe', 'resend', 'tailwindcss'
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL, -- 'api' (requires keys) or 'integration' (no keys)
  config JSONB DEFAULT '{}'::jsonb, -- Encrypted in production
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- Create tasks table (for task board)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL, -- Local task ID
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  project_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Create community_projects table (for published/shared projects)
CREATE TABLE IF NOT EXISTS community_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL, -- Local project ID reference
  name TEXT NOT NULL,
  description TEXT,
  stack TEXT NOT NULL,
  thumbnail TEXT,
  files JSONB DEFAULT '[]'::jsonb,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Create community_likes table (track who liked what)
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES community_projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_service_configs_user ON service_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_community_projects_user ON community_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_community_projects_featured ON community_projects(featured);
CREATE INDEX IF NOT EXISTS idx_community_projects_likes ON community_projects(likes DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes_project ON community_likes(project_id);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for service_configs
CREATE POLICY "Users can view own service configs" ON service_configs
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own service configs" ON service_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own service configs" ON service_configs
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own service configs" ON service_configs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_projects (public read, owner write)
CREATE POLICY "Anyone can view community projects" ON community_projects
  FOR SELECT USING (true);
  
CREATE POLICY "Users can insert own community projects" ON community_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own community projects" ON community_projects
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own community projects" ON community_projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_likes
CREATE POLICY "Anyone can view likes" ON community_likes
  FOR SELECT USING (true);
  
CREATE POLICY "Users can insert own likes" ON community_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own likes" ON community_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Service role has full access (for backend API)
CREATE POLICY "Service role full access" ON users
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 'Database setup complete! Tables: users, projects, service_configs, tasks, community_projects, community_likes' as status;
                                    