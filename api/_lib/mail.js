import nodemailer from 'nodemailer';

// Transactional send only (confirm / welcome / unsubscribe receipts) via the
// Hostinger mailbox over SMTP. The weekly digest does NOT go through here —
// that's Resend (api/_lib/resend.js). Hostinger caps bulk sending.
let _transport;

function transport() {
  if (!_transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    _transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return _transport;
}

/**
 * @param {{ to: string, subject: string, html: string, text: string,
 *           listUnsubscribe?: string }} msg
 */
export async function sendMail(msg) {
  const headers = {};
  if (msg.listUnsubscribe) {
    headers['List-Unsubscribe'] = `<${msg.listUnsubscribe}>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }
  return transport().sendMail({
    from: process.env.NEWSLETTER_FROM || 'British Home Interior <newsletter@britishhomeinterior.co.uk>',
    replyTo: process.env.NEWSLETTER_REPLY_TO || undefined,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
    headers,
  });
}
