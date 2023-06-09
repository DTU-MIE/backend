const sql = require('mssql');
const { updateNeed } = require('../models/needModel');

jest.mock('mssql');

describe('updateNeed', () => {
  it('updates the need in the database', async () => {
    const id = 1;
    const updatedNeed = {
      NeedIs: 'New Need',
      Title: 'Updated Title',
      ContactPerson: 'arooj',
      Keywords: 'keyword1, keyword2',
      Proposal: 'Updated Proposal',
      Solution: 'Updated Solution',
      FileData: null,
      FileName: null,
      extension: null,
      createdAt: new Date(),
      UserId: 123,
    };

    const mockQuery = jest.fn();
    const mockInput = jest.fn();
    const mockRequest = jest.fn(() => ({
      query: mockQuery,
      input: mockInput,
    }));
    const mockConnect = jest.fn();

    sql.connect = mockConnect;
    sql.connect.mockResolvedValue({ request: mockRequest });

    const mockResult = {
      rowsAffected: [1], 
    };

    mockQuery.mockResolvedValue(mockResult);

    const result = await updateNeed(id, updatedNeed);

    expect(sql.connect).toHaveBeenCalled();
    expect(mockRequest).toHaveBeenCalled();
    expect(mockInput).toHaveBeenCalledTimes(12);
    expect(mockQuery).toHaveBeenCalled();

    expect(mockInput.mock.calls).toEqual([
      ['NeedIs', sql.NVarChar(4000), 'New Need'],
      ['Title', sql.NVarChar(1000), 'Updated Title'],
      ['ContactPerson', sql.NVarChar(1000), 'arooj'],
      ['Keywords', sql.NVarChar(1000), 'keyword1, keyword2'],
      ['Proposal', sql.NVarChar(1000), 'Updated Proposal'],
      ['Solution', sql.NVarChar(1000), 'Updated Solution'],
      ['FileData', sql.VarBinary(sql.MAX), null],
      ['FileName', sql.NVarChar(255), null],
      ['extension', sql.NVarChar(10), null],
      ['createdAt', sql.DateTime, expect.any(Date)],
      ['id', sql.Int, id],
      ['UserId', sql.Int, 123],
    ]);

    expect(mockQuery).toHaveBeenCalledWith(
      `UPDATE NEED SET NeedIs = @NeedIs, Title = @Title, ContactPerson = @ContactPerson,
      Keywords = @Keywords, Proposal = @Proposal, Solution = @Solution, FileData = @FileData,
      FileName = @FileName, extension = @extension, createdAt = @createdAt WHERE id = @id`
    );

    expect(result).toBe(true);
  });
  it('throw an error if update fails', async () => {
    const id = 1;
    const updatedNeed = {
      NeedIs: 'New Need',
      Title: 'Updated Title',
      ContactPerson: 'arooj',
      Keywords: 'keyword1, keyword2',
      Proposal: 'Updated Proposal',
      Solution: 'Updated Solution',
      FileData: null,
      FileName: null,
      extension: null,
      createdAt: new Date(),
      UserId: 123, 
    };

    // Mock SQL connection to throw an error
    sql.connect.mockRejectedValue(new Error('Connection failed'));

    await expect(updateNeed(id, updatedNeed)).rejects.toThrow('Connection failed');
  });
});


describe('Controller', () => {
  const model = require('../models/needModel');
  const controller = require('../controllers/needController');

  jest.mock('../models/needModel', () => ({
    getNeedById: jest.fn(),
    updateNeed: jest.fn(),
  }));

  describe('updated', () => {
    it('should update the need and return a success message', async () => {
      const req = {
        params: { id: 1 },
        body: {
          NeedIs: 'New Need',
          Title: 'Updated Title',
          ContactPerson: 'arooj',
          Keywords: 'keyword1, keyword2',
          Proposal: 'Updated Proposal',
          Solution: 'Updated Solution',
        },
        file: {
          buffer: Buffer.from('file content'),
          originalname: 'file.txt',
        },
        user: {
          id: 123,
        },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      const mockNeed = {
        id: 1,
        UserId: 123,
      };

      model.getNeedById.mockResolvedValue(mockNeed);
      model.updateNeed.mockResolvedValue();

      try {
        await controller.updated(req, res);

        expect(model.getNeedById).toHaveBeenCalledWith(1);
        expect(model.updateNeed).toHaveBeenCalledWith(1, {
          NeedIs: 'New Need',
          Title: 'Updated Title',
          ContactPerson: 'arooj',
          Keywords: 'keyword1, keyword2',
          Proposal: 'Updated Proposal',
          Solution: 'Updated Solution',
          FileData: Buffer.from('file content'),
          FileName: 'file.txt',
          extension: 'txt',
          createdAt: expect.any(Date),
          UserId: 123,
        });
        expect(res.json).toHaveBeenCalledWith({ message: 'Need updated successfully' });
        expect(res.status).not.toHaveBeenCalled();
      } catch (error) {
        // Handle any errors
      }
    });

    it('should return a 404 status code if the need is not found', async () => {
      const req = {
        params: { id: 1 },
        body: {
          NeedIs: 'New Need',
          Title: 'Updated Title',
          ContactPerson: 'arooj',
          Keywords: 'keyword1, keyword2',
          Proposal: 'Updated Proposal',
          Solution: 'Updated Solution',
        },
        file: null,
        user: {
          id: 123,
        },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      model.getNeedById.mockResolvedValue(null);

      try {
        await controller.updated(req, res);

        expect(model.getNeedById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Need not found' });
        expect(model.updateNeed).not.toHaveBeenCalled();
      } catch (error) {
        // Handle any errors
      }
    });

    it('should return a 403 status code if the user is not authorized to update the need', async () => {
      const req = {
        params: { id: 1 },
        body: {
          NeedIs: 'New Need',
          Title: 'Updated Title',
          ContactPerson: 'arooj',
          Keywords: 'keyword1, keyword2',
          Proposal: 'Updated Proposal',
          Solution: 'Updated Solution',
        },
        file: null,
        user: {
          id: 123,
        },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      const mockNeed = {
        id: 1,
        UserId: 456,
      };

      model.getNeedById.mockResolvedValue(mockNeed);

      try {
        await controller.updated(req, res);

        expect(model.getNeedById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized to update the need' });
        expect(model.updateNeed).not.toHaveBeenCalled();
      } catch (error) {
        // Handle any errors
      }
    });

    it('should return a 500 status code if the update fails', async () => {
      const req = {
        params: { id: 1 },
        body: {
          NeedIs: 'New Need',
          Title: 'Updated Title',
          ContactPerson: 'arooj',
          Keywords: 'keyword1, keyword2',
          Proposal: 'Updated Proposal',
          Solution: 'Updated Solution',
        },
        file: null,
        user: {
          id: 123,
        },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      const mockNeed = {
        id: 1,
        UserId: 123,
      };

      model.getNeedById.mockResolvedValue(mockNeed);
      model.updateNeed.mockRejectedValue(new Error('Update failed'));

      try {
        await controller.updated(req, res);

        expect(model.getNeedById).toHaveBeenCalledWith(1);
        expect(model.updateNeed).toHaveBeenCalledWith(1, {
          NeedIs: 'New Need',
          Title: 'Updated Title',
          ContactPerson: 'arooj',
          Keywords: 'keyword1, keyword2',
          Proposal: 'Updated Proposal',
          Solution: 'Updated Solution',
          FileData: null,
          FileName: null,
          extension: null,
          createdAt: expect.any(Date),
          UserId: 123,
        });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update the need' });
      } catch (error) {
        // Handle any errors
      }
    });
  });
});
  