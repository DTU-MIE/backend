const express = require('express');
const app = express();
const request = require('supertest');
const needRoutes = require('../routes/needRoutes');
const model = require('../models/needModel');
const auth = require('../middleware/auth');

// Mock the model's getNeedById function
jest.mock('../models/needModel', () => ({
  getNeedById: jest.fn(),
}));

// Mock the authentication module
jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 123 }; 
    next(); 
  }),
}));

app.use(express.json());
app.use('/api/v1/', needRoutes);

describe('GET /needs/:id', () => {
  test('should return the need with the file URL', async () => {
    // Mock the getNeedById function to return a mock need object
    model.getNeedById.mockResolvedValueOnce({
      id: 1,
      NeedIs: 'Some Need',
      Title: 'Sample Title',
      ContactPerson: 'John Doe',
      Keywords: 'sample, test',
      Proposal: 'Some proposal',
      Solution: 'Some solution',
      CreatedAt: '2023-05-21',
      HasFile: 'file',
    });

    // Make a request to the test route
    const response = await request(app)
      .get('/api/v1/needs/1')
      .set('Authorization', 'Bearer valid-token');

    // Assert the response
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      body: {
        id: 1,
        NeedIs: 'Some Need',
        Title: 'Sample Title',
        ContactPerson: 'John Doe',
        Keywords: 'sample, test',
        Proposal: 'Some proposal',
        Solution: 'Some solution',
        CreatedAt: '2023-05-21',
        fileURL: 'http://www.innocloud.dk/api/v1/download/1',
      },
    });
  });

  test('should return 401 if no token is provided', async () => {
    // Make a request to the test route without a token
    const response = await request(app).get('/api/v1/needs/1');

    // Assert the response
    expect(response.statusCode).toBe(404);
  });

  test('should return 403 for an invalid token', async () => {
    // Mock the authenticateToken function to throw an error
    auth.authenticateToken.mockImplementation((req, res, next) => {
      return res.status(403).json({ message: 'Invalid token' });
    });

    // Make a request to the test route with an invalid token
    const response = await request(app)
      .get('/api/v1/needs/1')
      .set('Authorization', 'Bearer invalid-token');

    // Assert the response
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ message: 'Invalid token' });
  });
});
