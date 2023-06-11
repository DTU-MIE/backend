const request = require('supertest');
const express = require('express');
const router = require('../routes/searchRoutes');
const searchController = require('../controllers/searchController');
const auth = require('../middleware/auth');

jest.mock('../controllers/searchController', () => ({
    search: jest.fn(),
  }));
  jest.mock('../config/config', () => ({
    AUTH_KEY: 'test-auth-key', 
  }));  

describe('GET /search', () => {
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

    it('return the search results', async () => {
      const token = auth.generateToken({ userId: 123 });
      searchController.search.mockImplementation(async (req, res) => {
        res.send([
          { ContactPerson: 'arooj', Title: 'Title 1', NeedIs: 'Need 1', Keywords: "keywords 1", Proposal: "proposal 1", Solution: "solution 1",
          CreatedAt: '2023-01-01' },
          { ContactPerson: 'arooj', Title: 'Title 2', NeedIs: 'Need 2', Keywords: "keywords 2", Proposal: "proposal 2", Solution: "solution 2",
          CreatedAt: '2023-01-02' },
        ]);
      });
  
      const response = await request(app)
        .get('/api/v1/search')
        .set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { ContactPerson: 'arooj', Title: 'Title 1', NeedIs: 'Need 1', Keywords: "keywords 1", Proposal: "proposal 1", Solution: "solution 1",
        CreatedAt: '2023-01-01' },
        { ContactPerson: 'arooj', Title: 'Title 2', NeedIs: 'Need 2', Keywords: "keywords 2", Proposal: "proposal 2", Solution: "solution 2",
        CreatedAt: '2023-01-02' },
      ]);
  
      expect(searchController.search).toHaveBeenCalledTimes(1);
  
      if (response.status !== 200) {
      }
    });
  });
  