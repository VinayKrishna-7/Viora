const express = require('express');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Get API health, uptime, and database connection status
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const dbStatusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const readyState = mongoose.connection.readyState;
    const dbState = dbStatusMap[readyState] || 'unknown';

    const healthData = {
      service: 'Viora REST API',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: dbState
    };

    return res
      .status(200)
      .json(new ApiResponse(200, healthData, 'Viora API is operational'));
  })
);

module.exports = router;
