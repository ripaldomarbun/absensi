import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { queryOne, queryAll, run } from '../db.js';

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware('satops', 'admin'));

router.get('/pegawai-list', async (req, res) => {
  try {
    const rows = await queryAll("SELECT nip, name, divisi FROM users WHERE role = 'pegawai' ORDER BY divisi, name");
    const totalRow = await queryAll("SELECT COUNT(*) as c FROM users WHERE role IN ('pegawai', 'satops')");
    res.json({ pegawai: rows, total: totalRow[0].c });
  } catch (err) {
    console.error('Pegawai list error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.post('/pembina', async (req, res) => {
  try {
    const { sesi, pembina } = req.body;
    if (!sesi || !pembina) return res.status(400).json({ error: 'Sesi dan nama pembina wajib diisi' });
    const today = new Date().toISOString().slice(0, 10);
    let session = await queryOne("SELECT * FROM sessions WHERE tanggal = $1 AND jenis = $2", [today, sesi]);
    if (session) {
      await run("UPDATE sessions SET pembina = $1 WHERE id = $2", [pembina, session.id]);
    } else {
      const id = uuidv4();
      await run("INSERT INTO sessions (id, jenis, tanggal, pembina) VALUES ($1, $2, $3, $4)", [id, sesi, today, pembina]);
    }
    res.json({ success: true, pembina });
  } catch (err) {
    console.error('Pembina error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.get('/pembina', async (req, res) => {
  try {
    const { sesi } = req.query;
    const today = new Date().toISOString().slice(0, 10);
    const session = await queryOne("SELECT pembina FROM sessions WHERE tanggal = $1 AND jenis = $2", [today, sesi]);
    res.json({ pembina: session?.pembina || '' });
  } catch (err) {
    console.error('Pembina get error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.post('/scan', async (req, res) => {
  try {
    const { qrData } = req.body;
    if (!qrData) return res.status(400).json({ error: 'Data QR tidak ditemukan' });

    let parsed;
    try { parsed = JSON.parse(qrData); } catch { return res.status(400).json({ error: 'QR tidak valid' }); }

    const { nip, sesi, ts } = parsed;
    if (Date.now() - ts > 60000) return res.status(400).json({ error: 'QR sudah expired' });

    const pegawai = await queryOne("SELECT * FROM users WHERE nip = $1 AND role = 'pegawai'", [nip]);
    if (!pegawai) return res.status(400).json({ error: 'Pegawai tidak ditemukan' });

    const today = new Date().toISOString().slice(0, 10);
    let session = await queryOne("SELECT * FROM sessions WHERE tanggal = $1 AND jenis = $2 AND active = 1", [today, sesi]);
    if (!session) {
      const id = uuidv4();
      await run("INSERT INTO sessions (id, jenis, tanggal) VALUES ($1, $2, $3)", [id, sesi, today]);
      session = { id, jenis: sesi, tanggal: today, active: 1 };
    }

    const existing = await queryOne("SELECT * FROM attendance WHERE session_id = $1 AND nip = $2", [session.id, nip]);
    if (existing) return res.status(400).json({ error: `${pegawai.name} sudah discan sebelumnya` });

    const scanId = uuidv4();
    const { gps_lat, gps_lng, gps_ok } = req.body;
    await run(
      `INSERT INTO attendance (id, session_id, nip, scan_time, gps_lat, gps_lng, gps_ok, scanned_by, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, $7, 'hadir')`,
      [scanId, session.id, nip, gps_lat || null, gps_lng || null, gps_ok ? 1 : 0, req.user.name]
    );

    res.json({
      success: true,
      record: {
        id: scanId, nip, name: pegawai.name,
        scan_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      },
    });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.get('/scan-log', async (req, res) => {
  try {
    const sesi = req.query.sesi || 'pagi';
    const today = new Date().toISOString().slice(0, 10);
    const session = await queryOne("SELECT * FROM sessions WHERE tanggal = $1 AND jenis = $2 AND active = 1", [today, sesi]);
    if (!session) return res.json({ scanLog: [] });

    const rows = await queryAll(
      `SELECT a.*, u.name, u.divisi
       FROM attendance a JOIN users u ON a.nip = u.nip
       WHERE a.session_id = $1 ORDER BY a.scan_time DESC`,
      [session.id]
    );
    res.json({ scanLog: rows });
  } catch (err) {
    console.error('Scan log error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.post('/self-scan', async (req, res) => {
  try {
    const { sesi } = req.body;
    if (!sesi) return res.status(400).json({ error: 'Sesi wajib diisi' });

    const today = new Date().toISOString().slice(0, 10);
    let session = await queryOne("SELECT * FROM sessions WHERE tanggal = $1 AND jenis = $2 AND active = 1", [today, sesi]);
    if (!session) {
      const id = uuidv4();
      await run("INSERT INTO sessions (id, jenis, tanggal) VALUES ($1, $2, $3)", [id, sesi, today]);
      session = { id, jenis: sesi, tanggal: today, active: 1 };
    }

    const existing = await queryOne("SELECT * FROM attendance WHERE session_id = $1 AND nip = $2", [session.id, req.user.nip]);
    if (existing) return res.json({ success: true, message: 'Sudah discan sebelumnya' });

    const scanId = uuidv4();
    await run(
      `INSERT INTO attendance (id, session_id, nip, scan_time, scanned_by, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, 'hadir')`,
      [scanId, session.id, req.user.nip, req.user.name]
    );

    res.json({ success: true, message: 'Satops terdaftar hadir' });
  } catch (err) {
    console.error('Self-scan error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.get('/laporan', async (req, res) => {
  try {
    const sesi = req.query.sesi || 'pagi';
    const today = new Date().toISOString().slice(0, 10);
    const session = await queryOne("SELECT * FROM sessions WHERE tanggal = $1 AND jenis = $2 AND active = 1", [today, sesi]);
    const semuaPegawai = await queryAll("SELECT nip, name, divisi FROM users WHERE role IN ('pegawai', 'satops') ORDER BY divisi, name");
    const hadirList = session
      ? await queryAll("SELECT a.nip, a.scan_time, a.status, a.keterangan FROM attendance a WHERE a.session_id = $1", [session.id])
      : [];
    const hadirMap = {};
    hadirList.forEach(h => { hadirMap[h.nip] = h; });

    const laporan = semuaPegawai.map(p => {
      const att = hadirMap[p.nip];
      return { ...p, hadir: !!att, scan_time: att?.scan_time || null, status: att?.status || 'TK', keterangan: att?.keterangan || '' };
    });

    const counts = { total: semuaPegawai.length };
    laporan.forEach(p => { const s = p.status || 'TK'; counts[s.toLowerCase()] = (counts[s.toLowerCase()] || 0) + 1; });

    res.json({ tanggal: today, sesi, pembina: session?.pembina || '', laporan, counts, session: session || null });
  } catch (err) {
    console.error('Laporan error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.get('/status-list', async (req, res) => {
  try {
    const sesi = req.query.sesi || 'pagi';
    const today = new Date().toISOString().slice(0, 10);
    const session = await queryOne("SELECT * FROM sessions WHERE tanggal = $1 AND jenis = $2", [today, sesi]);
    const semua = await queryAll("SELECT nip, name, divisi FROM users WHERE role IN ('pegawai', 'satops') ORDER BY divisi, name");
    const attList = session ? await queryAll("SELECT nip, status, keterangan FROM attendance WHERE session_id = $1", [session.id]) : [];
    const attMap = {};
    attList.forEach(a => { attMap[a.nip] = a; });

    const result = semua.map(p => ({ nip: p.nip, name: p.name, divisi: p.divisi, status: attMap[p.nip]?.status || null, keterangan: attMap[p.nip]?.keterangan || '' }));
    res.json({ pegawai: result });
  } catch (err) {
    console.error('Status list error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.post('/set-status', async (req, res) => {
  try {
    const { nip, sesi, status, keterangan } = req.body;
    if (!nip || !sesi) return res.status(400).json({ error: 'NIP dan sesi wajib diisi' });

    const today = new Date().toISOString().slice(0, 10);
    let session = await queryOne("SELECT * FROM sessions WHERE tanggal = $1 AND jenis = $2", [today, sesi]);
    if (!session) {
      const id = uuidv4();
      await run("INSERT INTO sessions (id, jenis, tanggal) VALUES ($1, $2, $3)", [id, sesi, today]);
      session = { id, jenis: sesi, tanggal: today, active: 1 };
    }

    const existing = await queryOne("SELECT * FROM attendance WHERE session_id = $1 AND nip = $2", [session.id, nip]);
    if (existing) {
      await run("UPDATE attendance SET status = $1, keterangan = $2 WHERE session_id = $3 AND nip = $4",
        [status || 'TK', keterangan || '', session.id, nip]);
    } else {
      const scanId = uuidv4();
      await run("INSERT INTO attendance (id, session_id, nip, status, keterangan) VALUES ($1, $2, $3, $4, $5)",
        [scanId, session.id, nip, status || 'TK', keterangan || '']);
    }

    res.json({ success: true, nip, status: status || 'TK' });
  } catch (err) {
    console.error('Set status error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;