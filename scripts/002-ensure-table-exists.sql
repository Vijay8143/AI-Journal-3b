-- Ensure the journal_entries table exists with all required columns
CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  summary TEXT,
  mood VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at for efficient timeline queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- Insert a sample entry if the table is empty (for testing)
INSERT INTO journal_entries (content, summary, mood, created_at)
SELECT 
  'Welcome to your AI Journal! This is a sample entry to get you started. Write about your day, your thoughts, or anything on your mind.',
  'A welcome message introducing the AI Journal with encouragement to start writing.',
  'excited',
  NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM journal_entries LIMIT 1);
