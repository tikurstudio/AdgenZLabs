// api/gallery.js - Global Gallery Persistence (Vercel Blob + Local Fallback)
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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

const LOCAL_DATA_FILE = path.join(process.cwd(), 'gallery-data.json');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch the current live gallery data
  if (req.method === 'GET') {
    // 1. Try Vercel Blob if available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { list } = require('@vercel/blob');
        const { blobs } = await list({ prefix: 'data/gallery.json' });
        if (blobs && blobs.length > 0) {
          const latest = blobs[0];
          const blobRes = await fetch(latest.url, { cache: 'no-store' });
          if (blobRes.ok) {
            const groups = await blobRes.json();
            return res.status(200).json({ success: true, source: 'blob', groups });
          }
        }
      } catch (err) {
        console.warn('Vercel Blob read notice:', err.message);
      }
    }

    // 2. Try Local File fallback
    try {
      if (fs.existsSync(LOCAL_DATA_FILE)) {
        const content = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
        const groups = JSON.parse(content);
        return res.status(200).json({ success: true, source: 'local', groups });
      }
    } catch (err) {
      console.warn('Local file read notice:', err.message);
    }

    // 3. Fallback to default
    return res.status(200).json({ success: true, isDefault: true, groups: null });
  }

  // POST: Admin updating gallery groups
  if (req.method === 'POST') {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
    }

    const { groups } = req.body || {};
    if (!Array.isArray(groups)) {
      return res.status(400).json({ error: 'Invalid gallery groups payload. Array expected.' });
    }

    let savedToBlob = false;

    // 1. Save to Vercel Blob if token configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = require('@vercel/blob');
        await put('data/gallery.json', JSON.stringify(groups), {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'application/json'
        });
        savedToBlob = true;
      } catch (err) {
        console.error('Failed to save to Vercel Blob:', err);
      }
    }

    // 2. Save to local filesystem as backup/development store
    try {
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(groups, null, 2), 'utf-8');
    } catch (err) {
      // Vercel serverless filesystem is read-only at runtime, which is expected
    }

    return res.status(200).json({
      success: true,
      savedToBlob,
      blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
      count: groups.length,
      message: 'Gallery groups successfully saved!'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
