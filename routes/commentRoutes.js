const express = require('express');
const commentController = require('../controllers/commentController');
const { authenticateToken} = require('../middleware/auth');
const router = express.Router();


router.get('/needs/:needID/comments', commentController.getCommentsByNeedId);
router.post('/need/:needID/comment', commentController.addComment);

module.exports = router;
