import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql, initDB } from './lib/db.js';

await initDB();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const [user] = await sql`INSERT INTO users (email, password) VALUES (${email}, ${hash}) RETURNING id, email`;
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Server error: ' + (e.message || 'unknown') });
  }
}
