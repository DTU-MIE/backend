// Import necessary modules and dependencies
const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = require('../routes/needRoutes');
const app = express(); 
const model = require('../models/needModel'); 
const needController = require('../controllers/needController'); 
const config = require('../config/config'); 

const mockNeed = {
  ID: 1,
  FileData: Buffer.from('mocked_file_data').toString('base64'),
  extension: 'pdf',
  FileName: 'mocked_file.pdf',
};

jest.mock('../models/needModel', () => ({
  getNeedById: jest.fn((id) => {
    console.log('getNeedById called with id:', id);
    const needId = parseInt(id, 10); 
    return { ...mockNeed, ID: needId };
  }),
}));

// Mock the config module
jest.mock('../config/config', () => ({
  AUTH_KEY: 'mocked_auth_key', 
}));

// Mock the Express route
router.get('/download/:id', (req, res) => {
  return needController.downloadFile(req, res); 
});

// Use the router in the Express app
app.use(router);

// Define the test case
describe('Download File API', () => {
  // Mock the need data

  // Test the API endpoint
  it('should download the file successfully', async () => {
    // Mock the model function to return the need data
    model.getNeedById.mockResolvedValueOnce(mockNeed);

    // Mock the authentication token
    const mockToken = 'mocked_token';

    // Mock the AUTH_KEY value
    jest.replaceProperty(config, 'AUTH_KEY', 'mocked_auth_key');

    // Mock the jwt.verify function
    jwt.verify = jest.fn().mockReturnValue({ id: 1 });

    // Send a request to the API endpoint
    const response = await request(app)
      .get('/download/1')
      .set('Authorization', `Bearer ${mockToken}`);

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe('application/pdf');
    expect(response.header['content-disposition']).toBe(
      'attachment; filename=mocked_file.pdf'
    );
    expect(response.body.toString('base64')).toBe(
      Buffer.from('mocked_file_data').toString('base64')
    );

    // Verify that the model function is called with the correct parameters
    expect(model.getNeedById).toHaveBeenCalledWith('1');

    // Verify that the jwt.verify function is called with the correct parameters
    expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'mocked_auth_key');
  });
});
