CREATE TABLE IF NOT EXISTS petition_signatures (
  id SERIAL PRIMARY KEY,
  campaign TEXT NOT NULL,
  name TEXT NOT NULL,
  ort TEXT NOT NULL,
  email TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_petition_campaign ON petition_signatures (campaign);

CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  campaign TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  betrag_chf INTEGER NOT NULL CHECK (betrag_chf >= 5),
  visibility TEXT NOT NULL DEFAULT 'privat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations (campaign);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  campaign TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign, email)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  campaign TEXT NOT NULL,
  target_name TEXT NOT NULL,
  target_email TEXT,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_campaign ON contact_messages (campaign);

CREATE TABLE IF NOT EXISTS vip_applications (
  id SERIAL PRIMARY KEY,
  campaign TEXT NOT NULL,
  name TEXT NOT NULL,
  funktion TEXT NOT NULL,
  organisation TEXT,
  zitat TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vip_campaign ON vip_applications (campaign, approved);

CREATE TABLE IF NOT EXISTS finder_leads (
  id SERIAL PRIMARY KEY,
  campaign TEXT NOT NULL,
  plz TEXT NOT NULL,
  telefon TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
