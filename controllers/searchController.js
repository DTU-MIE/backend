const sql = require("mssql");
const { config } = require("../config/config");

const search = async (req, res) => {
  //Getting the search keyword from the query 
  const keyword = req.query.keyword;

  //Getting the page number and results per page from the query
  const pageNumber = req.query.pageNumber || 1;
  const resultsPerPage = req.query.resultsPerPage || 10;
  const pool = new sql.ConnectionPool(config);
  console.log(pool)
  await pool.connect(); // needed so that connection doesnt close
  try {
    
    console.log("pool connection 1")

    // Check if the table exists
    const tableExists = await pool
      .request()
      .query(`
        SELECT TOP 1 1
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = '${config.options.tableName}'
      `);
    console.log("pool connection 2")
    if (tableExists.recordset.length === 0) {
      throw new Error(`Table "${config.options.tableName}" does not exist in the database`);
    }

    //columns in the table
    const columnsResult = await pool
      .request()
      .query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${config.options.tableName}'
          AND COLUMN_NAME IN ('ContactPerson', 'Title', 'NeedIs', 'CreatedAt')
      `);

    const columns = columnsResult.recordset.map((columnRow) => {
      const columnName = columnRow.COLUMN_NAME;
      return `${config.options.tableName}.${columnName} LIKE @keyword`;
    });

    //Generate the search query for the table
    const searchQuery = `
      SELECT ${config.options.tableName}.ContactPerson, ${config.options.tableName}.Title, ${config.options.tableName}.NeedIs, ${config.options.tableName}.CreatedAt, CONCAT('${req.protocol}://${req.headers.host}/api/v1/download/', ${config.options.tableName}.id) AS fileURL
      FROM ${config.options.tableName}
      WHERE ${columns.join(' OR ')}
      ORDER BY CreatedAt DESC 
      OFFSET ${(pageNumber - 1) * resultsPerPage} ROWS
      FETCH NEXT ${resultsPerPage} ROWS ONLY
    `;

    //Executing the search query with the search keyword as a parameter from the client 
    //keyword passed as parameter to save it from sql injections
    const searchResult = await pool
      .request()
      .input('keyword', sql.NVarChar, `%${keyword}%`)
      .query(searchQuery);

    // Send the search results back to the client 
    res.send(searchResult.recordset);
    await pool.close();
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'search, Internal Server Error' });
  }
};



  
module.exports = {
    search
  };
  
  
  