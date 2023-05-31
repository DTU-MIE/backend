const express = require('express');
const app = express();
const request = require('supertest');
const needRoutes = require('../routes/needRoutes');
const model = require('../models/needModel');
const auth = require('../middleware/auth');

jest.mock('../models/needModel', () => ({
  getNeedById: jest.fn(),
}));
jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 123 }; 
    next(); 
  }),
}));

app.use(express.json());
app.use('/api/v1/', needRoutes);

describe('GET /needs/:id', () => {
  test('return need with the file URL', async () => {
    model.getNeedById.mockResolvedValueOnce({
      id: 1,
      NeedIs: 'Some Need',
      Title: 'Sample Title',
      ContactPerson: 'arooj',
      Keywords: 'sample, test',
      Proposal: 'Some proposal',
      Solution: 'Some solution',
      CreatedAt: '2023-05-21',
      HasFile: 'file',
    });

    const response = await request(app)
      .get('/api/v1/needs/1')
      .set('Authorization', 'Bearer valid-token');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      body: {
        id: 1,
        NeedIs: 'Some Need',
        Title: 'Sample Title',
        ContactPerson: 'arooj',
        Keywords: 'sample, test',
        Proposal: 'Some proposal',
        Solution: 'Some solution',
        CreatedAt: '2023-05-21',
        fileURL: 'http://www.innocloud.dk/api/v1/download/1',
      },
    });
  });

  test('return 401 if no token is provided', async () => {
    const response = await request(app).get('/api/v1/needs/1');
    expect(response.statusCode).toBe(404);
  });

  test('return 403 for an invalid token', async () => {
    auth.authenticateToken.mockImplementation((req, res, next) => {
      return res.status(403).json({ message: 'Invalid token' });
    });
    const response = await request(app)
      .get('/api/v1/needs/1')
      .set('Authorization', 'Bearer invalid-token');
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ message: 'Invalid token' });
  });
});
