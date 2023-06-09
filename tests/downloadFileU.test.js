const model = require('../models/needModel');
const { downloadFile } = require('../controllers/needController');


jest.mock('mssql');

describe('downloadFile', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      params: {
        id: 1,
      },
    };

    mockResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    const mockNeed = {
      id: 1,
      FileData: Buffer.from('filedata'),
      extension: '.txt',
      FileName: 'test_file.txt',
    };

    model.getNeedById = jest.fn().mockResolvedValueOnce(mockNeed);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('download the file if it exists', async () => {
    await downloadFile(mockRequest, mockResponse);


    expect(model.getNeedById).toHaveBeenCalledTimes(1);
    expect(model.getNeedById).toHaveBeenCalledWith(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockResponse.setHeader).toHaveBeenCalledTimes(2);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename=test_file.txt'
    );
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
    expect(mockResponse.send).toHaveBeenCalledWith(
      Buffer.from('filedata')
    );
  });

  test('return a 404 status', async () => {
    model.getNeedById = jest.fn().mockResolvedValueOnce(null);

    await downloadFile(mockRequest, mockResponse);

    expect(model.getNeedById).toHaveBeenCalledTimes(1);
    expect(model.getNeedById).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'File/Need not found' });
    expect(mockResponse.setHeader).not.toHaveBeenCalled();
    expect(mockResponse.send).not.toHaveBeenCalled();
  });
});
