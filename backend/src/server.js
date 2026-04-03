// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = require('./app');
const { Logger } = require('./utils');
const WebSocketService = require('./services/WebSocketService');
const http = require('http');


// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Make WebSocket service available globally
app.set('wsService', wsService);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  Logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    Logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    Logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    
    server.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT} with WebSocket support`);
    });

    process.on('unhandledRejection', (err) => {
      Logger.error('Unhandled Promise Rejection:', err);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => {
      Logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        mongoose.connection.close();
        Logger.info('Process terminated');
      });
    });

  } catch (error) {
    Logger.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();