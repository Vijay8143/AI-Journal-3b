-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  login_id VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- Create index on user_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);

-- Create index on login_id for efficient user lookups
CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);
