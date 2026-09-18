-- Tehreek-e-Imaan Database Schema (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_urdu TEXT NOT NULL,
  name_arabic TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  category TEXT NOT NULL,
  subject TEXT,
  subject_name_urdu TEXT,
  grade TEXT,
  darja_key TEXT,
  darja_urdu TEXT,
  cover_color TEXT,
  cover_image TEXT,
  pdf_url TEXT,
  shamela_url TEXT,
  islam360_url TEXT,
  description TEXT,
  total_chapters INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_chapters (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  chapter_index INTEGER DEFAULT 0,
  title_arabic TEXT,
  title_urdu TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_segments (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  segment_index INTEGER DEFAULT 0,
  arabic_text TEXT,
  urdu_translation TEXT,
  tashreeh TEXT,
  mahal_iraab TEXT,
  hawashi TEXT,
  translations TEXT,
  FOREIGN KEY (chapter_id) REFERENCES book_chapters(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'student_1',
  book_id TEXT NOT NULL,
  chapter_index INTEGER DEFAULT 0,
  segment_index INTEGER DEFAULT 0,
  percentage REAL DEFAULT 0.0,
  last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS books_full_text (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_slug TEXT NOT NULL,
  chapter_title TEXT,
  page_number INTEGER,
  arabic_matn TEXT NOT NULL,
  urdu_tarjuma TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_subject ON books(subject);
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON book_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_segments_chapter_id ON book_segments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_segments_book_id ON book_segments(book_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_books_full_text_slug ON books_full_text(book_slug);

