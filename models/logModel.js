/*const sql = require("mssql");

const {
    MSSQL_USER,
    MSSQL_SA_PASSWORD,
  } = require("../config/config");

const dbConfig = {  
    database: "mie",
    server: "sql",
    host: "localhost",
    user: MSSQL_USER, //update me
    password: MSSQL_SA_PASSWORD, 
    enableArithAbort: true,
    Encrypt:true,
    trustServerCertificate: true,
    port: 1433

};  

class Log {
    static insert(logText) {
      if (!logText) {
        logText = 'Default log message';
      }
      const pool = new sql.ConnectionPool(dbConfig);
      let request; // define the request variable here
      return pool.connect().then(() => {
        request = pool.request(); // assign the request variable here
        request.input('logText', sql.NVarChar(1000), logText);
        return request.query('INSERT INTO log (logText) VALUES (@logText);');
      }).then(result => {
        return request.query(`select * from log;`);
      }).then(result => {
        console.log('log inserted successfully');
        console.log(result.recordset);
      }).finally(() => {
        pool.close();
      });
    }
  }
  
  module.exports = Log;*/
  
