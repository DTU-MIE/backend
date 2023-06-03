const express = require('express');
const needController = require('../controllers/needController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.delete('/delete/:id', authenticateToken, needController.deleted);

module.exports = router;
