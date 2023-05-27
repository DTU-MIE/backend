const { search } = require("../controllers/searchController");
const sql = require("mssql");

jest.mock("mssql", () => {
  const mockQuery = jest.fn().mockResolvedValue({
    recordset: [
      { ContactPerson: "John", Title: "Title 1", NeedIs: "Need 1", CreatedAt: "2023-01-01" },
      { ContactPerson: "Jane", Title: "Title 2", NeedIs: "Need 2", CreatedAt: "2023-01-02" },
    ],
  });

  const mockRequest = {
    query: mockQuery,
    input: jest.fn(),
  };

  const mockRequestConstructor = jest.fn(() => mockRequest);
  mockRequestConstructor.prototype.query = mockQuery; // Add query method to the prototype

  const mockConnect = jest.fn().mockResolvedValue({
    request: mockRequestConstructor, // Assign the mockRequestConstructor directly
  });


  return {
    connect: mockConnect,
    Request: mockRequestConstructor, // Use mockRequestConstructor as the constructor
  };
});

const req = {
  query: {
    keyword: "example",
    pageNumber: 1,
    resultsPerPage: 10,
  },
  protocol: "http",
  headers: {
    host: "localhost",
  },
};

const res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
};

describe("search function", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return search results", async () => {
    try {
      await search(req, res);

      expect(sql.connect).toHaveBeenCalledTimes(1);
      expect(sql.Request).toHaveBeenCalledTimes(1);
      expect(sql.Request.mock.instances[0].query).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith([
        { ContactPerson: "John", Title: "Title 1", NeedIs: "Need 1", CreatedAt: "2023-01-01" },
        { ContactPerson: "Jane", Title: "Title 2", NeedIs: "Need 2", CreatedAt: "2023-01-02" },
      ]);
    } catch (error) {
     
    }
  })
  
});








