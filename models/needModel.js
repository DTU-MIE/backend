const sql = require("mssql");

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

const pool = new sql.ConnectionPool(dbConfig);

async function insertNeed(need) {
  await pool.connect();
  const request = pool.request();
  request.input('NeedIs', sql.NVarChar(50), need.NeedIs);
  request.input('Title', sql.NVarChar(255), need.Title);
  request.input('ContactPerson', sql.NVarChar(255), need.ContactPerson);
  request.input('FileData', sql.VarBinary(sql.MAX), need.FileData);
  request.input('originalname', sql.NVarChar(255), need.originalname);
  request.input('extension', sql.NVarChar(10), need.extension);
  request.input('createdAt', sql.DateTime, need.createdAt);
  const result = await request.query(`
    INSERT INTO NEED (NeedIs, Title, ContactPerson, FileData, originalname, extension, CreatedAt)
    VALUES (@NeedIs, @Title, @ContactPerson, @FileData, @originalname, @extension, @createdAt);
    SELECT SCOPE_IDENTITY() AS ID;
  `);
  return result.recordset[0].ID;
}

async function getNeedById(id) {
  await pool.connect();
  const request = pool.request();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT * FROM NEED WHERE ID = @id;
  `);
  return result.recordset[0];
}

module.exports = {
  insertNeed,
  getNeedById,
};