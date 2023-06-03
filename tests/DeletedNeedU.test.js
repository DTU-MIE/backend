const sql = require('mssql');
const { deleteNeed } = require('../models/needModel'); 
jest.mock('mssql');

describe('deleteNeed', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('delete a need and return true if successful', async () => {
    const request = {
      input: jest.fn(),
      query: jest.fn().mockResolvedValueOnce({ rowsAffected: [1] }),
    };
    const pool = {
      request: jest.fn().mockReturnValue(request),
    };
    sql.connect.mockResolvedValueOnce(pool);


    const result = await deleteNeed(1);

    expect(result).toBe(true);
    expect(sql.connect).toHaveBeenCalledTimes(1);
    expect(pool.request).toHaveBeenCalledTimes(1);
    expect(request.input).toHaveBeenCalledWith('id', sql.Int, 1);
    expect(request.query).toHaveBeenCalledWith('DELETE FROM NEED WHERE id = @id');
    expect(sql.close).toHaveBeenCalledTimes(1);
  });

  it('return false', async () => {
    const request = {
      input: jest.fn(),
      query: jest.fn().mockRejectedValueOnce(new Error('Mocked error')),
    };
    const pool = {
      request: jest.fn().mockReturnValue(request),
    };
    sql.connect.mockResolvedValueOnce(pool);

    console.error = jest.fn();

    const result = await deleteNeed(1);


    expect(result).toBe(false);
    expect(sql.connect).toHaveBeenCalledTimes(1);
    expect(pool.request).toHaveBeenCalledTimes(1);
    expect(request.input).toHaveBeenCalledWith('id', sql.Int, 1);
    expect(request.query).toHaveBeenCalledWith('DELETE FROM NEED WHERE id = @id');
    expect(console.error.mock.calls[0][0]).toContain('Error deleting need:');
    expect(console.error.mock.calls[0][1]).toBeInstanceOf(Error);

    expect(sql.close).toHaveBeenCalledTimes(1);
  });
});
