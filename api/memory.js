import jwt from 'jsonwebtoken';
import { sql, initDB } from './lib/db.js';

await initDB();

function auth(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  try { return jwt.verify(header.slice(7), process.env.JWT_SECRET || 'secret123'); } catch { return null; }
}

export default async function handler(req, res) {
  const user = auth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const rows = await sql`SELECT id, content, created_at FROM memories WHERE user_id = ${user.id} ORDER BY created_at DESC`;
    res.json(rows);
  }
  else if (req.method === 'POST') {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
    const [row] = await sql`INSERT INTO memories (user_id, content) VALUES (${user.id}, ${content.trim()}) RETURNING id, content, created_at`;
    res.json(row);
  }
  else if (req.method === 'DELETE') {
    const id = req.query?.id || (req.body && req.body.id);
    if (!id) return res.status(400).json({ error: 'Missing id' });
    await sql`DELETE FROM memories WHERE id = ${id} AND user_id = ${user.id}`;
    res.json({ ok: true });
  }
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
