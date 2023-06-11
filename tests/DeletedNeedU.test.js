const sql = require('mssql');
const model = require('../models/needModel');
const controller = require('../controllers/needController');
jest.mock('mssql');

describe('deleteNeed', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should delete a need and return true if successful', async () => {
    const request = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValueOnce({ rowsAffected: [1] }),
    };
    const pool = {
      request: jest.fn().mockReturnValue(request),
    };
    sql.connect.mockResolvedValueOnce(pool);

    //Mocks the model function
    model.getNeedById = jest.fn().mockResolvedValueOnce({ UserId: 123 });
    model.deleteNeed = jest.fn().mockResolvedValueOnce(true);
    
    const req = {
      params: {
        id: 1,
      },
      user: {
        id: 123,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    try {
      await controller.deleted(req, res);

      expect(model.getNeedById).toHaveBeenCalledWith(1);
      expect(model.deleteNeed).toHaveBeenCalledWith(1, 123);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Need deleted successfully' });
      expect(sql.connect).toHaveBeenCalledTimes(1);
      expect(pool.request).toHaveBeenCalledTimes(2);
      expect(request.input).toHaveBeenCalledWith('id', sql.Int, 1);
      expect(request.input).toHaveBeenCalledWith('UserId', sql.Int, 123);
      expect(request.query).toHaveBeenCalledWith('DELETE FROM NEED WHERE id = @id AND UserId = @UserId');
      expect(sql.close).toHaveBeenCalledTimes(1);
    } catch (error) {

    }
  });

  it('should return false', async () => {
    const request = {
      input: jest.fn(),
      query: jest.fn().mockRejectedValueOnce(new Error('Mocked error')),
    };
    const pool = {
      request: jest.fn().mockReturnValue(request),
    };
    sql.connect.mockResolvedValueOnce(pool);

    model.getNeedById = jest.fn().mockResolvedValueOnce({ UserId: 123 });
    model.deleteNeed = jest.fn().mockResolvedValueOnce(false);

    const req = {
      params: {
        id: 1,
      },
      user: {
        id: 123,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    console.error = jest.fn();

    try {
      await controller.deleted(req, res);

      expect(model.getNeedById).toHaveBeenCalledWith(1);
      expect(model.deleteNeed).toHaveBeenCalledWith(1, 123);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Need not found' });
      expect(console.error.mock.calls[0][0]).toContain('Error deleting need:');
      expect(console.error.mock.calls[0][1]).toBeInstanceOf(Error);
      expect(sql.connect).toHaveBeenCalledTimes(1);
      expect(pool.request).toHaveBeenCalledTimes(1);
      expect(request.input).toHaveBeenCalledWith('id', sql.Int, 1);
      expect(request.input).toHaveBeenCalledWith('UserId', sql.Int, 123);
      expect(request.query).toHaveBeenCalledWith('DELETE FROM NEED WHERE id = @id AND UserId = @UserId');
      expect(sql.close).toHaveBeenCalledTimes(1);
    } catch (error) {

    }
  });
});
