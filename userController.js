const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'defaultsecret', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/users/signup
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id)
                }
            });
        } else {
            throw new Error('Failed to create user');
        }
    } catch (error) {
        console.error('Registration error:', error);
        let message = 'Failed to create account';
        let statusCode = 400;
        
        if (error.name === 'ValidationError') {
            message = Object.values(error.errors)
                .map(err => err.message)
                .join(', ');
        } else if (error.code === 11000) {
            message = 'Email is already registered';
        } else if (error.message === 'Failed to create user') {
            statusCode = 500;
            message = 'Internal server error';
        }
        
        res.status(statusCode).json({
            success: false,
            message
        });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token and send response
        const token = generateToken(user._id);
        
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        let message = 'Failed to login';
        let statusCode = 400;

        if (error.name === 'ValidationError') {
            message = Object.values(error.errors)
                .map(err => err.message)
                .join(', ');
        } else if (error.message === 'Password comparison failed') {
            statusCode = 401;
            message = 'Invalid email or password';
        } else {
            statusCode = 500;
            message = 'Internal server error';
        }

        res.status(statusCode).json({
            success: false,
            message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
