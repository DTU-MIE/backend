const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const router = require('../routes/userRoutes'); 
const { getUserByEmailAndPassword } = require('../models/userModel'); 

jest.mock('../models/userModel', () => ({
  getUserByEmailAndPassword: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mockedToken'),
  }));

app.use(express.json());
app.use('/api/v1/', router);
describe('Login API', () => {
    it('when valid credentials are provided return a valid token', async () => {
      const mockUser = {
        email: 'mie@dtu.dk',
        password: 'password123',
      };
  

      getUserByEmailAndPassword.mockImplementation(async (email, password) => {
        const hashedPassword = await bcrypt.hash(mockUser.password, 10); 
  
        if (email === mockUser.email && await bcrypt.compare(mockUser.password, hashedPassword)) {
          return {
            id: 1,
            email: mockUser.email,
            password: hashedPassword,
            profession: 'student',
          };
        }
        return null;
      });
  
      const response = await request(app)
        .post('/api/v1/login')
        .send(mockUser);
  
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.token).toBe('mockedToken', 123); 
    });
});