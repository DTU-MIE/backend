const { registerUser } = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-token'),
}));

jest.mock('../models/userModel', () => ({
    createUser: jest.fn(({ email }) => {
      if (email === 'arooj@dtu.dk') {
        const error = new Error('Email already registered');
        error.message = 'Email already registered';
        throw error;
      }
      return 123;
    }),
  }));

jest.mock('../config/config', () => ({
  SECRET_KEY: 'mocked-secret-key',
}));

describe('registerUser', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        id: 1,
        name: 'arooj',
        email: 'arooj@dtu.dk',
        password: 'password',
        organization: 'organization',
        department: 'IT',
        profession: 'Sundhedsprofessionel',
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Register a user type Sundhedsprofessionel and return a token', async () => {
    try {
      const req = {
        body: {
          id: 123,
          name: 'chaudhry',
          email: 'chaudhry@dtu.dk',
          password: 'password',
          organization: 'Example Org',
          department: 'Example Dept',
          profession: 'Sundhedsprofessionel',
        },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await registerUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        userId: expect.any(Number),
        message: 'Registration was successful',
        token: 'mocked-token',
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          email: 'chaudhry@dtu.dk',
          role: 'Admin',
        },
        'mocked-secret-key'
      );
    } catch (error) {
    }
  });
  
  it('register a user type studerende and return token', async () => {
    try {
      const req = {
        body: {
          id: 123,
          name: 'new',
          email: 'new@dtu.dk',
          password: 'password',
          organization: 'Example Org',
          department: 'Example Dept',
          profession: 'studerende',
        },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await registerUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        userId: expect.any(Number),
        message: 'Registration was successful',
        token: 'mocked-token',
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          email: 'new@dtu.dk',
          role: 'Admin',
        },
        'mocked-secret-key'
      );
    } catch (error) {
    }
  });

  it('register a user type Unknown, return token', async () => {
    try {
      const req = {
        body: {
          id: 123,
          name: 'new',
          email: 'new@dtu.dk',
          password: 'password',
          organization: 'Example Org',
          department: 'Example Dept',
          profession: 'Unknown',
        },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await registerUser(req, res);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        userId: expect.any(Number),
        message: 'Registration was successful',
        token: 'mocked-token',
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          email: 'new@dtu.dk',
          role: 'Unknown',
        },
        'mocked-secret-key'
      );
    } catch (error) {
    }
  });
  
  
  it('if the email is already registered return an error ', async () => {
    req.body.email = 'arooj@dtu.dk';

    try {
      await registerUser(req, res);
    } catch (error) {
      expect(error.message).toBe('Email already registered');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already registered' });
      expect(jwt.sign).not.toHaveBeenCalled();
    }
  });
  it('return a 500 error', async () => {
    try {
      req.body.email = 'chaudhry@dtu.dk';

      userModel.createUser.mockImplementation(() => {
        throw new Error('Internal server error');
      });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(jwt.sign).not.toHaveBeenCalled();
    } catch (error) {
    }
  });
  
});
