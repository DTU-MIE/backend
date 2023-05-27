const sql = require('mssql');

const { dbConfig } = require("../config/config");

const insertComment = async (id, comment, kind) => {
    try {
      if (!comment) {
        throw new Error('Comment is empty!');
      }
  
      const pool = new sql.ConnectionPool(dbConfig);
      await pool.connect();
      const request = pool.request();
      request.input('id', sql.Int, id);
      request.input('comment', sql.NVarChar(4000), comment);
      request.input('kind', sql.NVarChar(255), kind);
  
      await request.query(`
        INSERT INTO comments (id, comment, kind, created_at)
        VALUES (@id, @comment, @kind, GETDATE())
      `);
  
      console.log('Comment added successfully!');
    } catch (err) {
      throw err;
    }
  };
  
  

  const getCommentsForNeed = async (id) => {
    try {
      const pool = new sql.ConnectionPool(dbConfig);
      await pool.connect();
      const request = pool.request();
      request.input('id', sql.Int, id);
  
      const result = await request.query(`
        SELECT *
        FROM comments
        WHERE id = @id
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
