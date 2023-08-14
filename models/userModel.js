const bcrypt = require('bcrypt');
const mysql = require('mysql2');

class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequestError';
        this.statusCode = 400;
    }
}

const saltRounds = 10;
const { dbConfig } = require("../config/config");

async function createUser(userDetails) {
    try {
        const connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const emailExistsQuery = 'SELECT COUNT(*) as count FROM USERS WHERE email = ?';
        const [emailExistsResult] = await connection.promise().execute(emailExistsQuery, [userDetails.email]);

        if (emailExistsResult[0].count > 0) {
            throw new BadRequestError('Email already registered');
        }

        const emailDomain = userDetails.email.split('@')[1];
        if (emailDomain !== 'regionh.dk' && emailDomain !== 'dtu.dk') {
            throw new Error('Invalid email domain');
        }

        const hashedPassword = await bcrypt.hash(userDetails.password, saltRounds);

        const insertQuery = `
            INSERT INTO USERS (name, email, password, organization, department, profession)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        const insertValues = [
            userDetails.name,
            userDetails.email,
            hashedPassword,
            userDetails.organization,
            userDetails.department,
            userDetails.profession
        ];

        const [insertResult] = await connection.promise().execute(insertQuery, insertValues);
        connection.end();
        return insertResult.insertId;
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
}

async function getUserByEmailAndPassword(email, password) {
    try {
        const connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const selectQuery = `
            SELECT *
            FROM USERS
            WHERE email = ?;
        `;

        const [userResult] = await connection.promise().execute(selectQuery, [email]);
        const user = userResult[0];

        if (!user) {
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return null;
        }

        return user;
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
}

async function getUsers(ids){
    let connection
    try {

        const connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const query = "SELECT name, email FROM USERS WHERE id IN ?"

        return await new Promise((resolve, reject) => {
            connection.query(query, [ids], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        })
    } catch (e) {
        console.log("Error: ", e)
        throw e
    } finally {
        if(connection)
            connection.end()
    }
}

async function Blacklist(token) {
    try {
        const connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const insertQuery = 'INSERT INTO blacklist (token) VALUES (?)';
        const [insertResult] = await connection.promise().execute(insertQuery, [token]);
        connection.end();
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
}

module.exports = {
    createUser,
    getUserByEmailAndPassword,
    Blacklist,
    getUsers
};
