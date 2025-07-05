// models/Group.js
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, { timestamps: true });

// Ensure a user cannot have two groups with the same name
groupSchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Group', groupSchema);
