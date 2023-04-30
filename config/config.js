//This holds all the environment variables
const dotenv = require('dotenv');

// configraration with env. 
dotenv.config({ path: '../.env' });

const MSSQL_HOST = process.env.MSSQL_HOST;
console.log(process.env.MSSQL_HOST)
const MSSQL_USER = process.env.MSSQL_USER;
const MSSQL_SA_PASSWORD = process.env.MSSQL_SA_PASSWORD;
const SECRET_KEY = process.env.SECRET_KEY;
const AUTH_KEY = process.env.AUTH_KEY;
const DATA_TABLE_NAME = process.env.DATA_TABLE_NAME;

const port = 1433;
const SESSION_SECRET= process.env.SESSION_SECRET;
console.log(SESSION_SECRET)
//const MSSQL_PORT = process.env.MSSQL_PORT;
// const REDIS_URL= process.env.REDIS_URL || "redis";
// const REDIS_PORT= process.env.REDIS_PORT || 6379;
// const SESSION_SECRET= process.env.SESSION_SECRET;
// const API_KEY= process.env.API_KEY || 'keyEavRBNRoSft45f';
// const BASE_KEY= process.env.BASE_KEY || 'appJoZMNg6B5pJ9lN';
const dbConfig = {  

    server: "sql",
    host: MSSQL_HOST,
    user: MSSQL_USER, 
    password: MSSQL_SA_PASSWORD, 
    enableArithAbort: true,
    Encrypt:true,
    trustServerCertificate: true,
    port: 1433

}; 

const config = {  
    server: "sql",

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
    DATA_TABLE_NAME,
    MSSQL_USER,
    MSSQL_SA_PASSWORD,
    AUTH_KEY,
    dbConfig,
    config

  };

  
