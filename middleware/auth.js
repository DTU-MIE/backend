const jwt = require('jsonwebtoken');
const {
  PROD_AUTH_KEY, AUTH_KEY, NODE_ENV
  } = require("../config/config");


function generateToken(payload) {
    let authKey;
  
    if (process.env.NODE_ENV === 'production') {
      authKey = PROD_AUTH_KEY;
    } else {
      authKey = AUTH_KEY;
    }
  
    return jwt.sign(payload, authKey, { expiresIn: '1h' });
}
  

function verifyToken(token) {
  let authKey;

  if (process.env.NODE_ENV === 'production') {
    authKey = PROD_AUTH_KEY;
  } else {
    authKey = AUTH_KEY;
  }

  return jwt.verify(token, authKey);
}

async function authenticateToken(req, res, next) {
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