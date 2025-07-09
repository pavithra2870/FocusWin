// routes/auth.js
const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const router = express.Router();

// Middleware to protect routes that require authentication
const requireAuth = async (req, res, next) => {
  const userId = req.header('userId');
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required: missing userId header' });
  }

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    req.user = user; // attach the user to the request
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.status(200).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully (client-side only)' });
});

// GET /api/auth/me — Get user info from userId in header
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = { router, requireAuth };
