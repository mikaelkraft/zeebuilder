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

                    -- Create index for faster email lookups
                    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

                    -- Enable Row Level Security
                    ALTER TABLE users ENABLE ROW LEVEL SECURITY;

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

                              -- Create trigger to auto-update updated_at
                              DROP TRIGGER IF EXISTS update_users_updated_at ON users;
                              CREATE TRIGGER update_users_updated_at
                                BEFORE UPDATE ON users
                                  FOR EACH ROW
                                    EXECUTE FUNCTION update_updated_at_column();

                                    -- Verify table was created
                                    SELECT 'Users table created successfully!' as status;
                                    