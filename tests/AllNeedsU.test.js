const model = require('../models/needModel');
const controller = require('../controllers/needController');

jest.mock('mssql');

describe('All Needs Unit Test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('return all needs with file URL if file exists', async () => {
    const mockNeeds = [
      {
        id: 1,
        NeedIs: 'Some Need',
        Title: 'Test Need',
        ContactPerson: 'arooj',
        CreatedAt: '2023-01-01',
        Keywords: 'test, need',
        Proposal: 'Some proposal',
        Solution: 'Some solution',
        HasFile: 'file',
      },
      {
        id: 2,
        NeedIs: 'Another Need',
        Title: 'Another Test Need',
        ContactPerson: 'arooj',
        CreatedAt: '2023-01-02',
        Keywords: 'another, test, need',
        Proposal: 'Another proposal',
        Solution: 'Another solution',
        HasFile: 'file',
      },
    ];

    const mockPool = {
      request: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValueOnce({ recordset: mockNeeds }),
      close: jest.fn(),
    };
    const mockConnect = jest.fn().mockResolvedValue(mockPool);
    const sqlMock = require('mssql');
    sqlMock.connect = mockConnect;

    const mockRequest = {
      protocol: 'http',
      headers: { host: 'localhost:3002' },
    };
    const mockJson = jest.fn();
    const mockResponse = {
      json: mockJson,
    };

    await controller.allNeeds(mockRequest, mockResponse);

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockPool.request).toHaveBeenCalledTimes(1);
    expect(mockPool.query).toHaveBeenCalledTimes(1);
    expect(mockPool.query).toHaveBeenCalledWith(expect.any(String));
    expect(mockPool.close).toHaveBeenCalledTimes(1);

    expect(mockJson).toHaveBeenCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith({
      body: [
        {
          id: 1,
          NeedIs: 'Some Need',
          Title: 'Test Need',
          ContactPerson: 'arooj',
          CreatedAt: '2023-01-01',
          Keywords: 'test, need',
          Proposal: 'Some proposal',
          Solution: 'Some solution',
          fileURL: 'http://localhost:3002/api/v1/download/1',
        },
        {
          id: 2,
          NeedIs: 'Another Need',
          Title: 'Another Test Need',
          ContactPerson: 'arooj',
          CreatedAt: '2023-01-02',
          Keywords: 'another, test, need',
          Proposal: 'Another proposal',
          Solution: 'Another solution',
          fileURL: 'http://localhost:3002/api/v1/download/2',
        },
      ],
    });
  });


  test('return all needs with "no file" if file does not exist', async () => {
    const mockNeeds = [
      {
        id: 1,
        NeedIs: 'Some Need',
        Title: 'Test Need',
        ContactPerson: 'arooj',
        CreatedAt: '2023-01-01',
        Keywords: 'test, need',
        Proposal: 'Some proposal',
        Solution: 'Some solution',
        HasFile: 'no file',
      },
    ];

    model.getAllNeeds = jest.fn().mockResolvedValueOnce(mockNeeds);
    const mockRequest = {
      protocol: 'http',
      headers: { host: 'localhost:3002' },
    };
    const mockJson = jest.fn();
    const mockResponse = {
      json: mockJson,
    };

    await controller.allNeeds(mockRequest, mockResponse);

    expect(model.getAllNeeds).toHaveBeenCalledTimes(1);
    expect(mockJson).toHaveBeenCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith({
      body: [
        {
          id: 1,
          NeedIs: 'Some Need',
          Title: 'Test Need',
          ContactPerson: 'arooj',
          CreatedAt: '2023-01-01',
          Keywords: 'test, need',
          Proposal: 'Some proposal',
          Solution: 'Some solution',
          fileURL: 'no file',
        },
      ],
    });
  });

  test('return a 500 status', async () => {
    const mockError = new Error('Internal Server Error');
    model.getAllNeeds = jest.fn().mockRejectedValueOnce(mockError);    
    const mockRequest = {
      protocol: 'http',
      headers: { host: 'localhost:3002' },
    };

    const mockJson = jest.fn();
    const mockStatus = jest.fn(() => ({ json: mockJson }));
    const mockResponse = { status: mockStatus };
    const consoleErrorMock = jest.spyOn(console, 'error');
    consoleErrorMock.mockImplementation(() => {});
  

    await controller.allNeeds(mockRequest, mockResponse);
  

    expect(model.getAllNeeds).toHaveBeenCalledTimes(1);
    expect(mockStatus).toHaveBeenCalledTimes(1);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    consoleErrorMock.mockRestore();
  });
  
});
