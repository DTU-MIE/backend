const express = require('express');
const commentController = require('../controllers/commentController');
const { authenticateToken} = require('../middleware/auth');
const router = express.Router();


router.get('/needs/:needID/comments', authenticateToken, commentController.getCommentsByNeedId);
router.post('/need/:needID/comment', authenticateToken, commentController.addComment);

module.exports = router;
