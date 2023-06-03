const { getCommentsByNeedId } = require('../controllers/commentController'); 
const { getCommentsForNeed } = require('../models/commentModel'); 

jest.mock('../models/commentModel', () => ({
  getCommentsForNeed: jest.fn()
}));

describe('getCommentsByNeedId', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        needID: '123'
      }
    };
    res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis() 
      };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetch comments for a given needID and send response', async () => {
    const mockComments = ['Comment 1', 'comment 2'];
    getCommentsForNeed.mockResolvedValueOnce(mockComments);

    await getCommentsByNeedId(req, res);

    expect(getCommentsForNeed).toHaveBeenCalledWith('123');
    expect(res.json).toHaveBeenCalledWith(mockComments);
  });

  test('error response', async () => {
    const mockError = new Error('Failed to fetch comments');
    getCommentsForNeed.mockRejectedValueOnce(mockError);

    await getCommentsByNeedId(req, res);

    expect(getCommentsForNeed).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch comments' });
  });
});
