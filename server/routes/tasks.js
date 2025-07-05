// routes/tasks.js
const express = require('express');
const Task = require('../models/Task');
const { requireAuth } = require('./auth'); // Use the auth middleware from auth.js

const router = express.Router();

// This applies the requireAuth middleware to all routes in this file
router.use(requireAuth);

// GET /api/tasks (Get all tasks for the user)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.session.userId })
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks (Create a new task)
router.post('/', async (req, res) => {
  try {
    const task = new Task({ ...req.body, userId: req.session.userId });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id (Update an existing task)
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      req.body,
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );
    
    if (!updatedTask) return res.status(404).json({ error: 'Task not found or you are not authorized to edit it.' });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id (Delete a task)
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
    if (!deletedTask) return res.status(404).json({ error: 'Task not found or you are not authorized to delete it.' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
