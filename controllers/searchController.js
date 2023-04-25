const sql = require("mssql");

const {
    MSSQL_USER,
    MSSQL_SA_PASSWORD,
    MSSQL_HOST,
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
const search = async (req, res) => {
    // Get the search keyword from the query string
    const keyword = req.query.keyword;
  
    // Get the page number and results per page from the query string
    const pageNumber = req.query.pageNumber || 1;
    const resultsPerPage = req.query.resultsPerPage || 10;
  
    try {
      const pool = await sql.connect(dbConfig);
  
      // Get the names of all tables in the database
      const tablesResult = await pool
        .request()
        .query(`
          SELECT TABLE_NAME
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_TYPE = 'BASE TABLE'
        `);
  
      // Loop through each table and generate a search query
      const promises = tablesResult.recordset.map(async (tableRow) => {
        const tableName = tableRow.TABLE_NAME;
  
        // Get the names of all columns in the current table
        const columnsR = await pool
          .request()
          .input('tableName', sql.NVarChar, tableName)
          .query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @tableName
          `);
  
        // Build a dynamic SQL query that searches all columns in the current table
        const columnsString = columnsR.recordset
          .map((columnRow) => {
            const columnName = columnRow.COLUMN_NAME;
            return `${tableName}.${columnName} LIKE @keyword`;
          })
          .join(' OR ');
        const searchQuery = `
          SELECT ${tableName}.ContactPerson, ${tableName}.Title, ${tableName}.NeedIs, ${tableName}.id, CONCAT('${req.protocol}://${req.headers.host}/api/v1/download/', ${tableName}.id) AS fileURL
          FROM ${tableName}
          WHERE ${columnsString}
          ORDER BY CreatedAt
          OFFSET ${(pageNumber - 1) * resultsPerPage} ROWS
          FETCH NEXT ${resultsPerPage} ROWS ONLY
        `;
  
        // Execute the search query with the search keyword as a parameter
        const searchResult = await pool
          .request()
          .input('keyword', sql.NVarChar, `%${keyword}%`)
          .query(searchQuery);
  
        // Return the search results for the current table
        return searchResult.recordset;
      });
  
      // Wait for all search queries to complete and combine the results
      const searchResults = await Promise.all(promises);
      const flattenedResults = searchResults.flat();
  
      // Send the combined search results back to the client
      res.send(flattenedResults);
    } catch (err) {
      // Handle any errors that occur during the search process
      console.error(err);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  };
  
module.exports = {
    search
  };
  
  
  