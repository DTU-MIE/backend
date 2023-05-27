const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const {
    AUTH_KEY
  } = require("../config/config");
// Mock the jwt.verify function
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
      
        // Mock the jwt.verify function to return a dummy payload
        jwt.verify.mockReturnValueOnce({ userId: 123 });
      
        // Call the authenticateToken middleware
        auth.authenticateToken(req, res, next);
      
        // Assert that jwt.verify is called with the correct arguments
        expect(jwt.verify).toHaveBeenCalledWith('valid-token', AUTH_KEY);
      
        // Assert that req.user is set to the expected value
        expect(req.user).toEqual({ userId: 123 });
      
        // Assert that the next middleware function is called
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

    // Call the authenticateToken middleware
    auth.authenticateToken(req, res, next);

    // Assert that res.status and res.json are called with the correct arguments
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });

    // Assert that next is not called
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

    // Mock the jwt.verify function to throw an error
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Call the authenticateToken middleware
    auth.authenticateToken(req, res, next);

    // Assert that res.status and res.json are called with the correct arguments
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });

    // Assert that next is not called
    expect(next).not.toHaveBeenCalled();
  });
});
