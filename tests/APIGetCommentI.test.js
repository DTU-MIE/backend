const request = require('supertest');
const express = require('express');
const router = require('../routes/commentRoutes');
const model = require('../models/commentModel');


jest.mock('../models/commentModel', () => ({
  getCommentsForNeed: jest.fn(),
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

describe('GET comments', () => {
  it('return comments for the specific needID', async () => {

    const comments = [{ id: 1, text: 'Comment 1' }];
    model.getCommentsForNeed.mockResolvedValueOnce(comments);

    const response = await request(app)
    .get('/api/v1/needs/1/comments')
    .set('Authorization', 'Bearer valid-token');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(comments);
  });

});
