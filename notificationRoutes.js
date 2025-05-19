const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Debug middleware for notification routes
router.use((req, res, next) => {
    console.log('Notification route accessed:', {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body
    });
    next();
});

// Get all notifications for the authenticated user
router.get('/notifications', auth, async (req, res) => {
    console.log('GET /notifications handler called');
    try {
        // TODO: Implement notification fetching from database
        // For now, return empty array
        res.json({
            success: true,
            notifications: []
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
});

// Create a new notification
router.post('/notifications', auth, async (req, res) => {
    console.log('POST /notifications handler called');
    try {
        const { message, type } = req.body;
        console.log('Notification data:', { message, type });
        
        // TODO: Implement notification creation in database
        // For now, return mock notification
        const notification = {
            _id: Date.now().toString(),
            message,
            type,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating notification'
        });
    }
});

module.exports = router; 