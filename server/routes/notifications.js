const express = require('express');
const { requireAuth } = require('./auth');
const User = require('../models/User');

const router = express.Router();

router.use(requireAuth);

// POST /api/notifications/email
router.post('/email', async (req, res) => {
  try {
    const { taskId, taskTitle, dueDate } = req.body;

    // User is already attached by requireAuth
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Simulate sending email — replace this with real email logic
    console.log(`📧 Email notification sent to ${user.email}:`);
    console.log(`   Task: ${taskTitle}`);
    console.log(`   Due Date: ${dueDate}`);
    console.log(`   Message: Task due soon! Finish it fast!`);

    // TODO: Implement actual email sending here
    // Example:
    /*
    await sendEmail({
      to: user.email,
      subject: 'Task Due Soon!',
      text: `${taskTitle} is due in less than 6 hours. Finish it fast!`,
      html: `<h2>Task Due Soon!</h2><p><strong>${taskTitle}</strong> is due in less than 6 hours. Finish it fast!</p>`
    });
    */

    res.json({ message: 'Email notification sent successfully' });
  } catch (error) {
    console.error('Email notification error:', error);
    res.status(500).json({ error: 'Failed to send email notification' });
  }
});

module.exports = router;
