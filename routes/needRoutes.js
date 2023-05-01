const express = require('express');
const mime = require('mime');
const needController = require('../controllers/needController');
const model =  require('../models/needModel')
const upload = require('../middleware/fileUpload');
//const { authenticateToken} = require('../middleware/auth');
const router = express.Router();

router.post('/needs', upload.single('FileData'), needController.createNeed);
router.get('/needs/:id', needController.getNeed);
router.get('/download/:id', needController.downloadFile);
router.get('/allneeds',  needController.allNeeds);

module.exports = router;
