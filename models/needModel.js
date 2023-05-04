const sql = require("mssql");

const { dbConfig } = require("../config/config");


async function insertNeed(need) {

  const pool = new sql.ConnectionPool(dbConfig);
  await pool.connect();
  const request = pool.request();
  request
  .input('NeedIs', sql.NVarChar(50), need.NeedIs)
  .input('Title', sql.NVarChar(255), need.Title)
  .input('ContactPerson', sql.NVarChar(255), need.ContactPerson)
  .input('Keywords', sql.NVarChar(255), need.Keywords)
  .input('Proposal', sql.NVarChar(1000), need.Proposal)
  .input('Solution', sql.NVarChar(1000), need.Solution)
  .input('FileData', sql.VarBinary(sql.MAX), need.FileData)
  .input('FileName', sql.NVarChar(255), need.FileName)
  .input('extension', sql.NVarChar(10), need.extension)
  .input('createdAt', sql.DateTime, need.createdAt);
  const result = await request.query(`
    INSERT INTO NEED (NeedIs, Title, ContactPerson, Keywords, Proposal, Solution, FileData, FileName, extension, CreatedAt)
    VALUES (@NeedIs, @Title, @ContactPerson, @Keywords, @Proposal, @Solution, @FileData, @FileName, @extension, @createdAt);
    SELECT SCOPE_IDENTITY() AS id;
  `);
  await pool.close();
  return result.recordset[0].id;
}

async function getNeedById(id) {
  const pool = new sql.ConnectionPool(dbConfig);
  await pool.connect();
  const request = pool.request();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT * FROM NEED WHERE ID = @id;
  `);
  await pool.close();
  return result.recordset[0];
}

const getAllNeeds = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.connect();
    const result = await pool.request().query('SELECT * FROM NEED');
    return result.recordset;
  } catch (err) {
    console.error(err);
  } finally {
    sql.close();
  }
};

module.exports = {
  insertNeed,
  getNeedById,
  getAllNeeds
};