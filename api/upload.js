// api/upload.js - Image Upload Endpoint powered by Vercel Blob
const crypto = require('crypto');

function verifyAdminToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [expiresAtStr, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const masterPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();
  const secret = process.env.SESSION_SECRET || masterPassword;
  const expected = crypto.createHmac('sha256', secret).update(`${expiresAt}`).digest('hex');
  return signature === expected;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAdminToken(req)) {
    return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
  }

  const { filename, base64, contentType } = req.body || {};

  if (!base64 || !filename) {
    return res.status(400).json({ error: 'Filename and base64 image data are required.' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: 'Vercel Blob is not connected yet.',
      help: 'Please go to your Vercel Dashboard -> Storage -> Create Database -> Blob, and link it to this project.'
    });
  }

  try {
    const { put } = require('@vercel/blob');
    // Clean base64 string
    const cleanBase64 = base64.replace(/^data:image\/[a-z0-9+-]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const safeName = filename.toLowerCase().replace(/[^a-z0-9.-]/g, '_');
    const blobPath = `portfolio/${Date.now()}_${safeName}`;

    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: contentType || 'image/jpeg'
    });

    return res.status(200).json({
      success: true,
      url: blob.url,
      pathname: blob.pathname
    });
  } catch (err) {
    console.error('Blob upload error:', err);
    return res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
};
