import crypto from 'crypto';

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;
const MAX_ATTEMPTS = 5;

/** @type {Map<string, { hash: string, expiresAt: number, payload: object, attempts: number, lastSentAt: number }>} */
const store = new Map();

function key(email, purpose) {
  return `${String(email).trim().toLowerCase()}:${purpose}`;
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

export function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

export function canResend(email, purpose) {
  const entry = store.get(key(email, purpose));
  if (!entry) return { ok: true };
  const wait = RESEND_COOLDOWN_MS - (Date.now() - entry.lastSentAt);
  if (wait > 0) return { ok: false, waitMs: wait };
  return { ok: true };
}

export function saveOtp(email, purpose, otp, payload = {}) {
  store.set(key(email, purpose), {
    hash: hashOtp(otp),
    expiresAt: Date.now() + OTP_TTL_MS,
    payload,
    attempts: 0,
    lastSentAt: Date.now(),
  });
}

export function verifyOtp(email, purpose, otp) {
  const k = key(email, purpose);
  const entry = store.get(k);
  if (!entry) return { ok: false, error: 'OTP expired or not found. Request a new one.' };
  if (Date.now() > entry.expiresAt) {
    store.delete(k);
    return { ok: false, error: 'OTP expired. Request a new one.' };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(k);
    return { ok: false, error: 'Too many invalid attempts. Request a new OTP.' };
  }
  entry.attempts += 1;
  if (entry.hash !== hashOtp(otp)) {
    return { ok: false, error: 'Invalid OTP' };
  }
  const payload = entry.payload;
  store.delete(k);
  return { ok: true, payload };
}

export function clearOtp(email, purpose) {
  store.delete(key(email, purpose));
}
