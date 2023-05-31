const request = require('supertest');
const express = require('express');
const router = require('../routes/authorizedRoutes');

jest.mock('../middleware/auth', () => ({
  authorize: jest.fn((req, res, next) => {
    const decodedToken = req.user; 
    if (decodedToken.profession !== 'Sundhedsprofessionel') {
      return res.status(403).send({ message: 'Access denied. Only Sundhedsprofessionel are allowed.' });
    }
    next();
  }),
  authenticateToken: jest.fn((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).send({ message: 'No token provided' });
    }
    req.user = { profession: 'Sundhedsprofessionel' };
    next();
  }),
  verifyToken: jest.fn(), 
}));

describe('Authorization Test', () => {
  let app;

  beforeEach(() => {

    app = express();
    app.use(express.json());
    app.use('/api/v1/', router);
  });

  it('if authorized return 200 and success message', async () => {

    const response = await request(app)
      .get('/api/v1/privilages')
      .set('Authorization', 'Bearer your_token_here');



    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ message: 'Testing authorized access' });
  });

  it('if no token provided return 401', async () => {
    const response = await request(app)
     .get('/api/v1/privilages')

    expect(response.status).toEqual(401);
    expect(response.body).toEqual({ message: 'No token provided' });
  });
});
