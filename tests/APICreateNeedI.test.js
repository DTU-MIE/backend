const request = require('supertest');
const express = require('express');
const router = require('../routes/needRoutes');
const model = require('../models/needModel');
const auth = require('../middleware/auth');

jest.mock('mssql');
jest.mock('../config/config', () => ({
    AUTH_KEY: 'test-auth-key',
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

  test('create a new need and return the ID when authenticated with token', async () => {
    const insertNeedMock = jest.fn().mockResolvedValueOnce(1);
    model.insertNeed = insertNeedMock;


    const token = auth.generateToken({ userId: 123 });
    const requestBody = {
      NeedIs: 'Test Need',
      Title: 'Test Title',
      ContactPerson: 'Test Person',
      Keywords: 'Test Keywords',
      Proposal: 'Test Proposal',
      Solution: 'Test Solution',
    };

    const response = await request(app)
      .post('/api/v1/needs')
      .send(requestBody)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1 });
    expect(model.insertNeed).toHaveBeenCalledTimes(1);
    expect(model.insertNeed).toHaveBeenCalledWith(expect.objectContaining(requestBody));
  });

  test('return a 403 status when authenticated with invalid token', async () => {
    const requestBody = {
      NeedIs: 'Test Need',
      Title: 'Test Title',
      ContactPerson: 'Test Person',
      Keywords: 'Test Keywords',
      Proposal: 'Test Proposal',
      Solution: 'Test Solution',
    };


    const response = await request(app)
      .post('/api/v1/needs')
      .send(requestBody)
      .set('Authorization', 'Bearer invalidtoken');


    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Invalid token' });
    expect(model.insertNeed).toHaveBeenCalledTimes(0);
  });

  test('return a 401 status when not authenticated', async () => {
    const requestBody = {
      NeedIs: 'Test Need',
      Title: 'Test Title',
      ContactPerson: 'Test Person',
      Keywords: 'Test Keywords',
      Proposal: 'Test Proposal',
      Solution: 'Test Solution',
    };

    const response = await request(app)
      .post('/api/v1/needs')
      .send(requestBody);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'No token provided' });
    expect(model.insertNeed).toHaveBeenCalledTimes(0);
  });
});