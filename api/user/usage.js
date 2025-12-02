import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if Supabase is configured
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  // Verify JWT token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // GET - Retrieve usage stats
    if (req.method === 'GET') {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('requests, plan')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        requests: user.requests || 0,
        plan: user.plan || 'free'
      });
    }

    // POST - Increment usage count
    if (req.method === 'POST') {
      const { data: user, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('requests')
        .eq('id', decoded.id)
        .single();

      if (fetchError || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ requests: (user.requests || 0) + 1 })
        .eq('id', decoded.id);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update usage' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Usage error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
