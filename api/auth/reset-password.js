import bcrypt from 'bcryptjs';
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

  const { newPassword, resetToken } = req.body;

  if (!newPassword || !resetToken) {
    return res.status(400).json({ error: 'New password and reset token are required' });
  }

  try {
    // Verify Token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'reset') {
        return res.status(403).json({ error: 'Invalid token type' });
    }

    const email = decoded.email;

    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user in Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', email)
      .select();

    if (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ error: 'Failed to reset password' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send Confirmation Email
    await sendEmail({
        to: email,
        subject: 'Password Changed Successfully',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Changed</h2>
            <p>Your ZeeBuilder password has been successfully updated.</p>
            <p>If you did not perform this action, please contact support immediately.</p>
          </div>
        `
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Invalid or expired reset token' });
    }
    console.error('Reset password server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
