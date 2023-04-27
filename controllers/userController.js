const bcrypt = require('bcrypt');
const { createUser } = require('../models/userModel');

async function registerUser(req, res) {
    try {
      const { id, name, email, password, organization, department, profession } = req.body;
  
      if (!email.endsWith('gmail.com') && !email.endsWith('dtu.dk')) {
        return res.status(400).json({ message: 'Invalid email domain' });
      }
  
      const userId = await createUser({
        id,
        name,
        email,
        password,
        organization,
        department,
        profession
      });
  
      req.session.user = { email, role: profession === 'Health Care Professional' ? 'Admin' : 'User' };
  
      res.status(201).json({
        userId,
        message: 'Registration was successful'
      });
    } catch (error) {
      console.error(error);
  
      if (error.message === 'Email already registered') {
        return res.status(400).json({ message: 'Email already registered' });
      }
  
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  

function loginUser(req, res) {
    //from session
    if (req.session.user) {
      res.json({ message: 'Logged in successfully' });
    } else {
      res.status(401).json({ message: 'You are not logged in' });
    }
  }

function logoutUser(req, res) {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
