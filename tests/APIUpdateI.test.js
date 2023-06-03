const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const model = require('../models/needModel');
const sql = require('mssql');
const router = require('../routes/needRoutes');

jest.mock('mssql', () => ({
  connect: jest.fn(),
  close: jest.fn(),
  request: jest.fn().mockReturnThis(),
  input: jest.fn().mockReturnThis(),
  query: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

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

  it('update the need successfully', async () => {
    sql.query.mockResolvedValueOnce({ recordset: {} });

    jwt.verify.mockReturnValueOnce({ userId: 123 });

    jwt.sign.mockReturnValueOnce('mocked_token');

    const updateNeedMock = jest.fn().mockResolvedValueOnce();
    model.updateNeed = updateNeedMock;

    const id = "123";
    const updatedData = {
      NeedIs: 'Updated Need',
      Title: 'Updated Title',
      ContactPerson: 'arooj',
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

  it('return an error when failed to update the need', async () => {
    sql.query.mockRejectedValueOnce(new Error('Update failed'));
  
    jwt.verify.mockReturnValueOnce({ userId: 123 });
  
    jwt.sign.mockReturnValueOnce('mocked_token');
  
    const updateNeedMock = jest.fn().mockRejectedValueOnce(new Error('Failed to update'));
    model.updateNeed = updateNeedMock;
  
    const id = "123";
    const updatedData = {
      NeedIs: 'Updated Need',
      Title: 'Updated Title',
      ContactPerson: 'arooj',
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
