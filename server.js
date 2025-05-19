const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const os = require('os');

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: '*',  // In production, replace with specific origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/users', userRoutes);  // Mount userRoutes at /api/users path
app.use('/api', notificationRoutes);  // Mount notificationRoutes at /api path

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

// Start server after connecting to database
const startServer = async () => {
    try {
        await connectDB(); // Wait for database connection
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
            console.log(`For local access use: http://localhost:${PORT}`);
            
            // Get network interface addresses
            const networkInterfaces = os.networkInterfaces();
            Object.keys(networkInterfaces).forEach((interfaceName) => {
                const addresses = networkInterfaces[interfaceName];
                addresses.forEach((addr) => {
                    if (addr.family === 'IPv4' && !addr.internal) {
                        console.log(`For network access use your IP address: http://${addr.address}:${PORT}`);
                    }
                });
            });
        });

        // Handle server shutdown
        process.on('SIGTERM', () => {
            console.log('Received SIGTERM. Performing graceful shutdown...');
            server.close(() => {
                console.log('Server closed. Exiting process.');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
