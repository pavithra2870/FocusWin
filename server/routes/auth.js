// routes/auth.js
const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Middleware to protect routes that require a logged-in user
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
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
    const user = new User({ name, email, password });
    await user.save();
    req.session.userId = user._id; // Log in the user immediately after signup
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  req.session.userId = user._id;

  console.log('✅ Session after login:', req.session); // 👈 add this

  res.status(200).json({ id: user._id, name: user.name, email: user.email });
});


// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed. Please try again.' });
    res.clearCookie('connect.sid'); // The default session cookie name
    res.status(200).json({ message: 'You have been logged out successfully' });
  });
});

// GET /api/auth/me (Allows frontend to check if a user is logged in)
router.get('/me', async (req, res) => {
  // 1. Check if the request has a valid session from the cookie.
  if (!req.session.userId) {
    // If not, they are not logged in. Send a "401 Unauthorized" error.
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // 2. If there IS a session, use the userId stored in it to find the user in the database.
    // We use .select('-password') to make sure we NEVER send the password to the frontend.
    const user = await User.findById(req.session.userId).select('-password');

    if (!user) {
      // This is a rare case where the session is valid but the user was deleted.
      return res.status(404).json({ error: 'User not found' });
    }

    // 3. Success! Send the user's data back to the frontend.
    res.status(200).json(user);
  } catch (err) {
    // Handle any potential server errors.
    res.status(500).json({ error: 'Server error while checking authentication' });
  }
});


module.exports = { router, requireAuth }; // Make sure your export is set up correctly
