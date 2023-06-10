const request = require('supertest');
const express = require('express');
const router = require('../routes/needRoutes');
const app = express(); 
const model = require('../models/needModel'); 
const needController = require('../controllers/needController'); 

const mockNeed = {
  ID: 1,
  FileData: Buffer.from('filedata'),
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

jest.mock('../config/config', () => ({
  AUTH_KEY: 'mocked_auth_key', 
}));
jest.mock('../middleware/auth', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 123 }; 
    next(); 
  }),
}));

router.get('/download/:id', (req, res) => {
  return needController.downloadFile(req, res); 
});


app.use(router);

describe('Download File API', () => {
  it('download the file successfully', async () => {

    model.getNeedById.mockResolvedValueOnce(mockNeed);

    const mockToken = 'mocked_token';

    const response = await request(app)
      .get('/download/1')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe('application/pdf');
    expect(response.header['content-disposition']).toBe('attachment; filename=mocked_file.pdf');
    expect(response.body).toEqual(mockNeed.FileData);
    expect(model.getNeedById).toHaveBeenCalledWith('1');
  });
});
