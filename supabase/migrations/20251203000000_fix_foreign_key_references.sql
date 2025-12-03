-- Migration: Fix foreign key references from auth.users to custom users table
-- This migration fixes the FK references that were incorrectly pointing to auth.users

-- Drop existing foreign key constraints
ALTER TABLE IF EXISTS projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
ALTER TABLE IF EXISTS service_configs DROP CONSTRAINT IF EXISTS service_configs_user_id_fkey;
ALTER TABLE IF EXISTS tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE IF EXISTS community_projects DROP CONSTRAINT IF EXISTS community_projects_user_id_fkey;
ALTER TABLE IF EXISTS community_likes DROP CONSTRAINT IF EXISTS community_likes_user_id_fkey;

-- Re-add foreign key constraints pointing to the correct users table
ALTER TABLE projects 
  ADD CONSTRAINT projects_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE service_configs 
  ADD CONSTRAINT service_configs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE tasks 
  ADD CONSTRAINT tasks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE community_projects 
  ADD CONSTRAINT community_projects_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE community_likes 
  ADD CONSTRAINT community_likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
