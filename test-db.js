require('dotenv').config();
const connectDB = require('./server/config/db');

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set');
connectDB()
  .then(() => {
    console.log('Connection test successful! Database is accessible.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Connection test failed:', error);
    process.exit(1);
  });
