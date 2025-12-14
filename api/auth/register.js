import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../lib/supabase.js';

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

  // Check if Supabase is configured
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Database service temporarily unavailable. Please try again later.' });
  }

  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password, and username are required' });
  }

  const cleanEmail = email.trim();
  const cleanUsername = username.trim();

  const strongPassword = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  if (!strongPassword) {
    return res.status(400).json({ error: 'Password must be at least 8 characters and include upper, lower, and a number.' });
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in Supabase
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: cleanEmail,
        password_hash: passwordHash,
        username: cleanUsername,
        plan: 'free',
        requests: 0,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        is_admin: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send Welcome Email
    try {
      const { sendEmail } = await import('../utils/email.js');
      await sendEmail({
        to: cleanEmail,
        subject: 'Welcome to ZeeBuilder!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Welcome to ZeeBuilder, ${cleanUsername}! 🚀</h1>
            <p>We're thrilled to have you on board. ZeeBuilder is your AI-powered development companion.</p>
            <p>Get started by creating your first project!</p>
            <br/>
            <a href="https://zeebuilder.com" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      token,
      user: {
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        isAdmin: newUser.is_admin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
