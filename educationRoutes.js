const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');
const auth = require('../middleware/auth');

// Subject routes
router.post('/subjects', auth, educationController.createSubject);
router.get('/subjects', auth, educationController.getSubjects);

// Task routes
router.post('/tasks', auth, educationController.createTask);
router.get('/tasks', auth, educationController.getTasks);
router.patch('/tasks/:id', auth, educationController.updateTask);
router.delete('/tasks/:id', auth, educationController.deleteTask);

// TimeTable routes
router.put('/timetable', auth, educationController.updateTimeTable);
router.get('/timetable', auth, educationController.getTimeTable);

module.exports = router;
