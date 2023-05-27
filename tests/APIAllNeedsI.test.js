const request = require('supertest');
const express = require('express');
const model = require('../models/needModel');
const router = require('../routes/needRoutes');
const auth = require('../middleware/auth');

jest.mock('../models/needModel');
jest.mock('../middleware/auth');

// Mock SQL data
const mockNeeds = [
  { id: 1, NeedIs: 'Some Need', Title: 'Test Need', ContactPerson: 'John Doe', CreatedAt: '2023-01-01', Keywords: 'test, need', Proposal: 'Some proposal', Solution: 'Some solution', HasFile: 'file' },
  { id: 2, NeedIs: 'Another Need', Title: 'Another Test Need', ContactPerson: 'Jane Smith', CreatedAt: '2023-01-02', Keywords: 'another, test, need', Proposal: 'Another proposal', Solution: 'Another solution', HasFile: 'no file' },
];

jest.mock('../config/config', () => ({
  AUTH_KEY: 'test-auth-key', 
}));

// Mock the authentication module
jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 123 }; 
    next(); 
  }),
}));

describe('All Needs API Integration Test', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/', router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return all needs with file URLs if file exists', async () => {
    const mockToken = 'mock-valid-token';

    model.getAllNeeds.mockResolvedValueOnce(mockNeeds);

    const res = await request(app)
      .get('/api/v1/allneeds')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(auth.authenticateToken).toHaveBeenCalledTimes(1);
    expect(model.getAllNeeds).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      body: [
        {
          id: 1,
          NeedIs: 'Some Need',
          Title: 'Test Need',
          ContactPerson: 'John Doe',
          CreatedAt: '2023-01-01',
          Keywords: 'test, need',
          Proposal: 'Some proposal',
          Solution: 'Some solution',
          fileURL: expect.any(String),
        },
        {
          id: 2,
          NeedIs: 'Another Need',
          Title: 'Another Test Need',
          ContactPerson: 'Jane Smith',
          CreatedAt: '2023-01-02',
          Keywords: 'another, test, need',
          Proposal: 'Another proposal',
          Solution: 'Another solution',
          fileURL: 'no file',
        },
      ],
    });
  });

  test('should return a 500 status if an error occurs', async () => {
    const mockToken = 'mock-valid-token';

    const errorMessage = 'Internal Server Error';
    const mockError = new Error(errorMessage);
    model.getAllNeeds.mockRejectedValueOnce(mockError);

    const res = await request(app)
      .get('/api/v1/allneeds')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(auth.authenticateToken).toHaveBeenCalledTimes(1);
    expect(model.getAllNeeds).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Internal Server Error' });
  });
});
