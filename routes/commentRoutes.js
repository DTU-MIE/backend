const express = require('express');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.post('/need/:id/comment', commentController.addComment);
router.get('/needs/:id/comments', commentController.getCommentsByNeedId);

module.exports = router;
