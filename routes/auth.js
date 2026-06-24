import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne, queryAll, run } from '../db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { nip, password } = req.body;
    if (!nip || !password) {
      return res.status(400).json({ error: 'NIP dan password wajib diisi' });
    }

    const user = await queryOne("SELECT * FROM users WHERE nip = $1", [nip]);
    if (!user) {
      return res.status(401).json({ error: 'NIP atau password salah' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'NIP atau password salah' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { nip: user.nip, name: user.name, role: user.role, divisi: user.divisi },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
