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

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// SESSION SETUP
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(5000, () => {
      console.log('🚀 Server started on port 5000');
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
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
