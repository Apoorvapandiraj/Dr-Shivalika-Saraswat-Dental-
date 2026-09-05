const router = require('express').Router();
const mongoose = require('mongoose');

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
