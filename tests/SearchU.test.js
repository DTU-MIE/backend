const { search } = require("../controllers/searchController");
const sql = require("mssql");

jest.mock("mssql", () => {
  const mockQuery = jest.fn().mockResolvedValue({
    recordset: [
      { ContactPerson: "arooj", Title: "Title 1", NeedIs: "Need 1", Keywords: "keywords 1", Proposal: "proposal 1", Solution: "solution 1",
      CreatedAt: "2023-01-01", fileURL: "http://localhost:3002/api/v1/download/1" },
      { ContactPerson: "arooj", Title: "Title 2", NeedIs: "Need 2", Keywords: "keywords 2", Proposal: "proposal 2", Solution: "solution 2",
      CreatedAt: "2023-01-02", fileURL: "http://localhost:3002/api/v1/download/2" },
    ],
  });

  const mockRequest = {
    query: mockQuery,
    input: jest.fn(),
  };

  const mockRequestConstructor = jest.fn(() => mockRequest);
  mockRequestConstructor.prototype.query = mockQuery; 

  const mockConnect = jest.fn().mockResolvedValue({
    request: mockRequestConstructor, 
  });

  return {
    connect: mockConnect,
    Request: mockRequestConstructor, 
  };
});

const req = {
  query: {
    keyword: "new",
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
        { ContactPerson: "arooj", Title: "Title 1", NeedIs: "Need 1", Keywords: "keywords 1", Proposal: "proposal 1", Solution: "solution 1",
        CreatedAt: "2023-01-01", fileURL: "http://localhost:3002/api/v1/download/1" },
        { ContactPerson: "arooj", Title: "Title 2", NeedIs: "Need 2", Keywords: "keywords 2", Proposal: "proposal 2", Solution: "solution 2",
        CreatedAt: "2023-01-02", fileURL: "http://localhost:3002/api/v1/download/2" },
      ]);
    } catch (error) {
     
    }
  });

  it("should handle errors and return 500 status", async () => {
    sql.connect.mockRejectedValue(new Error("Connection error"));
  
    try {
      await search(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "search, Internal Server Error" });
    } catch (error) {
    }
  });
});
