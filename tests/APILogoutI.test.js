const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/userRoutes');
const sql = require('mssql'); 
jest.mock('mssql');

jest.mock('../models/userModel', () => {
  return {
    Blacklist: jest.fn(),
  };
});

jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 123 };
    next();
  }),
}));

app.use(express.json());
app.use('/api/v1/', router);

describe('POST /logout', () => {
  test('blacklist the token and return a success message', async () => {
    const { Blacklist } = require('../models/userModel');

    Blacklist.mockResolvedValue(); 

    const token = 'some-token';
    const response = await request(app)
      .post('/api/v1/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(Blacklist).toHaveBeenCalledWith(token);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'user is logged out' });
  });

  test('return a 500 status', async () => {
    const { Blacklist } = require('../models/userModel');

    const error = new Error('Some error');
    Blacklist.mockRejectedValue(error); 

    const token = 'some-token';
    const response = await request(app)
      .post('/api/v1/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(Blacklist).toHaveBeenCalledWith(token);
    expect(response.status).toBe(500);
  });
});
