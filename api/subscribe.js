export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
        subject: '🏡 New Newsletter Subscriber — British Home Interior',
        html: `
          <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 2rem; background: #FAF7F4; border: 1px solid #E8E0D8;">
            <h2 style="color: #3D2B1F; font-size: 1.3rem; margin: 0 0 1rem;">New Subscriber</h2>
            <p style="color: #6B7280; font-size: 0.9rem; margin: 0 0 0.75rem;">Someone just signed up to your newsletter on British Home Interior:</p>
            <p style="font-size: 1.05rem; color: #1A1A1A; font-weight: bold; background: #fff; padding: 0.75rem 1rem; border-left: 3px solid #B89A6A; margin: 0 0 1.5rem;">${email}</p>
            <p style="color: #aaa; font-size: 0.78rem; margin: 0;">Sent automatically from britishhomeinterior.co.uk</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: err.message ?? JSON.stringify(err) });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Subscribe handler error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
