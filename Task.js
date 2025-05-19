const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  dueDate: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  reminder: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'overdue'],
    default: 'active'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedDate: {
    type: String
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Task', taskSchema);
