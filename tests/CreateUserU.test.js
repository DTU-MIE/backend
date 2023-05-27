const bcrypt = require('bcrypt');
const sql = require('mssql');
const { BadRequestError } = require('../models/userModel');
const { createUser } = require('../models/userModel');

jest.mock('bcrypt');
jest.mock('mssql');

describe('createUser', () => {
  const userDetails = {
    name: 'arooj',
    email: 'arooj@regionh.dk',
    password: 'password123',
    organization: 'Organization',
    department: 'Department',
    profession: 'Profession',
  };

  beforeEach(() => {
    //Clear all mock implementation and reset mock function calls
    jest.clearAllMocks();
  });

  it('should create a new user when all conditions are met', async () => {
    //Mocking the SQL query/result
    const mockQuery = jest.fn().mockResolvedValueOnce({
      recordset: [{ count: 0 }],
    });
    const mockRequest = jest.fn().mockReturnThis();
    mockRequest.mockImplementation(() => ({
      input: jest.fn().mockReturnThis(),
      query: mockQuery,
    }));

    //Mocking the SQL connection and pool
    const mockConnectionPool = {
      connect: jest.fn(),
      request: mockRequest,
      close: jest.fn(),
    };
    sql.ConnectionPool.mockImplementation(() => mockConnectionPool);

    //Mocking the bcrypt.hash function
    bcrypt.hash.mockResolvedValueOnce('hashedPassword');

    //Mocking the result for successful user creation
    const mockResult = {
      recordset: [{ id: 123 }],
    };
    mockRequest().query.mockResolvedValueOnce(mockResult);

    const result = await createUser(userDetails);


    expect(sql.ConnectionPool).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnectionPool.connect).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT COUNT(*) as count FROM USERS WHERE email =')
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO USERS (name, email, password, organization, department, profession)')
    );
    expect(mockConnectionPool.close).toHaveBeenCalled();
    expect(result).toBe(123);

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
  });

  it('should throw BadRequestError when email is already registered', async () => {
    const mockQuery = jest.fn().mockResolvedValueOnce({
      recordset: [{ count: 1 }],
    });
    const mockRequest = jest.fn().mockReturnThis();
    mockRequest.mockImplementation(() => ({
      input: jest.fn().mockReturnThis(),
      query: mockQuery,
    }));

    const mockConnectionPool = {
      connect: jest.fn(),
      request: mockRequest,
      close: jest.fn(),
    };
    sql.ConnectionPool.mockImplementation(() => mockConnectionPool);

    await expect(createUser(userDetails)).rejects.toThrow(BadRequestError);

    expect(sql.ConnectionPool).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnectionPool.connect).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT COUNT(*) as count FROM USERS WHERE email =')
    );
    expect(mockConnectionPool.close).toHaveBeenCalled();
  });

  it('should throw an error when the email domain is invalid', async () => {
    const mockQuery = jest.fn().mockResolvedValueOnce({
      recordset: [{count: 0}],
    });
    const mockRequest = jest.fn().mockReturnThis();
    mockRequest.mockImplementation(() => ({
      input: jest.fn().mockReturnThis(),
      query: mockQuery,
    }));

    const mockConnectionPool = {
      connect: jest.fn(),
      request: mockRequest,
      close: jest.fn(),
    };
    sql.ConnectionPool.mockImplementation(() => mockConnectionPool);

    const invalidEmailUser = {
      name: 'arooj',
      email: 'arooj@regionh.dk',
      password: 'password123',
      organization: 'Organization',
      department: 'Department',
      email: 'arooj@example.com',
    };

    await expect(createUser(invalidEmailUser)).rejects.toThrow(Error);

    expect(sql.ConnectionPool).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnectionPool.connect).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT COUNT(*) as count FROM USERS WHERE email =')
    );
    expect(mockConnectionPool.close).toHaveBeenCalled();
  });
});
