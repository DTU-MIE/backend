const express = require('express');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.post('/need/:needID/comment', commentController.addComment);
router.get('/needs/:needID/comments', commentController.getCommentsByNeedId);

module.exports = router;
