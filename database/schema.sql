-- PostgreSQL schema for Game Warm-up
-- Local:
--   CREATE DATABASE warmup_library;
--   \c warmup_library
--   \i database/schema.sql

CREATE TABLE IF NOT EXISTS contexts (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS purposes (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS games (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  name_search VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  how_to_play TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  duration_max INTEGER NOT NULL,
  min_players INTEGER NOT NULL,
  max_players INTEGER,
  context VARCHAR(500),
  purpose VARCHAR(500),
  preparation TEXT,
  preparation_required BOOLEAN NOT NULL DEFAULT FALSE,
  preparation_time INTEGER DEFAULT 0,
  rules TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_name_search ON games (name_search);

CREATE TABLE IF NOT EXISTS game_contexts (
  game_id BIGINT NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  context_id BIGINT NOT NULL REFERENCES contexts (id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, context_id)
);

CREATE TABLE IF NOT EXISTS game_purposes (
  game_id BIGINT NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  purpose_id BIGINT NOT NULL REFERENCES purposes (id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, purpose_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  game_id BIGINT NOT NULL REFERENCES games (id) ON DELETE CASCADE,
  display_name VARCHAR(80) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON reviews (game_id);
