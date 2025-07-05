const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  importance: { 
    type: Number, 
    default: 5,
    min: 1,
    max: 10
  },
  dueDate: { 
    type: Date, 
    default: null
  },
  completedAt: { 
    type: Date, 
    default: null 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  group: { 
    type: String, 
    default: '' 
  },
}, { timestamps: true });

// Update completedAt when completed status changes
taskSchema.pre('save', function (next) {
  if (this.isModified('completed')) {
    if (this.completed) {
      this.completedAt = new Date();
    } else {
      this.completedAt = null;
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
