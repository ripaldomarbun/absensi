import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'simpel-default-secret-key-2026';

export function generateToken(user) {
  return jwt.sign(
    { nip: user.nip, name: user.name, role: user.role, divisi: user.divisi },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalid atau expired' });
  }
}

export function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
