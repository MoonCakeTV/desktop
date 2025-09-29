-- Migration: 002_add_media_table
-- Created: 2025-09-19

CREATE TABLE IF NOT EXISTS medias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mc_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    year INTEGER,
    genre TEXT,
    douban_rating REAL DEFAULT 0.0,
    douban_id TEXT,
    imdb_rating REAL DEFAULT 0.0,
    imdb_id TEXT,
    tmdb_rating REAL DEFAULT 0.0,
    tmdb_id TEXT,
    poster_url TEXT,
    video_urls TEXT,
    video_url_type TEXT DEFAULT 'm3u8',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_medias_mc_id ON medias(mc_id);
CREATE INDEX IF NOT EXISTS idx_medias_title ON medias(title);
CREATE INDEX IF NOT EXISTS idx_medias_genre ON medias(genre);
CREATE INDEX IF NOT EXISTS idx_medias_year ON medias(year);


CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mc_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, mc_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_mc_id ON bookmarks(mc_id);


CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mc_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, mc_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_mc_id ON history(mc_id);


CREATE TABLE IF NOT EXISTS mc_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mc_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reply_to INTEGER, -- reply to comment id
    UNIQUE(mc_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mc_comments_mc_id ON mc_comments(mc_id);
CREATE INDEX IF NOT EXISTS idx_mc_comments_user_id ON mc_comments(user_id);