const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_career_assistant';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // fast fail if local mongod not running
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[Database] Warning: Could not connect to MongoDB at ${uri}. (${error.message})`);
    console.warn('[Database] Running in Fallback Mode: Database operations will be handled gracefully.');
    isConnected = false;
    return false;
  }
};

const getDBStatus = () => ({
  isConnected: isConnected || mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState
});

module.exports = { connectDB, getDBStatus };
