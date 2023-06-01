const model = require('../models/needModel');
const controller = require('../controllers/needController');
const sql = require('mssql');

jest.mock('mssql');

describe('getNeedById', () => {
    let mockRequest;
    let mockPool;
  
    beforeEach(() => {
      mockRequest = {
        input: jest.fn(),
        query: jest.fn().mockResolvedValueOnce({
          recordset: [
            {
              id: 1,
              NeedIs: 'Test Need',
              Title: 'Test Title',
              ContactPerson: 'Test Person',
              Keywords: 'Test Keywords',
              Proposal: 'Test Proposal',
              Solution: 'Test Solution',
              CreatedAt: new Date(),
              HasFile: 'file',
            },
          ],
        }),
      };
  
      mockPool = {
        request: jest.fn(() => mockRequest),
        close: jest.fn().mockResolvedValueOnce(true),
      };
  
      const mockConnect = jest.fn().mockResolvedValueOnce(mockPool);
      sql.connect = mockConnect;
    });
  
    afterEach(() => {
      expect(mockPool.close).toHaveBeenCalledTimes(1);
    });
  
    test('return need with the given ID', async () => {
      const id = 1;
  
      const result = await model.getNeedById(id);
  
      expect(result).toEqual({
        id: 1,
        NeedIs: 'Test Need',
        Title: 'Test Title',
        ContactPerson: 'Test Person',
        Keywords: 'Test Keywords',
        Proposal: 'Test Proposal',
        Solution: 'Test Solution',
        CreatedAt: expect.any(Date),
        HasFile: 'file',
      });
  
      expect(mockPool.request).toHaveBeenCalledTimes(1);
      expect(mockRequest.input).toHaveBeenCalledTimes(1);
      expect(mockRequest.input).toHaveBeenCalledWith('id', sql.Int, id);
      expect(mockRequest.query).toHaveBeenCalledTimes(1);
      expect(mockRequest.query).toHaveBeenCalledWith(`
      SELECT *,
      CASE WHEN FileData IS NULL THEN 'no file' ELSE 'file' END AS HasFile
      FROM NEED
      WHERE ID = @id;
    `);
    });  
  });

describe('getNeed', () => {
  test('return need with the file URL', async () => {
      const mockReq = {
        params: { id: 1 },
        headers: { host: 'localhost:3002' },
        protocol: 'http',
      };
  
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
  
      model.getNeedById = jest.fn().mockResolvedValueOnce({
        id: 1,
        NeedIs: 'Test Need',
        Title: 'Test Title',
        ContactPerson: 'Test Person',
        Keywords: 'Test Keywords',
        Proposal: 'Test Proposal',
        Solution: 'Test Solution',
        CreatedAt: new Date(),
        HasFile: 'file',
      });
  
      await controller.getNeed(mockReq, mockRes);
  
      expect(model.getNeedById).toHaveBeenCalledTimes(1);
      expect(model.getNeedById).toHaveBeenCalledWith(1);
  
      expect(mockRes.status).toHaveBeenCalledTimes(0);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        body: {
          id: 1,
          NeedIs: 'Test Need',
          Title: 'Test Title',
          ContactPerson: 'Test Person',
          Keywords: 'Test Keywords',
          Proposal: 'Test Proposal',
          Solution: 'Test Solution',
          CreatedAt: expect.any(Date),
          fileURL: 'http://localhost:3002/api/v1/download/1',
        },
      });
    });
    test('if the need is not found return a 404 status', async () => {
      const mockReq = {
        params: { id: 1 },
        headers: { host: 'localhost:3002' },
        protocol: 'http',
      };
    
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
    
      model.getNeedById = jest.fn().mockResolvedValueOnce(null);
    
      const mockError = jest.spyOn(console, 'error');
      mockError.mockImplementation(() => {}); 
    
      await controller.getNeed(mockReq, mockRes);
    
      expect(model.getNeedById).toHaveBeenCalledTimes(1);
      expect(model.getNeedById).toHaveBeenCalledWith(1);
    
      expect(mockRes.status).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Need is not found' });
    
      mockError.mockRestore(); 
    });
  
    test('return a 500 status', async () => {
      const mockReq = {
        params: { id: 1 },
        headers: { host: 'localhost:3002' },
        protocol: 'http',
      };
  
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
  
      model.getNeedById = jest.fn().mockRejectedValueOnce(new Error('Database connection error'));

      const mockError = jest.spyOn(console, 'error');
      mockError.mockImplementation(() => {}); 
    
      await controller.getNeed(mockReq, mockRes);
  
      expect(model.getNeedById).toHaveBeenCalledTimes(1);
      expect(model.getNeedById).toHaveBeenCalledWith(1);
  
      expect(mockRes.status).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
      mockError.mockRestore();
    });
    test('need with "no file" URL if HasFile is not "file"', async () => {
      const mockReq = {
        params: { id: 1 },
        headers: { host: 'localhost:3002' },
        protocol: 'http',
      };
  
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
  
      model.getNeedById = jest.fn().mockResolvedValueOnce({
        id: 1,
        NeedIs: 'Test Need',
        Title: 'Test Title',
        ContactPerson: 'Test Person',
        Keywords: 'Test Keywords',
        Proposal: 'Test Proposal',
        Solution: 'Test Solution',
        CreatedAt: new Date(),
        HasFile: 'no file',
      });
  
      await controller.getNeed(mockReq, mockRes);
  
      expect(model.getNeedById).toHaveBeenCalledTimes(1);
      expect(model.getNeedById).toHaveBeenCalledWith(1);
  
      expect(mockRes.status).toHaveBeenCalledTimes(0);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        body: {
          id: 1,
          NeedIs: 'Test Need',
          Title: 'Test Title',
          ContactPerson: 'Test Person',
          Keywords: 'Test Keywords',
          Proposal: 'Test Proposal',
          Solution: 'Test Solution',
          CreatedAt: expect.any(Date),
          fileURL: 'no file',
        },
      });
    });

    test('return need with file URL for a nonlocal host', async () => {
      const mockReq = {
        params: { id: 1 },
        headers: { host: 'www.innocloud.dk' },
        protocol: 'https',
      };
    
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
    
      model.getNeedById = jest.fn().mockResolvedValueOnce({
        id: 1,
        NeedIs: 'Test Need',
        Title: 'Test Title',
        ContactPerson: 'Test Person',
        Keywords: 'Test Keywords',
        Proposal: 'Test Proposal',
        Solution: 'Test Solution',
        CreatedAt: new Date(),
        HasFile: 'file',
      });
    
      const mockError = jest.spyOn(console, 'error');
      mockError.mockImplementation(() => {}); 
    
      await controller.getNeed(mockReq, mockRes);
    
      expect(model.getNeedById).toHaveBeenCalledTimes(1);
      expect(model.getNeedById).toHaveBeenCalledWith(1);
    
      expect(mockRes.status).toHaveBeenCalledTimes(0);
      expect(mockRes.json).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        body: {
          id: 1,
          NeedIs: 'Test Need',
          Title: 'Test Title',
          ContactPerson: 'Test Person',
          Keywords: 'Test Keywords',
          Proposal: 'Test Proposal',
          Solution: 'Test Solution',
          CreatedAt: expect.any(Date),
          fileURL: 'https://www.innocloud.dk/api/v1/download/1',
        },
      });      
      mockError.mockRestore(); 
    });
});
  
  