const bcrypt = require('bcrypt');
const sql = require("mssql");

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
  console.log("🥺");

    const pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
  
    try {
      //Check if email already exists in database
      const emailExists = await pool.request()
        .input('email', sql.NVarChar(50), userDetails.email)
        .query('SELECT COUNT(*) as count FROM USERS WHERE email = @email');
        console.log('emailExists:', emailExists);
      if (emailExists.recordset[0].count > 0) {
        throw new BadRequestError('Email already registered');
      }
  
      //this checks the email domain
      const emailDomain = userDetails.email.split('@')[1];
      if (emailDomain !== 'regionh.dk' && emailDomain !== 'dtu.dk') {
        throw new Error('Invalid email domain');
      }
  
      //hashing the password
      const hashedPassword = await bcrypt.hash(userDetails.password, saltRounds);
  
      const request = pool.request();
      request
        // Execute SQL query to create new user and get the id
        .input('name', sql.NVarChar(255), userDetails.name)
        .input('email', sql.NVarChar(50), userDetails.email)
        .input('password', sql.NVarChar(255), hashedPassword)
        .input('organization', sql.NVarChar(255), userDetails.organization)
        .input('department', sql.NVarChar(255), userDetails.department)
        .input('profession', sql.NVarChar(255), userDetails.profession);
  
      //Insert user if email is not already registered
      const result = await request.query(`
      IF NOT EXISTS (SELECT 1 FROM USERS WHERE email = @email)
      BEGIN
          INSERT INTO USERS (name, email, password, organization, department, profession)
          VALUES (@name, @email, @password, @organization, @department, @profession);
          SELECT SCOPE_IDENTITY() AS id;
      END`);

      return result.recordset[0].id;
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }
     finally {
      pool.close();
    }
  }
  
   

async function getUserByEmailAndPassword(email, password) {
    console.log('email:', email, 'password:', password);
    const pool = await sql.connect(dbConfig);
    try {
      const result = await pool.request()
        .input('email', sql.NVarChar(50), email)
        .input('password', sql.NVarChar(255), password)
        .execute('getUserByEmailAndPassword');
    
      const user = result.recordset[0];
    
      if (!user) {
        return null;
      }
    
      const passwordMatch = await bcrypt.compare(password, user.password);
    
      if (!passwordMatch) {
        return null;
      }
      console.log(user);
      return user;
    } finally {
      pool.close();
    }
}
  
/*  
async function Blacklist(token) {
    const connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('token', sql.NVarChar, token);
    await request.query('INSERT INTO blacklist (token) VALUES (@token)');
    await connection.close();
}
 */ 
module.exports = {
  createUser,
  getUserByEmailAndPassword,
  //Blacklist
};

