import { Router } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth.js';
import { queryOne, queryAll, run } from '../db.js';

const router = Router();
router.use(authMiddleware);

router.get('/session-aktif', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
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
  const qrData = JSON.stringify({ nip, name: req.user.name, sesi, ts, nonce });
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

export default router;