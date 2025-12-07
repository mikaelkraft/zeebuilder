
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

    // Generate Reset Token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Construct Reset Link
    // In a real app, use the actual frontend URL from env or headers
    const origin = req.headers.origin || 'http://localhost:5173';
    const resetLink = `${origin}/reset-password?token=${resetToken}`;

    // Send Email
    await sendEmail({
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
          <p>If you didn't request this, you can safely ignore this email. The link expires in 1 hour.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
