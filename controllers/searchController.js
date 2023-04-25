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
    //Getting the search keyword from the query 
    const keyword = req.query.keyword;
  
    //Getting the page number and results per page from the query
    const pageNumber = req.query.pageNumber || 1;
    const resultsPerPage = req.query.resultsPerPage || 10;
  
    try {
      const pool = await sql.connect(dbConfig);
  
      // Getting the names of all base tables in the database
      const tablesResult = await pool
        .request()
        .query(`
          SELECT TABLE_NAME
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_TYPE = 'BASE TABLE'
        `);
  
      //promise to use it later and Loop through each table and generate a search query
      const promises = tablesResult.recordset.map(async (tableRow) => {
        const tableName = tableRow.TABLE_NAME;
  
        //Getting the names of all columns in the current table
        const columnsNames = await pool
          .request()
          .input('tableName', sql.NVarChar, tableName)
          .query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @tableName
          `);
  
        //dynamic SQL query that searches all columns in the current table

    //table name passed as paramter to prevent from sql injection
        const columnsString = columnsNames.recordset
          .map((columnRow) => {
            const columnName = columnRow.COLUMN_NAME;
            return `${tableName}.${columnName} LIKE @keyword`;
          })
          .join(' OR ');
        // we only need these from the table so it is hardcoded
        //order by latest date first
        const searchQuery = `
          SELECT ${tableName}.ContactPerson, ${tableName}.Title, ${tableName}.NeedIs, ${tableName}.id, ${tableName}.CreatedAt, CONCAT('${req.protocol}://${req.headers.host}/api/v1/download/', ${tableName}.id) AS fileURL
          FROM ${tableName}
          WHERE ${columnsString}
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
  
        // Return the search results for the current table
        return searchResult.recordset;
      });
  
      // Wait for all search queries to complete and combine the results
      const searchResults = await Promise.all(promises);
      const flattenedResults = searchResults.flat();
  
      // Send the combined search results back to the client 
      res.send(flattenedResults);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  };
  
module.exports = {
    search
  };
  
  
  