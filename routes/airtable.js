const express = require('express');
const airtable = require('../controllers/airtableController');

const router = express.Router();


router.get('/transfer', airtable.intergrateNeed);


module.exports = router;
