const request = require('supertest');
const express = require('express');
const router = require('../routes/needRoutes');
const model = require('../models/needModel');
const auth = require('../middleware/auth');

jest.mock('mssql');

// Mock the config module
jest.mock('../config/config', () => ({
    AUTH_KEY: 'test-auth-key', // Mocked value for AUTH_KEY
  }));

describe('POST /needs', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/v1/', router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new need and return the ID when authenticated with valid token', async () => {
    // Mock the insertNeed function
    const insertNeedMock = jest.fn().mockResolvedValueOnce(1);
    model.insertNeed = insertNeedMock;

    // Generate a valid token
    const token = auth.generateToken({ userId: 123 });

    // Mock the request body and headers
    const requestBody = {
      NeedIs: 'Test Need',
      Title: 'Test Title',
      ContactPerson: 'Test Person',
      Keywords: 'Test Keywords',
      Proposal: 'Test Proposal',
      Solution: 'Test Solution',
    };

    // Send a POST request with the valid token and request body
    const response = await request(app)
      .post('/api/v1/needs')
      .send(requestBody)
      .set('Authorization', `Bearer ${token}`);

    // Verify the expectations
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1 });
    expect(model.insertNeed).toHaveBeenCalledTimes(1);
    expect(model.insertNeed).toHaveBeenCalledWith(expect.objectContaining(requestBody));
  });

  test('should return a 403 status when authenticated with invalid token', async () => {
    // Mock the request body
    const requestBody = {
      NeedIs: 'Test Need',
      Title: 'Test Title',
      ContactPerson: 'Test Person',
      Keywords: 'Test Keywords',
      Proposal: 'Test Proposal',
      Solution: 'Test Solution',
    };

    // Send a POST request with an invalid token
    const response = await request(app)
      .post('/api/v1/needs')
      .send(requestBody)
      .set('Authorization', 'Bearer invalidtoken');

    // Verify the expectations
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Invalid token' });
    expect(model.insertNeed).toHaveBeenCalledTimes(0);
  });

  test('should return a 401 status when not authenticated', async () => {
    // Mock the request body
    const requestBody = {
      NeedIs: 'Test Need',
      Title: 'Test Title',
      ContactPerson: 'Test Person',
      Keywords: 'Test Keywords',
      Proposal: 'Test Proposal',
      Solution: 'Test Solution',
    };

    // Send a POST request without a token
    const response = await request(app)
      .post('/api/v1/needs')
      .send(requestBody);

    // Verify the expectations
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'No token provided' });
    expect(model.insertNeed).toHaveBeenCalledTimes(0);
  });
});
