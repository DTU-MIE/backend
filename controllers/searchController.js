const sql = require("mssql");
const { config } = require("../config/config");

const search = async (req, res) => {
  const keyword = req.query.keyword;
  const pageNumber = req.query.pageNumber || 1;
  const resultsPerPage = req.query.resultsPerPage || 10;

  const isLocal = req.headers.host.startsWith('localhost');
  const protocol = isLocal ? 'http' : 'https';
  const ipAddress = isLocal ? 'localhost:3002' : 'www.innocloud.dk';
  
  try {
    const pool = await sql.connect(config);

    const tableExists = await pool
    .request()
    .query(`
      SELECT 1
      FROM sys.tables
      WHERE name = 'NEED'
    `);
    if (tableExists.recordset.length === 0) {
      throw new Error(`Table "NEED" does not exist in the database`);
    }

    const columnsResult = await pool
      .request()
      .query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${config.options.tableName}'
          AND COLUMN_NAME IN ('ContactPerson', 'Title', 'NeedIs', 'Keywords', 'Proposal', 'Solution', 'CreatedAt')
      `);

    const columns = columnsResult.recordset.map((columnRow) => {

      const columnName = columnRow.COLUMN_NAME;
      return `${config.options.tableName}.${columnName} LIKE @keyword`;
    });


    const fileURL = `CASE WHEN ${config.options.tableName}.FileData IS NULL THEN 'no file' ELSE CONCAT('${protocol}://${ipAddress}/api/v1/download/', ${config.options.tableName}.id) END AS fileURL`;
    const searchQuery = `
      SELECT ${config.options.tableName}.ContactPerson, ${config.options.tableName}.Title, ${config.options.tableName}.NeedIs,${config.options.tableName}.Keywords,
      ${config.options.tableName}.Proposal, ${config.options.tableName}.Solution, ${config.options.tableName}.CreatedAt,
        ${fileURL}
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
