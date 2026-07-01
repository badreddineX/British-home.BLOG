export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, city, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'British Home Interior <onboarding@resend.dev>',
        to: ['automatedlabs.ai@gmail.com'],
        subject: `✉️ New Contact Message from ${name} — British Home Interior`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 2rem; background: #FAF7F4; border: 1px solid #E8E0D8;">
            <h2 style="color: #3D2B1F; font-size: 1.3rem; margin: 0 0 1.25rem;">New Contact Message</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 1.5rem;">
              <tr>
                <td style="padding: 0.5rem 0; color: #6B7280; width: 80px;">Name</td>
                <td style="padding: 0.5rem 0; color: #1A1A1A; font-weight: bold;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 0.5rem 0; color: #6B7280;">Email</td>
                <td style="padding: 0.5rem 0; color: #1A1A1A;">${email}</td>
              </tr>
              ${city ? `<tr><td style="padding: 0.5rem 0; color: #6B7280;">Location</td><td style="padding: 0.5rem 0; color: #1A1A1A;">${city}</td></tr>` : ''}
            </table>
            <div style="background: #fff; padding: 1rem 1.25rem; border-left: 3px solid #B89A6A; margin-bottom: 1.5rem;">
              <p style="color: #6B7280; font-size: 0.78rem; margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.08em;">Message</p>
              <p style="color: #1A1A1A; font-size: 0.95rem; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #aaa; font-size: 0.78rem; margin: 0;">Sent automatically from British Home Interior contact form</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Could not send message. Please try again.' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
