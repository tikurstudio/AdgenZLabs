// api/check-trigger.js - Secret Gatekeeper verification against .env variables
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email } = req.body || {};

  // Configured secretly in Vercel Environment Variables (.env)
  const secretName = (process.env.ADMIN_TRIGGER_NAME || 'Sifen Admin').trim().toLowerCase();
  const secretEmail = (process.env.ADMIN_TRIGGER_EMAIL || 'sifentekalig@gmail.com').trim().toLowerCase();

  const enteredName = (name || '').trim().toLowerCase();
  const enteredEmail = (email || '').trim().toLowerCase();

  const isMatch = Boolean(
    enteredName &&
    enteredEmail &&
    enteredName === secretName &&
    enteredEmail === secretEmail
  );

  return res.status(200).json({
    trigger: isMatch
  });
};
