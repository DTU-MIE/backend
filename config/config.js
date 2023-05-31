const dotenv = require('dotenv');

//configraration with env. 
dotenv.config({ path: '../.env' });

const MSSQL_HOST = process.env.MSSQL_HOST || "localhost";
console.log(process.env.MSSQL_HOST)
const MSSQL_USER = process.env.MSSQL_USER;
const MSSQL_SA_PASSWORD = process.env.MSSQL_SA_PASSWORD;
const SECRET_KEY = process.env.SECRET_KEY;
const AUTH_KEY = process.env.AUTH_KEY;
const DATA_TABLE_NAME = process.env.DATA_TABLE_NAME;
console.log(DATA_TABLE_NAME)
const port = 1433;
const SESSION_SECRET= process.env.SESSION_SECRET;
console.log(SESSION_SECRET)
const API_KEY= process.env.API_KEY || 'keyxH90r5GgPBip9q';
const BASE_KEY= process.env.BASE_KEY || 'appS0HcQMolux76kh';
const dbConfig = {  
    database: "mie",
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

const config = {  
    server: "sql",
    database: "mie",
    host: "localhost",
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
console.log(config)

module.exports = {
    SECRET_KEY,
    MSSQL_USER,
    MSSQL_SA_PASSWORD,
    AUTH_KEY,
    dbConfig,
  DATA_TABLE_NAME,
    config,
    API_KEY,
    BASE_KEY
  };

  
