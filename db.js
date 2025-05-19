const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    let retries = 5;
    const retryDelay = 5000; // 5 seconds

    while (retries > 0) {
        try {
            const uri = process.env.MONGODB_URI;
            if (!uri) {
                throw new Error('MONGODB_URI environment variable is not defined');
            }

            console.log('Attempting to connect to MongoDB...');
            
            const conn = await mongoose.connect(uri, {
                dbName: 'FinslEducSync',
                serverSelectionTimeoutMS: 30000,
                connectTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                maxPoolSize: 50,
                minPoolSize: 10,
                maxIdleTimeMS: 10000,
                waitQueueTimeoutMS: 15000
            });

            console.log('MongoDB Connected Successfully! 🎉');
            console.log(`MongoDB Host: ${conn.connection.host}`);
            console.log(`Database Name: ${conn.connection.name}`);

            // Set up connection event handlers
            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
                // Implement proper error handling in your application
                if (process.env.NODE_ENV === 'production') {
                    // In production, you might want to notify your error tracking service
                    // or implement a retry mechanism
                }
            });

            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected. Attempting to reconnect...');
                // Implement reconnection logic if needed
            });

            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB reconnected successfully!');
            });

            return conn;
        } catch (error) {
            console.error(`MongoDB connection attempt failed (${retries} retries left):`, error);
            retries--;

            if (retries === 0) {
                console.error('All connection attempts failed. Unable to connect to MongoDB.');
                throw new Error('Failed to connect to MongoDB after multiple attempts');
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};

module.exports = connectDB;
