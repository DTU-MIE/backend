const bcrypt = require('bcrypt');
const { createUser, getUserByEmailAndPassword, Blacklist } = require('../models/userModel');
const { generateToken } = require('../middleware/auth');



async function registerUser(req, res) {
    try {
        const { id, name, email, password, organization, department, profession } = req.body;

        if (!email.endsWith('regionh.dk') && !email.endsWith('dtu.dk')) {
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
        return res.status(400).json({ message:'Email already registered' });
        }

        res.status(500).json({ message:'Internal server error' });
    }
}



async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        const user = await getUserByEmailAndPassword(email, password);

        if (!user) {
            return res.status(401).send({ message:'user does not exist' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send({ message:'Password is wrong' });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            profession: user.profession
        };

        const token = generateToken(tokenPayload);

        res.status(200).send({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message:'Error occurred while logging in' });
    }
}
  


async function logoutUser(req, res) {
    try {
        const authToken = req.headers.authorization.split(' ')[1]; //takes the token from the authorization header
        await Blacklist(authToken); //token added to blacklist in database
        res.status(200).send({ message: 'User logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'An error occurred while logging out' });
    }
}



module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
