const request = require('supertest');
const express = require('express');
const router = require('../routes/userRoutes');
const app = express();

jest.mock('../middleware/auth', () => ({
    authenticateToken: jest.fn((req, res, next) => {
      req.user = { userId: 123 };
      next();
    }),
  }));

app.use('/api/v1/', router);

describe('GET ', () => {
  it('return user profile', async () => {
    const response = await request(app).get('/api/v1/profile');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ userId: 123 });
  });
});
