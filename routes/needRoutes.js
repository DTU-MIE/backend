const express = require('express');
const needController = require('../controllers/needController');
const { authenticateToken} = require('../middleware/auth');
const upload = require('../middleware/fileUpload');
const router = express.Router();


router.post('/needs', authenticateToken, upload.single('FileData'), needController.createNeed);
router.get('/allneeds', needController.allNeeds);
router.get('/needs/:id', needController.getNeed);
router.get('/download/:id',  needController.downloadFile);
router.put('/update/needs/:id', authenticateToken, upload.single('FileData'), needController.updated);
router.delete('/delete/:id', authenticateToken, needController.deleted);



module.exports = router;
