# PANDUAN SIMULASI APLIKASI SIMPEL

**SIMPEL** — *Sistem Informasi Monitoring Presensi Elektronik*
Rumah Tahanan Negara Kelas IIA Batam
Kementerian Imigrasi dan Pemasyarakatan RI

---

## DAFTAR ISI

1. [Tentang Aplikasi](#1-tentang-aplikasi)
2. [Persiapan](#2-persiapan)
3. [Login](#3-login)
4. [Role Pegawai — Menampilkan QR](#4-role-pegawai--menampilkan-qr)
5. [Role Satops — Melakukan Scan](#5-role-satops--melakukan-scan)
6. [Role Satops — Rekap & Cetak Laporan](#6-role-satops--rekap--cetak-laporan)
7. [Data Pegawai yang Tersedia](#7-data-pegawai-yang-tersedia)
8. [Skenario Simulasi Lengkap](#8-skenario-simulasi-lengkap)
9. [Pemecahan Masalah](#9-pemecahan-masalah)

---

## 1. TENTANG APLIKASI

SIMPEL adalah aplikasi **presensi berbasis QR Code** untuk mendata kehadiran pegawai di lingkungan Rutan Batam.

**Ada 3 jenis pengguna:**

| Role | Tugas |
|------|-------|
| **Pegawai** | Login, tampilkan QR Code, scan oleh Satops |
| **Satops** | Login, scan QR pegawai, kelola data, cetak laporan |
| **Admin** | Sama seperti Satops, bisa kelola semua pegawai |

**2 sesi apel:**

- **☀️ Apel Pagi** — scan masuk pagi hari
- **🌙 Apel Sore** — scan masuk sore hari

---

## 2. PERSIAPAN

### Yang Dibutuhkan

1. **2 HP** (Handphone):
   - **HP 1:** untuk **Pegawai** (menampilkan QR Code)
   - **HP 2:** untuk **Satops** (memindai QR Code dengan kamera)

2. **Koneksi internet** stabil

3. **Browser** (Google Chrome atau Safari)

### Buka Aplikasi

Buka alamat berikut di browser **kedua HP**:

```
https://absensi-production-9488.up.railway.app
```

> **Tips:** Jika tampilannya tidak seperti seharusnya, refresh paksa dengan membuka menu Safari/Chrome → **Muat Ulang & Hapus Cache**, atau ketik alamatnya lagi dari awal.

---

## 3. LOGIN

1. Di halaman awal, masukkan **NIP** dan **Password**
2. Klik tombol **"Masuk"**

> **Password default = NIP masing-masing** (isikan NIP yang sama ke kolom NIP dan Password)

**Tampilan setelah login akan berbeda tergantung role:**

- **Pegawai** → langsung masuk ke halaman **QR Code**
- **Satops/Admin** → masuk ke halaman **Scan Kamera**

---

## 4. ROLE PEGAWAI — MENAMPILKAN QR

Setelah login sebagai pegawai, Anda akan melihat:

### Yang Tampil di Layar

1. **Header** — nama dan sapaan selamat pagi/siang/sore
2. **Pilihan sesi** — tombol ☀️ Apel Pagi / 🌙 Apel Sore
3. **QR Code** — kode batang persegi yang akan dipindai
4. **Timer** — hitung mundur 60 detik; QR otomatis berganti setelah habis
5. **Tombol ↻ Refresh** — perbarui QR secara manual
6. **Riwayat Absensi** — daftar kehadiran yang sudah terekam

### Cara Penggunaan

1. Pilih sesi Apel (**Pagi** atau **Sore**)
2. Tunggu QR Code muncul di layar
3. Tunjukkan layar ke petugas **Satops** untuk dipindai
4. Setelah dipindai, akan muncul tanda hijau ✔️ beserta keterangan waktu

> **Catatan:** QR Code diperbarui setiap 60 detik demi keamanan. Jika QR sudah kedaluwarsa, silakan tunggu atau tekan tombol ↻ Refresh.

### Logout

Klik tombol **"Keluar"** di pojok kanan atas untuk keluar.

---

## 5. ROLE SATOPS — MELAKUKAN SCAN

Setelah login sebagai Satops/Admin, Anda akan melihat:

### Yang Tampil di Layar

1. **Header** — nama petugas Satops
2. **Pilihan sesi** — tombol ☀️ Apel Pagi / 🌙 Apel Sore
3. **Tombol 📸 Scan Kamera** — untuk memulai pemindaian
4. **Tombol 📋 Rekap** — untuk melihat laporan
5. **Tombol 👥 Pegawai** — untuk mengelola data pegawai

### Cara Scan QR

1. Pilih sesi Apel (**Pagi** atau **Sore**)
2. Klik tombol **"📸 Scan Kamera"**
3. Arahkan kamera ke QR Code yang ditampilkan di layar perangkat pegawai
4. Tunggu beberapa detik — QR akan terbaca otomatis
5. Jika berhasil:
   - Layar menampilkan lingkaran hijau ✔️ dengan nama pegawai
   - Muncul notifikasi: "✅ Nama Pegawai — 07:30 WIB"
   - Data otomatis tersimpan
6. Jika gagal:
   - Layar menampilkan lingkaran merah ✕
   - Muncul notifikasi dengan pesan error

> **Tips Scan:**
> - Pastikan QR Code terlihat jelas dan tidak buram
> - Jaga jarak kamera sekitar 15-30 cm dari layar
> - Hindari pantulan cahaya di layar

### Log Scan

Di bawah tombol scan, akan muncul daftar pegawai yang sudah discan, lengkap dengan:
- Waktu scan
- Status (✔ Hadir)

### Self-Scan Satops

Saat pertama kali login sebagai Satops, sistem akan otomatis mencatat kehadiran Satops sendiri. Satops tidak perlu melakukan scan untuk dirinya sendiri.

---

## 6. ROLE SATOPS — REKAP & CETAK LAPORAN

Klik tombol **"📋 Rekap"** untuk melihat laporan kehadiran.

### Fitur Rekap

1. **Filter Tanggal** — pilih tanggal laporan yang ingin dilihat
2. **Rekap per Divisi** — kehadiran dikelompokkan berdasarkan divisi masing-masing
3. **Status** — setiap pegawai akan muncul status:
   - ✔ **Hadir** — sudah melakukan scan
   - ✘ **TK (Tidak Hadir)** — belum melakukan scan
4. **Total Hadir / Total Pegawai** — ringkasan jumlah

### Cetak Laporan

1. Atur filter tanggal sesuai kebutuhan
2. Klik tombol **"🖨 Cetak Laporan"**
3. Browser akan membuka dialog cetak
4. Pilih tujuan cetak (printer PDF atau printer kertas)
5. Klik Cetak

---

## 7. DATA PEGAWAI YANG TERSE

Berikut beberapa akun yang bisa digunakan untuk simulasi:

| NIP | Nama | Role | Password |
|-----|------|------|----------|
| `199707262017121002` | M. WILDAN ADITYANSYAH | Satops | *NIP* |
| `198605042007011002` | FAJAR TEGUH WIBOWO, A.Md.IP, S.Sos, M.A | Pegawai | *NIP* |
| `199003102011031001` | Admin | Admin | *NIP* |
| *(NIP pegawai lain)* | *(nama sesuai database)* | Pegawai | *NIP masing-masing* |

> **Aturan praktis:** untuk semua akun, **Password = NIP** (angka NIP yang sama).

---

## 8. SKENARIO SIMULASI LENGKAP

Berikut skenario simulasi dari awal sampai akhir:

### Skenario 1: Absensi Normal

**Peralatan:** 2 HP

| Langkah | HP 1 (Pegawai) | HP 2 (Satops) |
|---------|----------------|----------------|
| 1 | Buka aplikasi di browser | Buka aplikasi di browser |
| 2 | Login sebagai **FAJAR** (NIP: `198605042007011002`, password: *NIP*) | Login sebagai **WILDAN** (NIP: `199707262017121002`, password: *NIP*) |
| 3 | Pilih sesi ☀️ Apel Pagi | Pilih sesi ☀️ Apel Pagi |
| 4 | Tunggu QR Code muncul | Klik **"📸 Scan Kamera"**, izinkan akses kamera |
| 5 | **Dekatkan layar HP 1 ke kamera HP 2** | Arahkan kamera ke QR di layar HP 1 |
| 6 | — | Tunggu scan otomatis, muncul ✔ hijau |
| 7 | Lihat riwayat: muncul tanda hadir | Lihat log scan: nama FAJAR tercatat |

### Skenario 2: Sesi Sore

Ulangi langkah yang sama tetapi pilih sesi **🌙 Apel Sore** di kedua perangkat.

### Skenario 3: Melihat & Cetak Laporan

| Langkah | Yang Dilakukan |
|---------|----------------|
| 1 | Di HP Satops, klik **"📋 Rekap"** |
| 2 | Pilih tanggal (misal hari ini) |
| 3 | Lihat daftar kehadiran per divisi |
| 4 | Klik **"🖨 Cetak Laporan"** untuk mencetak (simpan sebagai PDF) |

### Skenario 4: Ganti Akun

| Langkah | Yang Dilakukan |
|---------|----------------|
| 1 | Klik **"Keluar"** di pojok kanan atas |
| 2 | Login dengan NIP dan password berbeda |
| 3 | Lanjutkan simulasi |

---

## 9. PEMECAHAN MASALAH

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Halaman tidak bisa dibuka | Koneksi internet terputus | Periksa koneksi internet |
| Tampilan berantakan | Browser masih menyimpan halaman lama | **Hard refresh:** Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows) |
| QR Code tidak muncul | Data terlalu panjang | Sudah diperbaiki — hard refresh saja |
| "QR tidak valid" saat scan | QR dari server berbeda | Pastikan kedua perangkat membuka URL yang sama |
| Kamera tidak mau menyala | Izin kamera belum diberikan | Berikan izin akses kamera di browser |
| QR tidak terbaca | Jarak/kurang fokus | Atur jarak 15-30 cm, usap layar untuk fokus |
| Lupa password | Semua password = NIP | Gunakan NIP sebagai password |

---

## CATATAN TEKNIS

- Aplikasi berjalan di server **Railway** dengan database **SQLite**
- QR Code menggunakan **enkripsi HMAC** untuk mencegah pemalsuan
- QR Code kedaluwarsa dalam **60 detik**
- Waktu absensi menggunakan **zona WIB (Asia/Jakarta)**
- Data pegawai bisa ditambahkan/dihapus/diedit oleh Satops/Admin melalui menu **👥 Pegawai**

---

*Simpel — Sistem Informasi Monitoring Presensi Elektronik*
*Rutan Kelas IIA Batam — 2026*
