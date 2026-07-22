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
    const { rows } = await sql`SELECT id, name, model, messages, created_at FROM chats WHERE user_id = ${user.id} ORDER BY created_at DESC`;
    res.json(rows.map(r => ({ ...r, messages: typeof r.messages === 'string' ? JSON.parse(r.messages) : r.messages })));
  }
  else if (req.method === 'POST') {
    const { id, name, model, messages } = req.body;
    await sql`INSERT INTO chats (id, user_id, name, model, messages) VALUES (${id}, ${user.id}, ${name}, ${model}, ${JSON.stringify(messages)}) ON CONFLICT (id) DO UPDATE SET name = ${name}, model = ${model}, messages = ${JSON.stringify(messages)}`;
    res.json({ ok: true });
  }
  else if (req.method === 'DELETE') {
    const { id } = req.body;
    await sql`DELETE FROM chats WHERE id = ${id} AND user_id = ${user.id}`;
    res.json({ ok: true });
  }
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
