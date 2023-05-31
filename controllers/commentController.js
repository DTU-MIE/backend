const commentModel = require('../models/commentModel');
const { insertComment, getCommentsForNeed } = require('../models/commentModel')

const addComment = async (req, res) => {
  try {
    const { needID } = req.params;
    const { comment, kind } = req.body;
    await insertComment(needID, comment, kind);
    res.send('Comment added successfully!');
  } catch (error) {
    res.status(500).send('Internal server error');
    return;
  }
};


const getCommentsByNeedId = async (req, res) => {
  try {
    const { needID } = req.params;

    const comments = await getCommentsForNeed(needID);

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
    addComment,
    getCommentsByNeedId,
};
