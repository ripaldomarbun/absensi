# SIMPEL — Changelog & Dokumentasi

## Info Aplikasi

| Item | Detail |
|------|--------|
| Nama | SIMPEL — Sistem Informasi Monitoring Presensi Elektronik |
| URL | https://absensi-production-9488.up.railway.app |
| Tech Stack | Node.js, Express, better-sqlite3, JWT, bcryptjs |
| Deploy | Railway (auto-deploy dari branch `main`) |
| Database | SQLite di `/data` (Railway volume) |
| Client Contact | ~Biwwa (WhatsApp) |

## Akun Default

| Role | NIP | Password |
|------|-----|----------|
| Admin | `0000000000000001` | `0000000000000001` |
| Satops | `199707262017121002` (RENALDY) | NIP masing-masing |
| Pegawai | `198605042007011002` (FAJAR) | NIP masing-masing |

---

## Update History

### v1.0 — Setup Awal

- Aplikasi absensi QR code untuk Rutan Batam
- Login pegawai & satops dari halaman `/`
- QR code auto-refresh tiap 60 detik
- Camera scan untuk satops
- GPS tracking (real & simulasi)
- Rekap absensi & cetak laporan
- 56 data pegawai seed, 4 satops

### v1.1 — Security & Reliability

- **Health check** endpoint: `GET /health`
- **Rate limiting**: Global 100 req/min, login 20 req/15min
- **Trust proxy** untuk Railway compatibility
- **Input validation**: Name max 200 chars, password min 6 chars
- **Role migration**: `migrateRoles()` otomatis update roles di startup

### v1.2 — Admin System

- **Admin CRUD** (`routes/admin.js`): List/add/edit/delete users
- **Role middleware**: `roleMiddleware(['admin'])` untuk protect admin routes
- **Reset password**: Admin bisa reset password user
- **Admin seed**: NIP `0000000000000001`, role `admin`
- **Admin Panel** (`public/admin.html`): Login, dashboard stats, user management
- Route `/admin` → `admin.html`

### v1.3 — Satops Simplification

- **Hapus tab "Kelola"** dari satops UI (242 baris dihapus)
- Satops fokus: **Absensi** + **Rekap** saja
- 4 Satops aktif:
  - RENALDY WILLY SETYAJI (`199707262017121002`)
  - HERDIANSYAH TRI ATMOKO (`199712102017121003`)
  - HARIMURTI (`199709042017121003`)
  - HAYYU NUR MUHAMMAD (`199706062017121002`)
- NABILA HYFA (`200605182025062003`) dipindah dari satops → pegawai

### v1.4 — Unified Login (In Progress)

**Goal**: Satu halaman login untuk semua role (pegawai, satops, admin)

**Perubahan di `public/index.html`**:
- `handleLogin()`: Admin redirect ke `/admin` via `window.location.href`
- Hapus link "⚙️ Admin Panel" dari halaman login
- Hapus teks hint admin dari password hint

**Perubahan di `public/admin.html`**:
- Token key: `admin_token` → `simpel_token` (shared session)
- Logout redirect ke `/` (bukan show login page)
- 401 error redirect ke `/`
- Init: Auto redirect ke `/` jika tidak ada token

**Flow login baru**:
```
Login / →
  ├── role: pegawai → halaman QR
  ├── role: satops  → halaman absensi
  └── role: admin   → redirect ke /admin
```

**Status**: Code sudah di-push ke GitHub, Railway masih serve versi lama. Perlu manual deploy dari Railway dashboard atau hard refresh browser (`Cmd+Shift+R`).

---

## Struktur File Penting

```
simpel-api/
├── server.js              # Express app, route mounting, rate limiters
├── db.js                  # SQLite, convert(), seed data, migrateRoles()
├── package.json           # Dependencies
├── railway.json           # Build/deploy config
├── routes/
│   ├── auth.js            # Login, /auth/me
│   ├── pegawai.js         # QR data, session, history, clock-in/out
│   ├── satops.js          # Pembina, camera scan, status, rekap
│   └── admin.js           # User CRUD, reset password
├── middleware/
│   └── auth.js            # JWT (12h expiry), authMiddleware, roleMiddleware
└── public/
    ├── index.html         # Frontend utama (login + pegawai + satops)
    ├── admin.html         # Admin panel
    └── static/
        └── logo_rutan.png
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| POST | `/api/auth/login` | No | - | Login,返回 JWT + user data |
| GET | `/api/auth/me` | Yes | All | Get current user |

### Pegawai
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/api/pegawai/qr-data` | Yes | pegawai | Generate QR data |
| POST | `/api/pegawai/clock-in` | Yes | pegawai | Absen masuk |
| POST | `/api/pegawai/clock-out` | Yes | pegawai | Absen pulang |
| GET | `/api/pegawai/history` | Yes | pegawai | Riwayat hari ini |
| POST | `/api/pegawai/change-password` | Yes | pegawai | Ubah password |

### Satops
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/api/satops/pegawai-list` | Yes | satops | List semua pegawai |
| POST | `/api/satops/scan` | Yes | satops | Scan QR pegawai |
| POST | `/api/satops/self-scan` | Yes | satops | Self-check masuk |
| GET | `/api/satops/scan-log` | Yes | satops | Log scan hari ini |
| GET | `/api/satops/pembina` | Yes | satops | Get/set pembina |
| POST | `/api/satops/pembina` | Yes | satops | Set pembina |
| GET | `/api/satops/status-list` | Yes | satops | Status semua pegawai |
| POST | `/api/satops/status` | Yes | satops | Set status pegawai |
| GET | `/api/satops/laporan` | Yes | satops | Cetak laporan |

### Admin
| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/api/admin/users` | Yes | admin | List semua user |
| POST | `/api/admin/users` | Yes | admin | Tambah user |
| PUT | `/api/admin/users/:nip` | Yes | admin | Edit user |
| DELETE | `/api/admin/users/:nip` | Yes | admin | Hapus user |
| POST | `/api/admin/users/:nip/reset-password` | Yes | admin | Reset password |

### Static
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Login + Frontend utama |
| GET | `/admin` | Admin panel |
| GET | `/health` | Health check |
| GET | `/static/*` | Static files |

## Konfigurasi

- **JWT Expiry**: 12 jam
- **Rate Limit Global**: 100 requests / 15 menit
- **Rate Limit Login**: 20 requests / 15 menit
- **QR Expiry**: 60 detik
- **GPS Range**: 100 meter dari Rutan Batam (lat: 1.0486, lng: 104.0304)
- **Database Path**: `/data/simpel.db` (Railway volume)
- **Placeholder**: DB pakai `$N` → dikonversi ke `?` via `convert()` di `db.js`
