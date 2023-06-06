const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

jest.mock('jsonwebtoken');
const verifyTokenMock = jest.fn();
jwt.verify.mockImplementation(verifyTokenMock);

jest.mock('../config/config', () => ({
  AUTH_KEY: 'mockAuthKey',
}));

describe('authorize', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer mockToken'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('authorize a valid token and set req.user', async () => {
    const decodedToken = {
      profession: 'Sundhedsprofessionel',
    };
    verifyTokenMock.mockReturnValue(decodedToken);

    await auth.authorize(req, res, next);

    expect(verifyTokenMock).toHaveBeenCalledWith('mockToken', 'mockAuthKey');
    expect(req.user).toBe(decodedToken);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
  test('if no token is provided return 401', async () => {
    req.headers.authorization = undefined;

    await auth.authorize(req, res, next);

    expect(verifyTokenMock).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: 'No token provided' });
  });
  test('if profession is invalid return 403', async () => {
    const decodedToken = {
      profession: 'SomeOtherProfession',
    };
    verifyTokenMock.mockReturnValue(decodedToken);

    await auth.authorize(req, res, next);

    expect(verifyTokenMock).toHaveBeenCalledWith('mockToken', 'mockAuthKey');
    expect(req.user).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ message: 'Access denied. Only Sundhedsprofessionel are allowed.' });
  });
  test('if token is invalid return 401', async () => {
    const error = new Error('Invalid token');
    verifyTokenMock.mockImplementation(() => {
      throw error;
    });

    await auth.authorize(req, res, next);
    expect(verifyTokenMock).toHaveBeenCalledWith('mockToken', 'mockAuthKey');
    expect(req.user).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

});
