const sql = require('mssql');
const { insertComment } = require('../models/commentModel');

jest.mock('mssql');

describe('insertComment', () => {
  const mockPool = {
    connect: jest.fn(),
    request: jest.fn().mockReturnThis(),
    input: jest.fn(),
    query: jest.fn().mockReturnThis(),
  };
  
  let consoleSpy;

  beforeEach(() => {
    sql.ConnectionPool.mockImplementation(() => mockPool);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });

  it('should insert a comment into the database', async () => {
    const id = 1;
    const comment = 'test comment';
    await insertComment(id, comment);

    expect(mockPool.connect).toHaveBeenCalled();
    expect(mockPool.request).toHaveBeenCalled();
    expect(mockPool.request().input).toHaveBeenCalledWith('id', sql.Int, id);
    expect(mockPool.request().input).toHaveBeenCalledWith('comment', sql.NVarChar(255), comment);
    expect(mockPool.request().query).toHaveBeenCalledWith(expect.any(String));
    expect(consoleSpy).toHaveBeenCalledWith('Comment added successfully!');
  });

  it('should throw an error if comment is empty', async () => {
    const id = 1;
    const comment = '';
    await expect(insertComment(id, comment)).rejects.toThrow('Comment is empty!');
  });

  it('should throw an error if connection fails', async () => {
    const id = 1;
    const comment = 'test comment';
    mockPool.connect.mockRejectedValue(new Error('Connection failed'));

    await expect(insertComment(id, comment)).rejects.toThrow('Connection failed');
  });

});
