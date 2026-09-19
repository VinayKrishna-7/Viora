const express = require('express');
const {
  createReport,
  getReports,
  updateReportStatus,
} = require('../controllers/reportController');
const { verifyJWT, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

// Authenticated users can submit reports
router.post('/', createReport);

// Admin-only review endpoints
router.get('/', requireAdmin, getReports);
router.patch('/:id/status', requireAdmin, updateReportStatus);

module.exports = router;
