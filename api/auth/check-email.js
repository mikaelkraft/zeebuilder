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

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
      console.error('Check email error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ exists: !!user });
  } catch (error) {
    console.error('Check email server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
