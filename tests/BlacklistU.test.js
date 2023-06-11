const mssql = require('mssql');
const { Blacklist } = require('../models/userModel');

jest.mock('mssql');

describe('Blacklist', () => {
  test('insert token into the blacklist table', async () => {
    const requestMock = { input: jest.fn(), query: jest.fn() };
    const connectionMock = { request: jest.fn(() => requestMock), close: jest.fn() };
    mssql.connect.mockResolvedValue(connectionMock);

    const token = 'some-token';
    await Blacklist(token);

    expect(mssql.connect).toHaveBeenCalled();
    expect(connectionMock.request).toHaveBeenCalled();
    expect(requestMock.input).toHaveBeenCalledWith('token', mssql.NVarChar, token);
    expect(requestMock.query).toHaveBeenCalledWith('INSERT INTO blacklist (token) VALUES (@token)');
    expect(connectionMock.close).toHaveBeenCalled();
  });
});
