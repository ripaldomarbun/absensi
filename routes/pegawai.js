import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.js';
import { queryOne, queryAll, run, todayWIB } from '../db.js';

const router = Router();
router.use(authMiddleware);

router.get('/session-aktif', async (req, res) => {
  try {
    const today = todayWIB();
    const sesi = req.query.sesi || 'pagi';
    let session = await queryOne("SELECT * FROM sessions WHERE tanggal = $1 AND jenis = $2 AND active = 1", [today, sesi]);
    if (!session) {
      const id = uuidv4();
      await run("INSERT INTO sessions (id, jenis, tanggal) VALUES ($1, $2, $3)", [id, sesi, today]);
      session = { id, jenis: sesi, tanggal: today, active: 1 };
    }
    res.json({ session });
  } catch (err) {
    console.error('Session error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.get('/qr-data', (req, res) => {
  const nip = req.user.nip;
  const nonce = crypto.randomBytes(8).toString('hex');
  const ts = Date.now();
  const sesi = req.query.sesi || 'pagi';
  const payload = { nip, name: req.user.name, sesi, ts, nonce };
  const secret = process.env.JWT_SECRET || 'simpel-default-secret-key-2026';
  const sig = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  const qrData = JSON.stringify({ ...payload, sig });
  res.json({ qrData, expiresIn: 60, generatedAt: ts, user: { nip: req.user.nip, name: req.user.name } });
});

router.get('/history', async (req, res) => {
  try {
    const nip = req.user.nip;
    const rows = await queryAll(
      `SELECT a.*, s.jenis as sesi_jenis, s.tanggal
       FROM attendance a JOIN sessions s ON a.session_id = s.id
       WHERE a.nip = $1 ORDER BY a.scan_time DESC LIMIT 50`,
      [nip]
    );
    res.json({ history: rows });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Password lama dan baru wajib diisi' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    }

    const user = await queryOne("SELECT * FROM users WHERE nip = $1", [req.user.nip]);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    if (!bcrypt.compareSync(oldPassword, user.password)) {
      return res.status(401).json({ error: 'Password lama salah' });
    }

    const hashed = bcrypt.hashSync(newPassword, 10);
    await run("UPDATE users SET password = $1 WHERE nip = $2", [hashed, req.user.nip]);

    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;