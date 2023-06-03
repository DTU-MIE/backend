const express = require('express');
const router = express.Router();
const { authenticateToken,
  authorize} = require('../middleware/auth');

//only Sundhedsprofessionel can acccess this endpoint
router.get('/privilages', authenticateToken, authorize, (req, res) => {
    res.status(200).json({ message: 'Route accessed' })
  });

module.exports = router;
