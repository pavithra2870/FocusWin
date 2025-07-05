// routes/groups.js
const express = require('express');
const Group = require('../models/Group');
const Task = require('../models/Task');
const { requireAuth } = require('./auth');

const router = express.Router();

router.use(requireAuth);

// GET /api/groups
router.get('/', async (req, res) => {
    try {
        const groups = await Group.find({ userId: req.session.userId }).sort('name');
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

// POST /api/groups
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name is required' });
    try {
        const newGroup = new Group({ name, userId: req.session.userId });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (err) {
        if (err.code === 11000) { // Handles duplicate name error from the model index
            return res.status(409).json({ error: 'You already have a group with this name.' });
        }
        res.status(500).json({ error: 'Failed to create group' });
    }
});

// DELETE /api/groups/:id
router.delete('/:id', async (req, res) => {
    try {
        // First, delete the group
        const group = await Group.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        // Next, find all tasks that belonged to this group and unset the group field
        await Task.updateMany(
            { userId: req.session.userId, group: req.params.id }, 
            { $unset: { group: "" } }
        );

        res.json({ message: 'Group deleted successfully and tasks have been unassigned.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete group' });
    }
});

module.exports = router;
