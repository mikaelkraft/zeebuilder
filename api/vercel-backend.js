
// This file is a template for your Vercel backend (api/index.js)
// It implements real Authentication and Usage Tracking using a MongoDB/Postgres database.

/*
  DIRECTORY STRUCTURE FOR VERCEL:
  /api
    /auth
      login.ts
      register.ts
    /user
      usage.ts
  
  DEPENDENCIES (package.json):
  npm install mongoose jsonwebtoken bcryptjs
*/

// --- api/auth/login.ts ---
import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Connect to DB (Optimization: Cache connection outside handler)
const MONGODB_URI = process.env.MONGODB_URI; // Add this to Vercel Env Vars

if (!mongoose.connections[0].readyState) {
  mongoose.connect(MONGODB_URI);
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: String,
  plan: { type: String, default: 'free' },
  requests: { type: Number, default: 0 }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    
    res.status(200).json({ 
      token, 
      user: { 
        email: user.email, 
        username: user.username, 
        plan: user.plan 
      } 
    });
  } catch (e) {
    res.status(500).json({ error: 'Server Error' });
  }
}

// --- api/user/usage.ts ---
// Updates usage counts
export const updateUsage = async (req: VercelRequest, res: VercelResponse) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).send('Unauthorized');
    
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        await User.findByIdAndUpdate(decoded.id, { $inc: { requests: 1 } });
        res.status(200).json({ success: true });
    } catch(e) {
        res.status(401).send('Invalid Token');
    }
};
