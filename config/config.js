const dotenv = require('dotenv');

//configraration with env. 
//configuration with env. 
try {
    dotenv.config();
  } catch (error) {
    console.error('Error loading .env file:', error);
  }

const MYSQL_HOST = process.env.MYSQL_HOST || "localhost";
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_SA_PASSWORD = process.env.MYSQL_SA_PASSWORD;
const MYSQL_CONNECTIONSTRING = process.env.MYSQL_CONNECTIONSTRING;
console.log("ConnectionString: " + MYSQL_CONNECTIONSTRING);
const SECRET_KEY = process.env.SECRET_KEY;
const AUTH_KEY = process.env.AUTH_KEY;
const PROD_AUTH_KEY = process.env.PROD_AUTH_KEY;
const DATA_TABLE_NAME = process.env.DATA_TABLE_NAME;
const DATABASE_NAME  = process.env.DATABASE_NAME;
const SERVER_NAME  = process.env.SERVER_NAME || "sql";
const API_KEY= process.env.API_KEY;
const BASE_KEY= process.env.BASE_KEY;


const dbConfig = {
    connectionString: MYSQL_CONNECTIONSTRING,
    database: DATABASE_NAME,
    server: SERVER_NAME,
    host: MYSQL_HOST,
    user: MYSQL_USER, 
    password: MYSQL_SA_PASSWORD, 
    enableArithAbort: true,
    Encrypt:true,
    trustServerCertificate: true,
    port: 1433,
    options: {
        tableName: DATA_TABLE_NAME
    }
}; 

module.exports = {
    SECRET_KEY,
    MYSQL_USER,
    MYSQL_SA_PASSWORD,
    AUTH_KEY,
    dbConfig,
    API_KEY,
    BASE_KEY,
    PROD_AUTH_KEY,
  };

  
