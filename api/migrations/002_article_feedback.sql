CREATE TABLE IF NOT EXISTS article_feedback (
  id SERIAL PRIMARY KEY,
  campaign TEXT NOT NULL,
  artikel TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  kommentar TEXT NOT NULL,
  notify BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_article_feedback_campaign ON article_feedback (campaign, artikel);
