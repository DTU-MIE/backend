const dotenv = require('dotenv');

//configraration with env. 
dotenv.config({ path: '../.env' });

const MSSQL_HOST = process.env.MSSQL_HOST || "localhost";
const MSSQL_USER = process.env.MSSQL_USER;
const MSSQL_SA_PASSWORD = process.env.MSSQL_SA_PASSWORD;
const SECRET_KEY = process.env.SECRET_KEY;
const AUTH_KEY = process.env.AUTH_KEY;
const PROD_AUTH_KEY = process.env.PROD_AUTH_KEY;
const DATA_TABLE_NAME = process.env.DATA_TABLE_NAME;
const DATABASE_NAME  = process.env.DATABASE_NAME;
const SERVER_NAME  = process.env.SERVER_NAME || "sql";
const API_KEY= process.env.API_KEY;
const BASE_KEY= process.env.BASE_KEY;


const dbConfig = {  
    database: DATABASE_NAME,
    server: SERVER_NAME,
    host: MSSQL_HOST,
    user: MSSQL_USER, 
    password: MSSQL_SA_PASSWORD, 
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
    MSSQL_USER,
    MSSQL_SA_PASSWORD,
    AUTH_KEY,
    dbConfig,
    API_KEY,
    BASE_KEY,
    PROD_AUTH_KEY,
  };

  
