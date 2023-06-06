const request = require('supertest');
const express = require('express');
const router = require('../routes/commentRoutes');
const { insertComment } = require('../models/commentModel');

jest.mock('../models/commentModel', () => ({
  insertComment: jest.fn(),
}));

jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 123 }; 
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/', router);

describe('Integration Test', () => {
  test('POST should add a comment', async () => {
    const mockNeedID = 123;
    const mockComment = 'This is a test comment';
    const mockKind = 'Comment';

    insertComment.mockImplementation(() => {
      console.log('Mock insertComment function called');
    });
    const token = 'yourAuthTokenHere';
    const response = await request(app)
      .post(`/api/v1/need/${mockNeedID}/comment`)
      .send({ comment: mockComment, kind: mockKind })
      .set('Authorization', `Bearer ${token}`);


    expect(response.status).toBe(200);
    expect(response.text).toBe('Comment added successfully!');
    expect(insertComment).toHaveBeenCalledWith(
      expect.anything(), 
      mockComment,
      mockKind
    );
  });
});
