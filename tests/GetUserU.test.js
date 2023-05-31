const sql = require('mssql');
const bcrypt = require('bcrypt');
const { getUserByEmailAndPassword } = require('../models/userModel'); 


jest.mock('mssql');
jest.mock('bcrypt');

describe('getUserByEmailAndPassword', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('if no user is found return null ', async () => {
    const email = 'new@dtu.dk';
    const password = 'password';
    const mockedPool = {
      connect: jest.fn(),
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValueOnce({ recordset: [] }),
      close: jest.fn()
    };
    sql.ConnectionPool.mockImplementation(() => mockedPool);


    const result = await getUserByEmailAndPassword(email, password);


    expect(result).toBeNull();
    expect(mockedPool.connect).toHaveBeenCalled();
    expect(mockedPool.request).toHaveBeenCalledWith();
    expect(mockedPool.input).toHaveBeenCalledWith('email', sql.NVarChar(50), email);
    expect(mockedPool.input).toHaveBeenCalledWith('password', sql.NVarChar(255), password);
    expect(mockedPool.execute).toHaveBeenCalledWith('getUserByEmailAndPassword');
    expect(mockedPool.close).toHaveBeenCalled();
  })
  it('if the email and password match return the user ' , async () => {

    const email = 'new@dtu.dk';
    const password = 'password';
    const hashedPassword = 'hashed_password';
    const mockedUser = { id: 1, email: 'new@dtu.dk', password: hashedPassword };
    const mockedPool = {
      connect: jest.fn(),
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValueOnce({ recordset: [mockedUser] }),
      close: jest.fn()
    };
    sql.ConnectionPool.mockImplementation(() => mockedPool);
    bcrypt.compare.mockResolvedValueOnce(true);

    const result = await getUserByEmailAndPassword(email, password);

    expect(result).toEqual(mockedUser);
    expect(mockedPool.connect).toHaveBeenCalled();
    expect(mockedPool.request).toHaveBeenCalledWith();
    expect(mockedPool.input).toHaveBeenCalledWith('email', sql.NVarChar(50), email);
    expect(mockedPool.input).toHaveBeenCalledWith('password', sql.NVarChar(255), password);
    expect(mockedPool.execute).toHaveBeenCalledWith('getUserByEmailAndPassword');
    expect(bcrypt.compare).toHaveBeenCalledWith(password, mockedUser.password);
    expect(mockedPool.close).toHaveBeenCalled();
  });
  it('null if the password does not match', async () => {

    const email = 'new@dtu.dk';
    const password = 'password';
    const mockedUser = { id: 1, email: 'new@dtu.dk', password: 'hashed_password' };
    const mockedPool = {
      connect: jest.fn(),
      request: jest.fn().mockReturnThis(),
      input: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValueOnce({ recordset: [mockedUser] }),
      close: jest.fn()
    };
    sql.ConnectionPool.mockImplementation(() => mockedPool);
    bcrypt.compare.mockResolvedValueOnce(false);
  

    const result = await getUserByEmailAndPassword(email, password);
  

    expect(result).toBeNull();
    expect(mockedPool.connect).toHaveBeenCalled();
    expect(mockedPool.request).toHaveBeenCalledWith();
    expect(mockedPool.input).toHaveBeenCalledWith('email', sql.NVarChar(50), email);
    expect(mockedPool.input).toHaveBeenCalledWith('password', sql.NVarChar(255), password);
    expect(mockedPool.execute).toHaveBeenCalledWith('getUserByEmailAndPassword');
    expect(bcrypt.compare).toHaveBeenCalledWith(password, mockedUser.password);
    expect(mockedPool.close).toHaveBeenCalled();
  });  
});