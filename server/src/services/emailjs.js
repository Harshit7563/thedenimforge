/**
 * Send OTP via EmailJS REST API (server-side).
 * Dashboard: https://dashboard.emailjs.com
 *
 * Template variables expected:
 *   {{to_email}}, {{to_name}}, {{otp}}, {{purpose}}
 * Set template "To Email" to {{to_email}}
 */

export function emailjsConfigured() {
  return Boolean(
    process.env.EMAILJS_SERVICE_ID &&
      process.env.EMAILJS_TEMPLATE_ID &&
      process.env.EMAILJS_PUBLIC_KEY
  );
}

export async function sendOtpEmail({ toEmail, toName, otp, purpose }) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('[EmailJS] Not configured — OTP for', toEmail, ':', otp);
    return { sent: false, logged: true };
  }

  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: toEmail,
      email: toEmail,
      to_name: toName || 'Customer',
      user_name: toName || 'Customer',
      otp: String(otp),
      passcode: String(otp),
      purpose: purpose === 'login' ? 'sign-in' : 'account registration',
      from_name: 'The Denim Forge',
    },
  };
  if (privateKey) body.accessToken = privateKey;

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[EmailJS] send failed:', res.status, text);
    throw new Error('Failed to send OTP email. Please try again.');
  }

  return { sent: true };
}
