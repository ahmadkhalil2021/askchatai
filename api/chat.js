import jwt from 'jsonwebtoken';
import { sql, initDB } from './lib/db.js';

await initDB();

function auth(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  try { return jwt.verify(header.slice(7), process.env.JWT_SECRET || 'secret123'); } catch { return null; }
}

const EXTERNAL_API = 'https://inference.dahl.global/v1/chat/completions';

export default async function handler(req, res) {
  const user = auth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { model, messages } = req.body;
  if (!model || !messages) return res.status(400).json({ error: 'model and messages required' });

  const memoryRows = await sql`SELECT content FROM memories WHERE user_id = ${user.id} ORDER BY created_at ASC`;
  let systemContent = 'Du bist ein hilfreicher Assistent.';

  if (memoryRows.length > 0) {
    const memoryText = memoryRows.map(r => `- ${r.content}`).join('\n');
    systemContent = `Du bist ein hilfreicher Assistent. Hier sind wichtige Fakten ueber den Nutzer (merke sie dir immer):

${memoryText}`;
  }

  const messagesWithSystem = [
    { role: 'system', content: systemContent },
    ...messages
  ];

  const apiKey = process.env.VITE_API_KEY || process.env.DAHL_API_KEY;
  if (!apiKey) {
    console.error('API key missing. VITE_API_KEY:', process.env.VITE_API_KEY, 'DAHL_API_KEY:', process.env.DAHL_API_KEY);
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const externalRes = await fetch(EXTERNAL_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: messagesWithSystem
      })
    });

    const data = await externalRes.json();
    if (!externalRes.ok) {
      return res.status(externalRes.status).json(data);
    }

    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'API Fehler: ' + e.message });
  }
}
