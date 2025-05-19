const Subject = require('../models/Subject');
const Task = require('../models/Task');
const TimeTable = require('../models/TimeTable');

// Subject Controllers
exports.createSubject = async (req, res) => {
  try {
    const subject = new Subject({
      ...req.body,
      userId: req.user.id
    });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user.id });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Task Controllers
exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      userId: req.user.id
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(400).json({ message: error.message });
  }
};

// TimeTable Controllers
exports.updateTimeTable = async (req, res) => {
  try {
    let timeTable = await TimeTable.findOne({ userId: req.user.id });
    if (!timeTable) {
      timeTable = new TimeTable({
        userId: req.user.id,
        schedule: req.body.schedule
      });
    } else {
      timeTable.schedule = req.body.schedule;
    }
    await timeTable.save();
    res.json(timeTable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTimeTable = async (req, res) => {
  try {
    const timeTable = await TimeTable.findOne({ userId: req.user.id })
      .populate('schedule.Monday.subject')
      .populate('schedule.Tuesday.subject')
      .populate('schedule.Wednesday.subject')
      .populate('schedule.Thursday.subject')
      .populate('schedule.Friday.subject');
    
    if (!timeTable) {
      return res.json({
        schedule: {
          Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
        }
      });
    }
    res.json(timeTable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
