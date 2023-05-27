const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const model = require('../models/needModel');
const sql = require('mssql');
const router = require('../routes/needRoutes');

// Mocking the SQL connection
jest.mock('mssql', () => ({
  connect: jest.fn(),
  close: jest.fn(),
  request: jest.fn().mockReturnThis(),
  input: jest.fn().mockReturnThis(),
  query: jest.fn(),
}));

// Mocking the authentication token
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Mocking the authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => next()),
}));

describe('Integration Test', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/v1/', router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update the need successfully', async () => {
    // Mocking the SQL query result
    sql.query.mockResolvedValueOnce({ recordset: {} });

    // Mocking the token verification
    jwt.verify.mockReturnValueOnce({ userId: 123 });

    // Mocking the authentication token
    jwt.sign.mockReturnValueOnce('mocked_token');

    // Manually creating a mock function for the updateNeed method
    const updateNeedMock = jest.fn().mockResolvedValueOnce();
    model.updateNeed = updateNeedMock;

    const id = "123";
    const updatedData = {
      NeedIs: 'Updated Need',
      Title: 'Updated Title',
      ContactPerson: 'John Doe',
      Keywords: 'keyword1, keyword2',
      Proposal: 'Updated Proposal',
      Solution: 'Updated Solution',
      createdAt: expect.any(Date),
      extension: null,
    };
  
    const response = await request(app)
      .put(`/api/v1/update/needs/${id}`)
      .set('Authorization', 'Bearer mocked_token')
      .send(updatedData);
  
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Need updated successfully' });
  
    const receivedArgs = updateNeedMock.mock.calls[0];
    const receivedData = receivedArgs[1];
  
    expect(receivedArgs[0]).toBe(id);
    expect(receivedData.NeedIs).toBe(updatedData.NeedIs);
    expect(receivedData.Title).toBe(updatedData.Title);
    expect(receivedData.ContactPerson).toBe(updatedData.ContactPerson);
    expect(receivedData.Keywords).toBe(updatedData.Keywords);
    expect(receivedData.Proposal).toBe(updatedData.Proposal);
    expect(receivedData.Solution).toBe(updatedData.Solution);
    expect(receivedData.createdAt).toEqual(expect.any(Date));
    expect(receivedData.extension).toBe(updatedData.extension);
  });

  it('should return an error when failing to update the need', async () => {
    // Mocking the SQL query error
    sql.query.mockRejectedValueOnce(new Error('Update failed'));
  
    // Mocking the token verification
    jwt.verify.mockReturnValueOnce({ userId: 123 });
  
    // Mocking the authentication token
    jwt.sign.mockReturnValueOnce('mocked_token');
  
    // Manually creating a mock function for the updateNeed method
    const updateNeedMock = jest.fn().mockRejectedValueOnce(new Error('Failed to update'));
    model.updateNeed = updateNeedMock;
  
    const id = "123";
    const updatedData = {
      NeedIs: 'Updated Need',
      Title: 'Updated Title',
      ContactPerson: 'John Doe',
      Keywords: 'keyword1, keyword2',
      Proposal: 'Updated Proposal',
      Solution: 'Updated Solution',
      createdAt: new Date(),
    };
  
    const response = await request(app)
      .put(`/api/v1/update/needs/${id}`)
      .set('Authorization', 'Bearer mocked_token')
      .send(updatedData);
  
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to update the need' });
  
    const receivedArgs = updateNeedMock.mock.calls[0];
    const receivedData = receivedArgs[1];
  
    expect(receivedArgs[0]).toBe(id);
    expect(receivedData.NeedIs).toBe(updatedData.NeedIs);
    expect(receivedData.Title).toBe(updatedData.Title);
    expect(receivedData.ContactPerson).toBe(updatedData.ContactPerson);
    expect(receivedData.Keywords).toBe(updatedData.Keywords);
    expect(receivedData.Proposal).toBe(updatedData.Proposal);
    expect(receivedData.Solution).toBe(updatedData.Solution);
    expect(receivedData.createdAt).toEqual(expect.any(Date));
    expect(receivedData.extension).toBe(null);
  });
});
