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
        return res.sendStatus(401);
    }

    try {
        req.user = verifyToken(token);
        next();
    } catch (error) {
        res.sendStatus(403);
    }
}


//   // authorize user only access certain endpoint, but for now there is no privilages assigneed
// async  function authorize(roles) {
//     return (req, res, next) => {
//       const userRole = req.session.user.role;
//       if (!roles.includes(userRole)) {
//         return res.status(403).json({ message: 'You are not authorized to access this resource' });
//       }
//       next();
//     };
//   }

module.exports = {
    generateToken,
    authenticateToken
};
