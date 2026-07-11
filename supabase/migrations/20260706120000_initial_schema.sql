-- Initial schema for Échos du Parnasse
-- Six tables: authors, collections, poems, tags, poem_tags, user_poem_status

-- ── Authors ──────────────────────────────────────────────
CREATE TABLE authors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  birth_year INT,
  death_year INT,
  bio        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_authors_name ON authors (name);

-- ── Collections ─────────────────────────────────────────
CREATE TABLE collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  author_id   UUID REFERENCES authors (id) ON DELETE SET NULL,
  year        INT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_collections_author_id ON collections (author_id);

-- ── Poems ───────────────────────────────────────────────
CREATE TABLE poems (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  content               TEXT NOT NULL,
  author_id             UUID REFERENCES authors (id) ON DELETE SET NULL,
  collection_id         UUID REFERENCES collections (id) ON DELETE SET NULL,
  position_in_collection INT,
  language              TEXT NOT NULL DEFAULT 'fr',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_poems_author_id      ON poems (author_id);
CREATE INDEX idx_poems_collection_id  ON poems (collection_id);
CREATE INDEX idx_poems_language       ON poems (language);
CREATE INDEX idx_poems_title          ON poems (title);

-- ── Tags ─────────────────────────────────────────────────
CREATE TABLE tags (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- ── Poem–Tag junction ────────────────────────────────────
CREATE TABLE poem_tags (
  poem_id UUID NOT NULL REFERENCES poems (id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags  (id) ON DELETE CASCADE,
  PRIMARY KEY (poem_id, tag_id)
);

CREATE INDEX idx_poem_tags_tag_id ON poem_tags (tag_id);

-- ── User poem status (read / favourite) ─────────────────
CREATE TABLE user_poem_status (
  user_id    UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  poem_id    UUID NOT NULL REFERENCES poems (id) ON DELETE CASCADE,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, poem_id)
);

CREATE INDEX idx_user_poem_status_user_id ON user_poem_status (user_id);

-- ── RLS ─────────────────────────────────────────────────
ALTER TABLE authors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE poems             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags              ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_poem_status  ENABLE ROW LEVEL SECURITY;

-- Library tables: public read
CREATE POLICY "Public read: authors"           ON authors           FOR SELECT USING (true);
CREATE POLICY "Public read: collections"       ON collections       FOR SELECT USING (true);
CREATE POLICY "Public read: poems"             ON poems             FOR SELECT USING (true);
CREATE POLICY "Public read: tags"              ON tags              FOR SELECT USING (true);
CREATE POLICY "Public read: poem_tags"         ON poem_tags         FOR SELECT USING (true);

-- user_poem_status: owner only
CREATE POLICY "Owner all: user_poem_status"
  ON user_poem_status
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
