const sql = require('mssql');
const { insertComment } = require('../models/commentModel');

jest.mock('mssql', () => {
  const mssql = jest.requireActual('mssql');

  const connectionPoolMock = {
    connect: jest.fn(),
    request: jest.fn(() => ({
      input: jest.fn(),
      query: jest.fn(),
    })),
  };

  const connectionMock = {
    ConnectionPool: jest.fn(() => connectionPoolMock),
  };

  return { ...mssql, ...connectionMock };
});

describe('insertComment', () => {
  it('Insert a comment successfully', async () => {
    const needID = 123;
    const comment = 'This is a test comment';
    const kind = 'Comment';
    const mockQuery = jest.fn();

    sql.ConnectionPool.mockImplementationOnce(() => ({
      connect: jest.fn(),
      request: jest.fn(() => ({
        input: jest.fn(),
        query: mockQuery,
      })),
    }));
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();

    await insertComment(needID, comment, kind);

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String)); 
    expect(consoleLogMock).toHaveBeenCalledWith('Comment added successfully!');


    consoleLogMock.mockRestore();
  });

  it('throw an error if the comment is empty', async () => {

    const needID = 123;
    const comment = '';
    const kind = 'Comment';


    await expect(insertComment(needID, comment, kind)).rejects.toThrow('Comment is empty!');
  });

  it('throw an error when the kind value is invalid', async () => {

    const needID = 123;
    const comment = 'This is a test comment';
    const kind = 'Invalid';


    await expect(insertComment(needID, comment, kind)).rejects.toThrow('Invalid kind value!');
  });
});
