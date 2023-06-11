const { addComment } = require('../controllers/commentController');
const { insertComment } = require('../models/commentModel');

jest.mock('../models/commentModel', () => ({
    insertComment: jest.fn(),
  }));
  
  const mockReq = (params, body) => ({
    params,
    body,
  });
  
  const mockRes = () => {
    const res = {};
    res.send = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

describe('addComment', () => {
    it('add a comment successfully', async () => {
      const needID = '123';
      const comment = 'This is a test comment';
      const kind = 'Comment';
      const req = mockReq({ needID }, { comment, kind });
      const res = mockRes();
  
      await addComment(req, res);
  
      expect(insertComment).toHaveBeenCalledWith(needID, comment, kind);
      expect(res.send).toHaveBeenCalledWith('Comment added successfully!');
      expect(res.status).not.toHaveBeenCalled();
    });
    it('internal server error response', async () => {
        const needID = '123';
        const comment = 'This is a test comment';
        const kind = 'Comment';
        const req = mockReq({ needID}, {comment, kind });
        const res = mockRes();
        const errorMessage = 'Test error message';
    
        insertComment.mockRejectedValueOnce(new Error(errorMessage));
    

        try {
            await addComment(req, res);
            expect(insertComment).toHaveBeenCalledWith(needID, comment, kind);
            expect(res.send).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.status().send).toHaveBeenCalledWith('Internal server error');
            expect(console.log).toHaveBeenCalledWith(new Error(errorMessage));
        } catch (error) {
        }
      });
               
});
  
  