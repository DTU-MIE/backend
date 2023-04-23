const sql = require("mssql");

const {
    MSSQL_USER,
    MSSQL_SA_PASSWORD,
    MSSQL_HOST
  } = require("../config/config");

const dbConfig = {  
    database: "mie",
    server: "sql",
    host: MSSQL_HOST || "localhost",
    user: MSSQL_USER, 
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
  request
  .input('NeedIs', sql.NVarChar(50), need.NeedIs)
  .input('Title', sql.NVarChar(255), need.Title)
  .input('ContactPerson', sql.NVarChar(255), need.ContactPerson)
  .input('FileData', sql.VarBinary(sql.MAX), need.FileData)
  .input('FileName', sql.NVarChar(255), need.FileName)
  .input('extension', sql.NVarChar(10), need.extension)
  .input('createdAt', sql.DateTime, need.createdAt);
  const result = await request.query(`
    INSERT INTO NEED (NeedIs, Title, ContactPerson, FileData, FileName, extension, CreatedAt)
    VALUES (@NeedIs, @Title, @ContactPerson, @FileData, @FileName, @extension, @createdAt);
    SELECT SCOPE_IDENTITY() AS id;
  `);
  return result.recordset[0].id;
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