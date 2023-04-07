const express = require('express');
const needController = require('../controllers/needController');
const upload = require('../middleware/fileUpload');

const router = express.Router();

router.post('/needs', upload.single('FileData'), needController.createNeed);
router.get('/needs/:id', needController.getNeed);

module.exports = router;
