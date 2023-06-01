const sql = require("mssql");
const { config } = require("../config/config");

/*async function search(req, res) {
  const keyword = req.query.keyword;
  const pageNumber = req.query.pageNumber || 1;
  const resultsPerPage = req.query.resultsPerPage || 10;

  try {
    const pool = await sql.connect(config);

    const tableExistsQuery = `
      SELECT 1
      FROM sys.tables
      WHERE name = @tableName
    `;
    const tableExistsResult = await pool
      .request()
      .input('tableName', sql.NVarChar, config.options.tableName)
      .query(tableExistsQuery);

    const tableExists = tableExistsResult.recordset;

    if (tableExists.length === 0) {
      throw new Error(`Table "${config.options.tableName}" does not exist in the database`);
    }

    const columnsQuery = `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = @tableName
        AND COLUMN_NAME IN ('ContactPerson', 'Title', 'NeedIs', 'CreatedAt')
    `;
    const columnsResult = await pool
      .request()
      .input('tableName', sql.NVarChar, config.options.tableName)
      .query(columnsQuery);

    const columns = columnsResult.recordset.map((columnRow) => {
      const columnName = columnRow.COLUMN_NAME;
      return `${config.options.tableName}.${columnName} LIKE @keyword`;
    });

    const searchQuery = `
      SELECT ${config.options.tableName}.ContactPerson, ${config.options.tableName}.Title, ${config.options.tableName}.NeedIs, ${config.options.tableName}.CreatedAt,
        CASE WHEN ${config.options.tableName}.FileData IS NULL THEN 'no file' ELSE CONCAT('${req.protocol}://${req.headers.host}/api/v1/download/', ${config.options.tableName}.id) END AS fileURL
      FROM ${config.options.tableName}
      WHERE ${columns.join(' OR ')}
      ORDER BY CreatedAt DESC 
      OFFSET ${(pageNumber - 1) * resultsPerPage} ROWS
      FETCH NEXT ${resultsPerPage} ROWS ONLY
    `;

    const request = new sql.Request(pool);
    request.input('keyword', sql.NVarChar, `%${keyword}%`);

    const searchResult = await request.query(searchQuery);

    res.status(200).send(searchResult.recordset);
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: 'search, Internal Server Error' });
  }
}
*/

const search = async (req, res) => {
  const keyword = req.query.keyword;
  const pageNumber = req.query.pageNumber || 1;
  const resultsPerPage = req.query.resultsPerPage || 10;

  let searchQuery; // Declare the searchQuery variable

  try {
    const pool = await sql.connect(config);

    const tableExists = await pool
      .request()
      .query(`
        SELECT 1
        FROM sys.tables
        WHERE name = '${config.options.tableName}'
      `);

    if (tableExists.recordset.length === 0) {
      throw new Error(`Table "${config.options.tableName}" does not exist in the database`);
    }

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

    searchQuery = `
      SELECT ${config.options.tableName}.ContactPerson, ${config.options.tableName}.Title, ${config.options.tableName}.NeedIs, ${config.options.tableName}.CreatedAt,
        CASE WHEN ${config.options.tableName}.FileData IS NULL THEN 'no file' ELSE CONCAT('${req.protocol}://${req.headers.host}/api/v1/download/', ${config.options.tableName}.id) END AS fileURL
      FROM ${config.options.tableName}
      WHERE ${columns.join(' OR ')}
      ORDER BY CreatedAt DESC 
      OFFSET ${(pageNumber - 1) * resultsPerPage} ROWS
      FETCH NEXT ${resultsPerPage} ROWS ONLY
    `;

    const request = new sql.Request(pool);
    request.input('keyword', sql.NVarChar, `%${keyword}%`);

    const searchResult = await request.query(searchQuery);
    res.status(200).send(searchResult.recordset);

    
  } catch (error) {
    res.status(500).send({ error: 'search, Internal Server Error' });
  }
};

module.exports = {
  search
};
