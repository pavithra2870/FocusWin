// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const User = require('./models/User');
const { router: authRouter } = require('./routes/auth');
const tasksRouter = require('./routes/tasks');
const groupsRouter = require('./routes/groups');
const notificationsRouter = require('./routes/notifications');

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// MIDDLEWARES
app.use(express.json());

app.use(cors({
  origin: 'https://focuswin-frontend.onrender.com',
  credentials: true
}));

// MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

// ROUTES
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/notifications', notificationsRouter);

// GLOBAL requireAuth (optional if not already imported in routes)
const requireAuth = async (req, res, next) => {
  const userId = req.header('userId');
  if (!userId) {
    return res.status(401).json({ error: 'No userId provided' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

module.exports = app;
