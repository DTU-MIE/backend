const bcrypt = require('bcrypt');
const sql = require("mssql");
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require("../config/config");
const { createUser, getUserByEmailAndPassword, Blacklist } = require('../models/userModel');
const { generateToken } = require('../middleware/auth');

async function registerUser(req, res) {
    try {
      const { id, name, email, password, organization, department, profession } = req.body;
  
      const userId = await createUser({
        id,
        name,
        email,
        password,
        organization,
        department,
        profession
      });
  
      const token = jwt.sign({ email, role: profession === 'Sundhedsprofessionel' ? 'Admin' : profession === 'studerende' ? 'User' : 'Unknown' }, SECRET_KEY);
      console.log('Received registration request:', req.body);
  
      res.status(201).json({
        userId,
        message: 'Registration was successful',
        token
      });
    } catch (error) {
      if (error.message === 'Email already registered') {
        return res.status(400).json({ message: 'Email already registered' });
      }
      console.log('Error:', error); 
      res.status(500).json({ message: 'Internal server error' });
    }
};



async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        const user = await getUserByEmailAndPassword(email, password);

        if (!user) {
            return res.status(401).send({ message:'Incorrect email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send({ message:'Incorrect email or password' });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            profession: user.profession
        };

        const token = generateToken(tokenPayload);

        res.status(200).send({ token });
    } catch (error) {
        res.status(500).send({ message:'Error occurred while logging in' });
    }
}

async function logoutUser(req, res) {
    try {
      const token = req.headers.authorization.split(' ')[1];
  
      await Blacklist(token);
  
      res.send({ message: 'user is logged out' });
    } catch (error) {
      res.sendStatus(500);
    }
}




module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
