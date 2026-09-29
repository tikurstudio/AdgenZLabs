// api/contact.js - Serverless Endpoint for Project Inquiries
const crypto = require('crypto');

// In-memory / serverless cache for inquiries
let cachedLeads = [];

function verifyAdminToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [expiresAtStr, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const masterPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const secret = process.env.SESSION_SECRET || masterPassword;
  const expected = crypto.createHmac('sha256', secret).update(`${expiresAt}`).digest('hex');
  return signature === expected;
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Admin fetching inquiries for the Admin Suite
  if (req.method === 'GET') {
    if (!verifyAdminToken(req)) {
      return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
    }
    return res.status(200).json({ success: true, leads: cachedLeads });
  }

  // POST: Client submitting project brief
  if (req.method === 'POST') {
    const { name, email, service, budget, message } = req.body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid client email is required.' });
    }

    const lead = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      brand: (name || 'Client').trim(),
      email: email.trim(),
      tier: service || 'Creative Direction',
      spend: budget || 'Flexible',
      msg: (message || '').trim(),
      status: 'New'
    };

    cachedLeads.unshift(lead);
    if (cachedLeads.length > 100) cachedLeads.pop();

    const recipient = process.env.CONTACT_EMAIL || 'sifentekalig@gmail.com';
    let emailDelivered = false;
    let deliveryProvider = null;

    // 1. Try Resend if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'Sifen Portfolio <onboarding@resend.dev>',
            to: [recipient],
            reply_to: lead.email,
            subject: `✨ New Inquiry: ${lead.brand} - ${lead.tier}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0c0c0e; color: #f4f4f5; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <h2 style="margin: 0 0 16px; color: #F2D338; font-size: 24px;">New Project Brief Received</h2>
                <p style="color: #a1a1aa; margin: 0 0 24px; font-size: 14px;">Submitted through your portfolio website.</p>
                <div style="background: #18181b; padding: 18px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 6px 0;"><strong style="color: #e4e4e7;">Client / Brand:</strong> ${lead.brand}</p>
                  <p style="margin: 6px 0;"><strong style="color: #e4e4e7;">Email:</strong> <a href="mailto:${lead.email}" style="color: #F2D338;">${lead.email}</a></p>
                  <p style="margin: 6px 0;"><strong style="color: #e4e4e7;">Project Scope:</strong> ${lead.tier}</p>
                  <p style="margin: 6px 0;"><strong style="color: #e4e4e7;">Budget:</strong> ${lead.spend}</p>
                </div>
                <div style="margin-bottom: 24px;">
                  <h4 style="color: #d4d4d8; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Project Vision / Notes:</h4>
                  <p style="background: #18181b; padding: 14px; border-radius: 8px; margin: 0; line-height: 1.5; color: #e4e4e7; font-size: 14px;">${lead.msg || 'No specific notes provided.'}</p>
                </div>
                <p style="font-size: 12px; color: #71717a; margin: 0; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
                  Tip: Hit <strong>Reply</strong> to respond directly to ${lead.email}.
                </p>
              </div>
            `
          })
        });
        if (resendRes.ok) {
          emailDelivered = true;
          deliveryProvider = 'resend';
        }
      } catch (err) {
        console.error('Resend delivery error:', err);
      }
    }

    // 2. Try Web3Forms if configured
    if (!emailDelivered && process.env.WEB3FORMS_ACCESS_KEY) {
      try {
        const w3Res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: process.env.WEB3FORMS_ACCESS_KEY,
            subject: `✨ New Inquiry: ${lead.brand} - ${lead.tier}`,
            from_name: lead.brand,
            replyto: lead.email,
            to_email: recipient,
            Client_Name: lead.brand,
            Client_Email: lead.email,
            Project_Scope: lead.tier,
            Budget_Range: lead.spend,
            Project_Vision: lead.msg || 'None provided'
          })
        });
        const w3Data = await w3Res.json().catch(() => ({}));
        if (w3Data.success) {
          emailDelivered = true;
          deliveryProvider = 'web3forms';
        }
      } catch (err) {
        console.error('Web3Forms delivery error:', err);
      }
    }

    return res.status(200).json({
      success: true,
      delivered: emailDelivered,
      provider: deliveryProvider,
      recipient,
      lead
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
