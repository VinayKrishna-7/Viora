const express = require('express');
const {
  getHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
} = require('../controllers/historyController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.route('/')
  .get(getHistory)
  .delete(clearHistory);

router.route('/:videoId')
  .post(addToHistory)
  .delete(removeFromHistory);

module.exports = router;
