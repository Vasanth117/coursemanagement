const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import utilities and middleware
const { Logger } = require('./utils');
const { errorHandler } = require('./middleware');
const { rateLimiter } = require('./middleware');

// Import routes
const routes = require('./routes');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://localhost:3002'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
app.use(rateLimiter.generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// HTTP request logging
app.use(morgan('combined', { stream: Logger.stream }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;