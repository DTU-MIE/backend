const express = require('express');
const needController = require('../controllers/needController');
const { authenticateToken} = require('../middleware/auth');
const upload = require('../middleware/fileUpload');
const router = express.Router();


router.post('/needs', authenticateToken, upload.single('FileData'), needController.createNeed);
router.get('/allneeds', authenticateToken, needController.allNeeds);
router.get('/needs/:id', authenticateToken, needController.getNeed);
router.get('/download/:id', authenticateToken, needController.downloadFile);
router.put('/update/needs/:id', authenticateToken, upload.single('FileData'), needController.updated);
router.delete('/delete/:id', authenticateToken, needController.deleted);
router.get("/tags", authenticateToken, needController.getTags)
router.get("/needs/relatedNeeds/:id", authenticateToken, needController.getRelatedNeeds)

module.exports = router;
