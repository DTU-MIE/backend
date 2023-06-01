const model = require('../models/needModel'); 
const { deleted } = require('../controllers/needController'); 


jest.mock('../models/needModel'); 

describe('deleted', () => {
    let req, res;
  
    beforeEach(() => {
      req = { params: { id: '123' } };
      res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('delete the need', async () => {
      model.deleteNeed.mockResolvedValue(true);
  
      await deleted(req, res);
  

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Need deleted successfully' });
    });
  
    test('if the need is not found', async () => {
      model.deleteNeed.mockResolvedValue(false);
  
      await deleted(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Need not found' });
    });
  
    test('return error message if there is an error deleting the need', async () => {
        const errorMessage = 'Database error';
      
        model.deleteNeed.mockRejectedValue(new Error(errorMessage));
      
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
        await deleted(req, res);
      
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Failed to delete need' });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting need:', new Error(errorMessage));
        consoleErrorSpy.mockRestore();
      });
      
  });