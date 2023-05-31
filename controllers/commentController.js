const commentModel = require('../models/commentModel');
const { insertComment, getCommentsForNeed } = require('../models/commentModel')


const addComment = async (req, res) => {
    const { needID } = req.params
    const { comment, kind } = req.body
  
    try {
      await insertComment(needID, comment, kind);
      res.send('Comment added successfully!');
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error');
    }
};

const getCommentsByNeedId = async (req, res) => {
    const { needID } = req.params;
  
    const comments = await getCommentsForNeed(needID);
  
    res.json(comments);
}

module.exports = {
    addComment,
    getCommentsByNeedId,
};
