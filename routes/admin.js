import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { queryOne, queryAll, run } from '../db.js';

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    let sql = "SELECT nip, name, role, divisi FROM users";
    const params = [];
    const conditions = [];

    if (role) {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      conditions.push(`(name LIKE $${params.length - 1} OR nip LIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY role, divisi, name";

    const users = await queryAll(sql, params);
    res.json({ users, total: users.length });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { nip, name, role, divisi, password } = req.body;
    if (!nip || !name || !role) {
      return res.status(400).json({ error: 'NIP, nama, dan role wajib diisi' });
    }
    if (!/^\d{15,20}$/.test(nip)) {
      return res.status(400).json({ error: 'NIP harus 15-20 digit angka' });
    }
    if (!['pegawai', 'satops', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role harus pegawai, satops, atau admin' });
    }
    if (name.length > 200) {
      return res.status(400).json({ error: 'Nama maksimal 200 karakter' });
    }
    if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const existing = await queryOne("SELECT 1 FROM users WHERE nip = $1", [nip]);
    if (existing) return res.status(409).json({ error: 'NIP sudah terdaftar' });

    const hash = bcrypt.hashSync(password || nip, 10);
    await run(
      "INSERT INTO users (nip, name, password, role, divisi) VALUES ($1, $2, $3, $4, $5)",
      [nip, name.toUpperCase(), hash, role, divisi || '']
    );

    res.json({ success: true, message: 'User berhasil ditambahkan' });
  } catch (err) {
    console.error('Admin add user error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.put('/users/:nip', async (req, res) => {
  try {
    const { name, role, divisi, password } = req.body;
    const existing = await queryOne("SELECT 1 FROM users WHERE nip = $1", [req.params.nip]);
    if (!existing) return res.status(404).json({ error: 'User tidak ditemukan' });

    if (role && !['pegawai', 'satops', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role harus pegawai, satops, atau admin' });
    }
    if (name && name.length > 200) {
      return res.status(400).json({ error: 'Nama maksimal 200 karakter' });
    }
    if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const updates = [];
    const params = [];

    if (name) { updates.push("name = $1"); params.push(name.toUpperCase()); }
    if (role) { updates.push(`role = $${params.length + 1}`); params.push(role); }
    if (divisi !== undefined) { updates.push(`divisi = $${params.length + 1}`); params.push(divisi); }
    if (password) {
      const hash = bcrypt.hashSync(password, 10);
      updates.push(`password = $${params.length + 1}`);
      params.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diubah' });
    }

    params.push(req.params.nip);
    await run(`UPDATE users SET ${updates.join(', ')} WHERE nip = $${params.length}`, params);

    res.json({ success: true, message: 'User berhasil diubah' });
  } catch (err) {
    console.error('Admin edit user error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.delete('/users/:nip', async (req, res) => {
  try {
    const existing = await queryOne("SELECT * FROM users WHERE nip = $1", [req.params.nip]);
    if (!existing) return res.status(404).json({ error: 'User tidak ditemukan' });

    if (existing.role === 'admin') {
      const adminCount = await queryOne("SELECT COUNT(*) as c FROM users WHERE role = 'admin'");
      if (adminCount.c <= 1) {
        return res.status(400).json({ error: 'Tidak bisa menghapus admin terakhir' });
      }
    }

    await run("DELETE FROM attendance WHERE nip = $1", [req.params.nip]);
    await run("DELETE FROM users WHERE nip = $1", [req.params.nip]);

    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.post('/users/:nip/reset-password', async (req, res) => {
  try {
    const existing = await queryOne("SELECT 1 FROM users WHERE nip = $1", [req.params.nip]);
    if (!existing) return res.status(404).json({ error: 'User tidak ditemukan' });

    const newPassword = req.body.password || req.params.nip;
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    await run("UPDATE users SET password = $1 WHERE nip = $2", [hash, req.params.nip]);

    res.json({ success: true, message: 'Password berhasil direset' });
  } catch (err) {
    console.error('Admin reset password error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
