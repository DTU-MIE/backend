const sql = require('mssql');

const { dbConfig } = require("../config/config");

const insertComment = async (needID, comment, kind) => {
    try {
      if (!comment) {
        throw new Error('Comment is empty!');
      }
      if (kind !== 'Proposal' && kind !== 'Comment') {
        throw new Error('Invalid kind value!');
      }
  
      const pool = new sql.ConnectionPool(dbConfig);
      await pool.connect();
      const request = pool.request();
      request.input('needID', sql.Int, needID);
      request.input('comment', sql.NVarChar(4000), comment);
      request.input('kind', sql.NVarChar(255), kind);
  
      await request.query(`
        INSERT INTO comments (needID, comment, kind, created_at)
        VALUES (@needID, @comment, @kind, GETDATE())
      `); 
      console.log('Comment added successfully!');
    } catch (err) {
      throw err;
    }
};
  

const getCommentsForNeed = async (needID) => {
  try {
    const pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    const request = pool.request();
    request.input('needID', sql.Int, needID);

    const result = await request.query(`
      SELECT *
      FROM comments
      WHERE needID = @needID
    `);

    return result.recordset;
  } catch (err) {
    console.log(err);
  }
};




module.exports = {
  insertComment,
  getCommentsForNeed,
};
