const express = require('express');
const mime = require('mime');
const needController = require('../controllers/needController');
const model =  require('../models/needModel')
const upload = require('../middleware/fileUpload');

const router = express.Router();

router.post('/needs', upload.single('FileData'), needController.createNeed);
router.get('/needs/:id', needController.getNeed);
router.get('/download/:id', needController.downloadFile);

module.exports = router;
