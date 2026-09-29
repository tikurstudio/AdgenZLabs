// api/admin-auth.js - Secure Authentication for Sifen Tekalign Admin Suite
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  const masterPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();
  const entered = (password || '').trim();

  if (!entered) {
    return res.status(400).json({ error: 'Master password is required.' });
  }

  if (entered !== masterPassword) {
    return res.status(401).json({ error: 'Incorrect master password.' });
  }

  // Generate secure HMAC signature valid for 7 days
  const secret = process.env.SESSION_SECRET || masterPassword;
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const signature = crypto.createHmac('sha256', secret).update(`${expiresAt}`).digest('hex');
  const token = `${expiresAt}.${signature}`;

  return res.status(200).json({
    success: true,
    token,
    isDefaultPassword: !process.env.ADMIN_PASSWORD,
    message: 'Admin session authenticated.'
  });
};
