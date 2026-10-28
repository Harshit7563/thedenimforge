import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateOtp, canResend, saveOtp, verifyOtp, clearOtp } from '../services/otp.js';
import { sendOtpEmail, emailjsConfigured } from '../services/emailjs.js';

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    is_wholesale: user.is_wholesale,
  };
}

async function dispatchOtp(email, purpose, toName, payload) {
  const cooldown = canResend(email, purpose);
  if (!cooldown.ok) {
    const secs = Math.ceil(cooldown.waitMs / 1000);
    const err = new Error(`Please wait ${secs}s before requesting another OTP`);
    err.status = 429;
    throw err;
  }
  const otp = generateOtp();
  saveOtp(email, purpose, otp, payload);
  try {
    await sendOtpEmail({ toEmail: email, toName, otp, purpose });
  } catch (err) {
    clearOtp(email, purpose);
    throw err;
  }
  return {
    otpRequired: true,
    email,
    message: emailjsConfigured()
      ? `OTP sent to ${email}`
      : `OTP generated (EmailJS not configured — check server logs)`,
    expiresInSec: 600,
  };
}

async function handleRegisterSendOtp(req, res) {
  try {
    const { email, password, first_name, last_name, phone, company_name, is_wholesale } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows[0]) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const result = await dispatchOtp(
      email.trim().toLowerCase(),
      'register',
      first_name || 'Customer',
      {
        email: email.trim().toLowerCase(),
        password_hash,
        first_name,
        last_name,
        phone,
        company_name,
        is_wholesale: is_wholesale !== false,
      }
    );
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function handleRegisterVerifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const checked = verifyOtp(email.trim().toLowerCase(), 'register', String(otp).trim());
    if (!checked.ok) return res.status(400).json({ error: checked.error });

    const d = checked.payload;
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, company_name, is_wholesale)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, email, first_name, last_name, is_wholesale`,
      [d.email, d.password_hash, d.first_name, d.last_name, d.phone, d.company_name, true]
    );
    const user = result.rows[0];
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
}

async function handleLoginSendOtp(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const out = await dispatchOtp(user.email, 'login', user.first_name || 'Customer', { userId: user.id });
    res.json(out);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function handleLoginVerifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const checked = verifyOtp(email.trim().toLowerCase(), 'login', String(otp).trim());
    if (!checked.ok) return res.status(400).json({ error: checked.error });

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, is_wholesale FROM users WHERE id = $1',
      [checked.payload.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'User not found' });

    res.json({ user: publicUser(user), token: signToken(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

router.post('/register/send-otp', handleRegisterSendOtp);
router.post('/register/verify-otp', handleRegisterVerifyOtp);
router.post('/login/send-otp', handleLoginSendOtp);
router.post('/login/verify-otp', handleLoginVerifyOtp);

/** Same as OTP send — no token without email verification */
router.post('/register', handleRegisterSendOtp);
router.post('/login', handleLoginSendOtp);

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, company_name, is_wholesale FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, phone, company_name } = req.body;
    const result = await pool.query(
      `UPDATE users SET
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         phone = COALESCE($3, phone),
         company_name = COALESCE($4, company_name)
       WHERE id = $5
       RETURNING id, email, first_name, last_name, phone, company_name, is_wholesale`,
      [first_name, last_name, phone, company_name, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
