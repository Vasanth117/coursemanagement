const mongoose = require('mongoose');
const { Logger } = require('../utils');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    Logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    Logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;