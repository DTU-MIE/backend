const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  logoutUser
} = require('../controllers/userController');

//register user
router.post('/register', registerUser);

//login user
router.post('/login', authenticate, loginUser);

//logout user
router.post('/logout', logoutUser);
//only student can acccess this endpoint
router.get('/privilages', authorize(['student']), (req, res) => {
    res.json({ message: 'This endpoint can only be accessed by student' });
  });

module.exports = router;


