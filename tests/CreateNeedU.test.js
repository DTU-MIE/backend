const sql = require('mssql');
jest.mock('mssql');

const model = require('../models/needModel');
const needController = require('../controllers/needController');

describe('insertNeed', () => {
    test('insert a new need and return its ID', async () => {
      const need = {
        NeedIs: 'Test Need',
        Title: 'Test Title',
        ContactPerson: 'Test Person',
        Keywords: 'Test Keywords',
        Proposal: 'Test Proposal',
        Solution: 'Test Solution',
        FileData: null,
        FileName: null,
        extension: null,
        createdAt: new Date(),
      };
  
      const mockInput = jest.fn().mockReturnThis();
  
      const mockRequest = {
        query: jest.fn().mockResolvedValueOnce({
          recordset: [{ id: 1 }],
        }),
        input: mockInput,
      };
  
      const mockPool = {
        connect: jest.fn(),
        request: jest.fn(() => mockRequest),
        close: jest.fn(),
      };
  
      sql.ConnectionPool.mockImplementation(() => mockPool);
  
      const result = await model.insertNeed(need);
  
      expect(sql.ConnectionPool).toHaveBeenCalledTimes(1);
      expect(mockPool.connect).toHaveBeenCalledTimes(1);
      expect(mockPool.request).toHaveBeenCalledTimes(1);
      expect(mockRequest.input).toHaveBeenCalledTimes(10);
      expect(mockRequest.input).toHaveBeenNthCalledWith(1, 'NeedIs', sql.NVarChar(4000), need.NeedIs);
      expect(mockRequest.input).toHaveBeenNthCalledWith(2, 'Title', sql.NVarChar(1000), need.Title);
      expect(mockRequest.input).toHaveBeenNthCalledWith(3, 'ContactPerson', sql.NVarChar(1000), need.ContactPerson);
      expect(mockRequest.input).toHaveBeenNthCalledWith(4, 'Keywords', sql.NVarChar(1000), need.Keywords);
      expect(mockRequest.input).toHaveBeenNthCalledWith(5, 'Proposal', sql.NVarChar(1000), need.Proposal);
      expect(mockRequest.input).toHaveBeenNthCalledWith(6, 'Solution', sql.NVarChar(1000), need.Solution);
      expect(mockRequest.input).toHaveBeenNthCalledWith(7, 'FileData', sql.VarBinary(sql.MAX), need.FileData);
      expect(mockRequest.input).toHaveBeenNthCalledWith(8, 'FileName', sql.NVarChar(255), need.FileName);
      expect(mockRequest.input).toHaveBeenNthCalledWith(9, 'extension', sql.NVarChar(10), need.extension);
      expect(mockRequest.input).toHaveBeenNthCalledWith(10, 'createdAt', sql.DateTime, need.createdAt);
      expect(mockRequest.query).toHaveBeenCalledTimes(1);
      expect(mockPool.close).toHaveBeenCalledTimes(1);
      expect(result).toBe(1);
    });
  });

 
  describe('createNeed', () => {
    test('create a new need & return the ID if file is present', async () => {
      model.insertNeed = jest.fn().mockResolvedValueOnce(1);
      const mockRequest = {
        body: {
          NeedIs: 'Test Need',
          Title: 'Test Title',
          ContactPerson: 'Test Person',
          Keywords: 'Test Keywords',
          Proposal: 'Test Proposal',
          Solution: 'Test Solution',
        },
        file: {
          buffer: Buffer.from('Test File Content'),
          originalname: 'test.jpg',
        },
      };
  
      const mockResponse = {
        json: jest.fn(),
      };
  
      const need = {
        NeedIs: 'Test Need',
        Title: 'Test Title',
        ContactPerson: 'Test Person',
        Keywords: 'Test Keywords',
        Proposal: 'Test Proposal',
        Solution: 'Test Solution',
        FileData: Buffer.from('Test File Content'),
        FileName: 'test.jpg',
        extension: 'jpg',
        createdAt: expect.any(Date),
      };
  
      const mockInsertNeed = jest.spyOn(model, 'insertNeed').mockResolvedValueOnce(1);
  
      await needController.createNeed(mockRequest, mockResponse);
  
      expect(mockInsertNeed).toHaveBeenCalledWith(expect.objectContaining(need));
      expect(mockResponse.json).toHaveBeenCalledWith({ id: 1 });
    });
  
    test('create a new need and return the ID when file is not present', async () => {
      model.insertNeed = jest.fn().mockResolvedValueOnce(2);
      const mockRequest = {
        body: {
          NeedIs: 'Test Need',
          Title: 'Test Title',
          ContactPerson: 'Test Person',
          Keywords: 'Test Keywords',
          Proposal: 'Test Proposal',
          Solution: 'Test Solution',
        },
      };
  
      const mockResponse = {
        json: jest.fn(),
      };
  
      const need = {
        NeedIs: 'Test Need',
        Title: 'Test Title',
        ContactPerson: 'Test Person',
        Keywords: 'Test Keywords',
        Proposal: 'Test Proposal',
        Solution: 'Test Solution',
        FileData: null,
        FileName: null,
        extension: null,
        createdAt: expect.any(Date),
      };
  
      const mockInsertNeed = jest.spyOn(model, 'insertNeed').mockResolvedValueOnce(2);
  
      await needController.createNeed(mockRequest, mockResponse);
      expect(mockInsertNeed).toHaveBeenCalledWith(expect.objectContaining(need));
      expect(mockResponse.json).toHaveBeenCalledWith({ id: 2 });
    });
  });
  
