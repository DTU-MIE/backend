const express = require('express');
const router = express.Router();
const { authenticateToken} = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  logoutUser
} = require('../controllers/userController');

//register user
router.post('/register', registerUser);
//login user
router.post('/login', loginUser);

//to check if authentication works and gives user information
router.get('/profile', authenticateToken, (req, res) => {
    res.send(req.user);
});
//logout user
router.post('/logout', authenticateToken, logoutUser);


module.exports = router;
 

