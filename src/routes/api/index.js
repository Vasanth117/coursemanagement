const express = require('express');
const v1Routes = require('./v1');

const router = express.Router();

// Mount API versions
router.use('/v1', v1Routes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Course Management System API',
    version: '1.0.0',
    endpoints: {
      v1: '/api/v1'
    }
  });
});

module.exports = router;