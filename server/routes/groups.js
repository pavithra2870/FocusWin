// routes/groups.js
const express = require('express');
const Group = require('../models/Group');
const Task = require('../models/Task');
const { requireAuth } = require('./auth');

const router = express.Router();

// Attach requireAuth to all routes in this router
router.use(requireAuth);

// GET /api/groups — get all groups for the user
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({ userId: req.user._id }).sort('name');
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// POST /api/groups — create a new group
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  try {
    const newGroup = new Group({ name, userId: req.user._id });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You already have a group with this name.' });
    }
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// DELETE /api/groups/:id — delete a group & unassign it from tasks
router.delete('/:id', async (req, res) => {
  try {
    // Delete the group
    const group = await Group.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    // Unset the group on all associated tasks
    await Task.updateMany(
      { userId: req.user._id, group: req.params.id },
      { $unset: { group: "" } }
    );

    res.json({ message: 'Group deleted and tasks unassigned.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

module.exports = router;
