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

    it('should return search results', async () => {
        const token = auth.generateToken({ userId: 123 });
      // Mock the search function
      searchController.search.mockImplementation(async (req, res) => {
        // Mock the behavior of the search function
        res.send([
          { ContactPerson: 'John', Title: 'Title 1', NeedIs: 'Need 1', CreatedAt: '2023-01-01' },
          { ContactPerson: 'Jane', Title: 'Title 2', NeedIs: 'Need 2', CreatedAt: '2023-01-02' },
        ]);
      });
  
      // Make the request to the route
      const response = await request(app)
        .get('/api/v1/search')
        .set('Authorization', `Bearer ${token}`);
  
      // Assertion
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { ContactPerson: 'John', Title: 'Title 1', NeedIs: 'Need 1', CreatedAt: '2023-01-01' },
        { ContactPerson: 'Jane', Title: 'Title 2', NeedIs: 'Need 2', CreatedAt: '2023-01-02' },
      ]);
  
      // Additional assertions for the search function
      expect(searchController.search).toHaveBeenCalledTimes(1);
      // You can add more expectations for the search function if needed
  
      // Handle any errors here
      if (response.status !== 200) {
        //Handle error cases
      }
    });
  });
  