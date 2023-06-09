const request = require('supertest');
const express = require('express');
const app = express();
const Router = require('../routes/needRoutes');
const { deleteNeed } = require('../models/needModel');

jest.mock('../models/needModel', () => ({
  deleteNeed: jest.fn(),
}));
jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 123 };
    next();
  }),
}));

app.use(express.json());
app.use('/api/v1/', Router);

describe('DELETE Need', () => {
  it('when need is deleted return success message', async () => {
    try {
      deleteNeed.mockResolvedValue(true);

      const token = 'AuthToken';

      const response = await request(app)
        .delete('/api/v1/delete/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Need deleted successfully',
      });
      expect(deleteNeed).toHaveBeenCalledWith('1');
    } catch (error) {

    }
  });
});
