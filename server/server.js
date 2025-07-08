// server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

const User = require('./models/User');
const Task = require('./models/Task');
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
  console.log(`🚀 Server started on port ${PORT}`);
});
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// ROUTES
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/notifications', notificationsRouter);

// AUTH CHECK MIDDLEWARE
const requireAuth = async (req, res, next) => {
  const { userId } = req.headers;

  if (!userId) {
    return res.status(401).json({ error: 'No userId provided' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user' });
  }

  req.user = user;
  next();
};
