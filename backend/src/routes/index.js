const express = require('express');
const apiRoutes = require('./api');

const router = express.Router();

// Debug route
router.get('/debug', (req, res) => {
  res.json({ message: 'Debug route working', timestamp: new Date() });
});

// Mount API routes
router.use('/api', apiRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Course Management System API',
    documentation: '/api',
    health: '/health'
  });
});

module.exports = router;