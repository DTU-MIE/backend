const model = require('../models/needModel');
const controller = require('../controllers/needController');

jest.mock('mssql');

describe('All Needs Unit Test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return all needs with file URLs if file exists', async () => {
    // Mock the result of getAllNeeds
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

    //Mock the database connection and query execution
    const mockPool = {
      request: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValueOnce({ recordset: mockNeeds }),
      close: jest.fn(),
    };
    const mockConnect = jest.fn().mockResolvedValue(mockPool);
    const sqlMock = require('mssql');
    sqlMock.connect = mockConnect;

    //Mock the request and response objects
    const mockRequest = {
      protocol: 'http',
      headers: { host: 'localhost:3002' },
    };
    const mockJson = jest.fn();
    const mockResponse = {
      json: mockJson,
    };

    //Call the controller function
    await controller.allNeeds(mockRequest, mockResponse);

    //Verify the expectations
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


  test('should return all needs with "no file" if file does not exist', async () => {
    //Mock the result of getAllNeeds
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

    //Mock the getAllNeeds function
    model.getAllNeeds = jest.fn().mockResolvedValueOnce(mockNeeds);

    //Mock the request and response objects
    const mockRequest = {
      protocol: 'http',
      headers: { host: 'localhost:3002' },
    };
    const mockJson = jest.fn();
    const mockResponse = {
      json: mockJson,
    };

    // Call the controller function
    await controller.allNeeds(mockRequest, mockResponse);

    // Verify the expectations
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

  test('should return a 500 status if an error occurs', async () => {
    // Mock the error from getAllNeeds
    const mockError = new Error('Internal Server Error');
  
    // Mock the getAllNeeds function to throw an error
    model.getAllNeeds = jest.fn().mockRejectedValueOnce(mockError);
  
    // Mock the request and response objects
    const mockRequest = {
      protocol: 'http',
      headers: { host: 'localhost:3002' },
    };
    const mockJson = jest.fn();
    const mockStatus = jest.fn(() => ({ json: mockJson }));
    const mockResponse = { status: mockStatus };
  
    // Mock the console.error function
    const consoleErrorMock = jest.spyOn(console, 'error');
    consoleErrorMock.mockImplementation(() => {});
  
    // Call the controller function
    await controller.allNeeds(mockRequest, mockResponse);
  
    // Verify the expectations
    expect(model.getAllNeeds).toHaveBeenCalledTimes(1);
    expect(mockStatus).toHaveBeenCalledTimes(1);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  
    // Restore the original console.error function
    consoleErrorMock.mockRestore();
  });
  
});
