const request = require('supertest');
const express = require('express');
const router = require('../routes/userRoutes');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secretOrPrivateKey) => 'mocked-token'),
}));

jest.mock('../models/userModel', () => {
  const originalUserController = jest.requireActual('../models/userModel');
  return {
    ...originalUserController,
    createUser: jest.fn(async (userDetails) => {
      //Mock the createUser function 
      const { email } = userDetails;
      if (email === 'newuser@dtu.dk') {
        throw new Error('Email already registered');
      }
      return 1; 
    }),
  };
});

jest.mock('../config/config', () => ({
  SECRET_KEY: 'mocked-secret-key',
}));

describe('POST /register', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/', router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error if the email is already registered', async () => {
    const reqBody = {
      id: 123,
      name: 'new User',
      email: 'newuser@dtu.dk',
      password: 'password',
      organization: 'Test Org',
      department: 'Test Dept',
      profession: 'Sundhedsprofessionel',
    };

    const response = await request(app)
      .post('/api/v1/register')
      .send(reqBody);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Email already registered',
    });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('should register a user and return a token with status 201', async () => {
    const reqBody = {
      id: 123,
      name: 'new User',
      email: 'newuser2@dtu.dk',
      password: 'password',
      organization: 'Test Org',
      department: 'Test Dept',
      profession: 'Sundhedsprofessionel',
    };

    const response = await request(app)
      .post('/api/v1/register')
      .send(reqBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      userId: 1,
      message: 'Registration was successful',
      token: 'mocked-token',
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'newuser2@dtu.dk',
        role: 'Admin',
      }),
      'mocked-secret-key'
    );
  });
});
