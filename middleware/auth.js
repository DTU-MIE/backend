const express = require("express");
const bcrypt = require('bcrypt');
const app = express();
const session = require('express-session');
const { getUserByEmailAndPassword } = require('../models/userModel');
const {
    SESSION_SECRET
  } = require("../config/config");
// set up session middleware
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  }));

async function authenticate(req, res, next) {
  try {
    const { email, password } = req.body;
    
    const user = await getUserByEmailAndPassword(email, password);
    console.log("it is here");
    console.log(email, password);
    if (!user) {
      return res.status(401).json({ message: 'The user does not exist' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'The password is wrong' });
    }

   
    const role = user.profession === 'Health Care Professional' ? 'Admin' : 'User';
    if (user.profession === 'student') {
      role = 'User';
    }
    req.session.user = { email: user.email, role };
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

  // authorize user only access certain endpoint, but for now there is no privilages assigneed
async  function authorize(roles) {
    return (req, res, next) => {
      const userRole = req.session.user.role;
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: 'You are not authorized to access this resource' });
      }
      next();
    };
  }


module.exports = {
  authenticate,
  authorize
};
