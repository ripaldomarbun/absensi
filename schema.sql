-- SIMPEL Database Schema for PostgreSQL / Supabase
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS users (
  nip TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('pegawai','satops','admin')),
  divisi TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  jenis TEXT NOT NULL CHECK(jenis IN ('pagi','sore')),
  tanggal TEXT NOT NULL,
  pembina TEXT DEFAULT '',
  active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  nip TEXT NOT NULL REFERENCES users(nip),
  scan_time TIMESTAMP DEFAULT NOW(),
  gps_lat REAL,
  gps_lng REAL,
  gps_ok INTEGER DEFAULT 0,
  scanned_by TEXT,
  status TEXT DEFAULT 'hadir',
  keterangan TEXT DEFAULT ''
);
