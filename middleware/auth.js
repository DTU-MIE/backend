const jwt = require('jsonwebtoken');
const {
    AUTH_KEY
  } = require("../config/config");

function generateToken(payload) {
    return jwt.sign(payload, AUTH_KEY, { expiresIn: '1h' });
}

function verifyToken(token) {
    return jwt.verify(token, AUTH_KEY);
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      req.user = verifyToken(token);
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid token' });
    }
  }
  
//authorized user only access certain endpoint, but for now there is no privilages assigneed to this
async function authorize(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
      if (!token) {
          console.log('No token provided');
          return res.status(401).send({ message: 'No token provided' });
      }

      const decodedToken = verifyToken(token);

      console.log('Decoded Token:', decodedToken);

      if (decodedToken.profession !== 'Sundhedsprofessionel') {
          console.log('Invalid profession:', decodedToken.profession);
          return res.status(403).send({ message: 'Access denied. Only Sundhedsprofessionel are allowed.' });
      }

      req.user = decodedToken;
      next();
  } catch (error) {
      console.log('Invalid token:', error);
      res.status(401).send({ message: 'Invalid token' });
  }
}


module.exports = {
    generateToken,
    authenticateToken,
    authorize
};