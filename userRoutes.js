const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// Debug middleware for user routes
router.use((req, res, next) => {
    console.log('User route accessed:', {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body
    });
    next();
});

// User routes
router.post('/signup', registerUser);
router.post('/login', loginUser);

module.exports = router;
