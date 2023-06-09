const bcrypt = require('bcrypt');
const { loginUser } = require('../controllers/userController');
const { getUserByEmailAndPassword} = require('../models/userModel');
const { generateToken } = require('../middleware/auth');

jest.mock('mssql');
jest.mock('../middleware/auth', () => ({
  generateToken: jest.fn(),
}));
jest.mock('../models/userModel', () => ({
    getUserByEmailAndPassword: jest.fn(),
  }));
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('mock-hashed-password'),
}));

describe('loginUser', () => {
    let req;
    let res;
  
    beforeEach(() => {
      req = {
        body: {
          email: 'new@dtu.dk',
          password: 'password123',
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });
  

    it('if credentials are valid log in the user and return a token ', async () => {
      const mockUser = {
        id: 123,
        email: 'new@dtu.dk',
        password: 'mock-hashed-password',
        profession: 'Student',
      };
      getUserByEmailAndPassword.mockResolvedValueOnce(mockUser);
    
      bcrypt.compare.mockResolvedValueOnce(true);
    
      const mockToken = 'mock-token';
      generateToken.mockReturnValueOnce(mockToken);
    
      await loginUser(req, res);
    
      expect(getUserByEmailAndPassword).toHaveBeenCalledWith('new@dtu.dk', 'password123');
    
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    
      expect(generateToken).toHaveBeenCalledWith({
        id: 123,
        email: 'new@dtu.dk',
        profession: 'Student',
      });
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ token: 'mock-token', userId: 123 });
    });
    it('error message if user is not found', async () => {
      getUserByEmailAndPassword.mockResolvedValueOnce(null);
    
      await loginUser(req, res);
    
      expect(getUserByEmailAndPassword).toHaveBeenCalledWith('new@dtu.dk', 'password123');
    
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: 'Incorrect email or password' });
    });
    it('if password does not match, return an error message ', async () => {
      const mockUser = {
        id: 123,
        email: 'new@dtu.dk',
        password: await bcrypt.hash('wrongpassword', 10), 
        profession: 'Student',
      };
      getUserByEmailAndPassword.mockResolvedValueOnce(mockUser);
    
      bcrypt.compare.mockResolvedValueOnce(false);
    
      await loginUser(req, res);
    
      expect(getUserByEmailAndPassword).toHaveBeenCalledWith('new@dtu.dk', 'password123');
    
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: 'Incorrect email or password' });
    });
    it('if an error occurs during login', async () => {
      getUserByEmailAndPassword.mockRejectedValueOnce(new Error('Database connection failed'));
    
      await loginUser(req, res);
    
      expect(getUserByEmailAndPassword).toHaveBeenCalledWith('new@dtu.dk', 'password123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Error occurred while logging in' });
    });
        
  });