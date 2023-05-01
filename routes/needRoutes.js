const express = require('express');
const mime = require('mime');
const needController = require('../controllers/needController');
const model =  require('../models/needModel')
const upload = require('../middleware/fileUpload');
const { authenticateToken} = require('../middleware/auth');
const router = express.Router();

router.post('/needs', authenticateToken, upload.single('FileData'), needController.createNeed);
router.get('/needs/:id', authenticateToken,  needController.getNeed);
router.get('/download/:id',authenticateToken, needController.downloadFile);
router.get('/allneeds', authenticateToken, needController.allNeeds);

module.exports = router;
