const sql = require("mssql");
const express = require('express');
const searchController = require('../controllers/searchController');
const router = express.Router();
const { authenticateToken} = require('../middleware/auth');

router.get('/search', authenticateToken, searchController.search);


module.exports = router;

