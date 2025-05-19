const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  }
});

const timeTableSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  schedule: {
    Monday: [classSchema],
    Tuesday: [classSchema],
    Wednesday: [classSchema],
    Thursday: [classSchema],
    Friday: [classSchema]
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

timeTableSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TimeTable', timeTableSchema);
