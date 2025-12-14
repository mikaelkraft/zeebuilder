
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../lib/supabase.js';
import { sendEmail } from '../utils/email.js';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ error: 'Auth not configured. Missing JWT_SECRET.' });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service temporarily unavailable. Please try again later.' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, username, email')
      .eq('email', email)
      .single();

    if (!user) {
      // For security, don't reveal if user exists
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate Reset Token (valid for 30 minutes)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    // Construct Reset Link using trusted origin if provided
    const origin = process.env.APP_ORIGIN || process.env.PUBLIC_APP_URL || req.headers.origin || 'http://localhost:5173';
    const resetLink = `${origin.replace(/\/$/, '')}/reset-password?token=${resetToken}`;

    // Send Email
    const emailResult = await sendEmail({
      to: email,
      subject: 'Reset your ZeeBuilder Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${user.username},</p>
          <p>We received a request to reset your password. Click the button below to proceed:</p>
          <br/>
          <a href="${resetLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <br/><br/>
          <p>If you didn't request this, you can safely ignore this email. The link expires in 30 minutes.</p>
        </div>
      `
    });

    if (!emailResult?.success) {
      console.error('Reset email failed to send', emailResult?.error);
    }

    res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
