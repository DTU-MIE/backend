const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const {
    AUTH_KEY
  } = require("../config/config");

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('authenticateToken', () => {
    test('should call the next middleware function when a valid token is provided', () => {
        const req = {
          headers: {
            authorization: 'Bearer valid-token',
          },
        };
        const res = {};
        const next = jest.fn();
    
        jwt.verify.mockReturnValueOnce({ userId: 123 });
  
        auth.authenticateToken(req, res, next);
    
        expect(jwt.verify).toHaveBeenCalledWith('valid-token', AUTH_KEY);
      
        expect(req.user).toEqual({ userId: 123 });
    
        expect(next).toHaveBeenCalled();
      });
      
  test('should return 401 if no token is provided', () => {
    const req = {
      headers: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    auth.authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 403 for an invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    auth.authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});
