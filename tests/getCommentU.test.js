const sql = require('mssql');
const { getCommentsForNeed } = require('../models/commentModel');

jest.mock('mssql', () => {
  const mssql = jest.requireActual('mssql');

  const connectionPoolMock = {
    connect: jest.fn(),
    request: jest.fn(() => ({
      input: jest.fn(),
      query: jest.fn(),
    })),
  };

  const connectionMock = jest.fn(() => connectionPoolMock);

  return { ...mssql, ConnectionPool: connectionMock };
});

describe('getCommentsForNeed', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('retrieve comments for the needID', async () => {
    const queryResult = { recordset: ['comment1', 'comment2'] };

    sql.ConnectionPool.mockImplementationOnce(() => ({
      connect: jest.fn(),
      request: jest.fn(() => ({
        input: jest.fn(),
        query: jest.fn().mockResolvedValueOnce(queryResult),
      })),
    }));

    const needID = 123;
    const result = await getCommentsForNeed(needID);

    expect(sql.ConnectionPool).toHaveBeenCalledTimes(1);
    expect(sql.ConnectionPool).toHaveBeenCalledWith(expect.any(Object));
    expect(result).toEqual(queryResult.recordset);
  });

  it('errors', async () => {
    const errorMessage = 'Database connection failed';
    const consoleLogSpy = jest.spyOn(console, 'log');
  
    sql.ConnectionPool.mockImplementationOnce(() => ({
      connect: jest.fn(),
      request: jest.fn(() => ({
        input: jest.fn(),
        query: jest.fn().mockRejectedValueOnce(new Error(errorMessage)),
      })),
    }));
  
    const needID = 123;
    const result = await getCommentsForNeed(needID);
  
    expect(sql.ConnectionPool).toHaveBeenCalledTimes(1);
    expect(sql.ConnectionPool).toHaveBeenCalledWith(expect.any(Object));
    expect(result).toBeUndefined();
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
  
    consoleLogSpy.mockRestore();
  });
  
});
