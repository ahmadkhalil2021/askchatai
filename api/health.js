export default async function handler(req, res) {
  res.json({ ok: true, db: !!process.env.DATABASE_URL, jwt: !!process.env.JWT_SECRET });
}
