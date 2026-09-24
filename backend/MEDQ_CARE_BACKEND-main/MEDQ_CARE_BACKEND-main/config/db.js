const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medq_care';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [MongoDB Warning]: Could not connect to MongoDB at ${uri}. Reason: ${error.message}`);
    console.warn(`ℹ️ [Database Status]: Operating in graceful fallback mode for rapid development/testing.`);
    isConnected = false;
    return false;
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState,
  host: isConnected ? mongoose.connection.host : 'fallback-memory',
});

module.exports = {
  connectDB,
  getDBStatus,
};
