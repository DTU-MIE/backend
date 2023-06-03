const { logoutUser } = require('../controllers/userController');
const { Blacklist } = require('../models/userModel');

jest.mock('../models/userModel', () => {
  return {
    Blacklist: jest.fn(),
  };
});

describe('logoutUser', () => {
  test('blacklist the token and send a success message', async () => {
    const req = { headers: { authorization: 'Bearer some-token' } };
    const res = { send: jest.fn() };

    Blacklist.mockResolvedValue(); 

    await logoutUser(req, res);

    expect(Blacklist).toHaveBeenCalledWith('some-token');
    expect(res.send).toHaveBeenCalledWith({ message: 'user is logged out' });
  });

  test('handle errors and send 500 status', async () => {
    const req = { headers: { authorization: 'Bearer some-token' } };
    const res = { sendStatus: jest.fn() };

    const error = new Error('Some error');
    Blacklist.mockRejectedValue(error); 

    console.error = jest.fn();

    await logoutUser(req, res);

    expect(Blacklist).toHaveBeenCalledWith('some-token');
    expect(res.sendStatus).toHaveBeenCalledWith(500);
  });
});
