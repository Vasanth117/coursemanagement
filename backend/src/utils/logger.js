const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
  exitOnError: false
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Custom logging methods
class Logger {
  static info(message, meta = {}) {
    logger.info(message, meta);
  }

  static error(message, error = null, meta = {}) {
    if (error) {
      logger.error(message, { 
        error: error.message, 
        stack: error.stack, 
        ...meta 
      });
    } else {
      logger.error(message, meta);
    }
  }

  static warn(message, meta = {}) {
    logger.warn(message, meta);
  }

  static debug(message, meta = {}) {
    logger.debug(message, meta);
  }

  static http(message, meta = {}) {
    logger.http(message, meta);
  }

  // Log database operations
  static database(operation, collection, query = {}, meta = {}) {
    logger.info(`Database ${operation}`, {
      collection,
      query,
      ...meta
    });
  }

  // Log authentication events
  static auth(event, userId, meta = {}) {
    logger.info(`Auth: ${event}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  // Log API requests
  static api(method, url, statusCode, responseTime, userId = null) {
    logger.http(`${method} ${url}`, {
      statusCode,
      responseTime: `${responseTime}ms`,
      userId
    });
  }

  // Log file operations
  static file(operation, filename, size = null, meta = {}) {
    logger.info(`File ${operation}`, {
      filename,
      size: size ? `${size} bytes` : null,
      ...meta
    });
  }

  // Log email operations
  static email(operation, recipient, subject = null, meta = {}) {
    logger.info(`Email ${operation}`, {
      recipient,
      subject,
      ...meta
    });
  }

  // Log security events
  static security(event, details, meta = {}) {
    logger.warn(`Security: ${event}`, {
      details,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  // Log performance metrics
  static performance(operation, duration, meta = {}) {
    logger.info(`Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...meta
    });
  }

  // Log system events
  static system(event, details = null, meta = {}) {
    logger.info(`System: ${event}`, {
      details,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  // Log validation errors
  static validation(field, value, error, meta = {}) {
    logger.warn(`Validation error: ${field}`, {
      value,
      error,
      ...meta
    });
  }

  // Log business logic events
  static business(event, details, meta = {}) {
    logger.info(`Business: ${event}`, {
      details,
      ...meta
    });
  }

  // Get logger instance for advanced usage
  static getInstance() {
    return logger;
  }

  // Create child logger with default metadata
  static child(defaultMeta) {
    return logger.child(defaultMeta);
  }
}

module.exports = Logger;