const sql = require("mssql");

const { dbConfig } = require("../config/config");


async function insertNeed(need) {

  const pool = new sql.ConnectionPool(dbConfig);
  await pool.connect();
  const request = pool.request();
  request
  .input('NeedIs', sql.NVarChar(4000), need.NeedIs)
  .input('Title', sql.NVarChar(1000), need.Title)
  .input('ContactPerson', sql.NVarChar(1000), need.ContactPerson)
  .input('Keywords', sql.NVarChar(1000), need.Keywords)
  .input('Proposal', sql.NVarChar(1000), need.Proposal)
  .input('Solution', sql.NVarChar(1000), need.Solution)
  .input('FileData', sql.VarBinary(sql.MAX), need.FileData)
  .input('FileName', sql.NVarChar(255), need.FileName)
  .input('extension', sql.NVarChar(10), need.extension)
  .input('createdAt', sql.DateTime, need.createdAt)
  .input('UserId', sql.Int, need.UserId);
  const result = await request.query(`
    INSERT INTO NEED (NeedIs, Title, ContactPerson, Keywords, Proposal, Solution, FileData, FileName, extension, CreatedAt, UserId)
    VALUES (@NeedIs, @Title, @ContactPerson, @Keywords, @Proposal, @Solution, @FileData, @FileName, @extension, @createdAt, @UserId);
    SELECT SCOPE_IDENTITY() AS id;
  `);
  await pool.close();
  return result.recordset[0].id;
}

async function getNeedById(id) {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();
    request.input('id', sql.Int, id);
    const result = await request.query(`
      SELECT *,
      CASE WHEN FileData IS NULL THEN 'no file' ELSE 'file' END AS HasFile
      FROM NEED
      WHERE ID = @id;
    `);
    await pool.close();
    return result.recordset[0];
}


const getAllNeeds = async () => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT *,
        CASE WHEN FileData IS NULL THEN 'no file' ELSE 'file' END AS HasFile
      FROM NEED
    `);
    await pool.close();
    return result.recordset;
};

const updateNeed = async (id, need) => {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    const query = `UPDATE NEED SET NeedIs = @NeedIs, Title = @Title, ContactPerson = @ContactPerson,
      Keywords = @Keywords, Proposal = @Proposal, Solution = @Solution, FileData = @FileData,
      FileName = @FileName, extension = @extension, createdAt = @createdAt WHERE id = @id`;
    request.input('NeedIs', sql.NVarChar(4000), need.NeedIs);
    request.input('Title', sql.NVarChar(1000), need.Title);
    request.input('ContactPerson', sql.NVarChar(1000), need.ContactPerson);
    request.input('Keywords', sql.NVarChar(1000), need.Keywords);
    request.input('Proposal', sql.NVarChar(1000), need.Proposal);
    request.input('Solution', sql.NVarChar(1000), need.Solution);
    request.input('FileData', sql.VarBinary(sql.MAX), need.FileData);
    request.input('FileName', sql.NVarChar(255), need.FileName);
    request.input('extension', sql.NVarChar(10), need.extension);
    request.input('createdAt', sql.DateTime, need.createdAt);
    request.input('id', sql.Int, id);
    request.input('UserId', sql.Int, need.UserId);

    const result = await request.query(query);
    return result.rowsAffected.length > 0;
};

async function deleteNeed(id, UserId) {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();
    const query = 'DELETE FROM NEED WHERE id = @id AND UserId = @UserId'; 
    request.input('id', sql.Int, id);
    request.input('UserId', sql.Int, UserId);
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error('Error deleting need:', error);
    return false;
  } finally {
    sql.close();
  }
}



module.exports = {
  insertNeed,
  getNeedById,
  getAllNeeds,
  updateNeed,
  deleteNeed
};