const mysql = require('mysql2');
const { dbConfig } = require("../config/config");
const {col} = require("sequelize");
const search = async (req, res) => {
  const keyword = req.query.keyword;
  const pageNumber = req.query.pageNumber || 1;
  const resultsPerPage = req.query.resultsPerPage || 10;

  const isLocal = req.headers.host.startsWith('localhost');
  const protocol = isLocal ? 'http' : 'https';
  const ipAddress = isLocal ? 'localhost:3002' : 'www.innocloud.dk';
  let connection
  try {
    connection = mysql.createConnection(dbConfig.connectionString);
    connection.connect();

    const tableExistsResult = await new Promise((resolve, reject) => {
      connection.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = 'NEED' LIMIT 1`,
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
      );
    });

    if (tableExistsResult.length === 0) {
      throw new Error(`Table "NEED" does not exist in the database`);
    }

    const columnsResult = await new Promise((resolve, reject) => {
      connection.query(
          `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_name = ? AND column_name IN ('id','ContactPerson', 'Title', 'NeedIs', 'Proposal', 'Solution', 'CreatedAt')`,
          [dbConfig.options.tableName],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
      );
    });

    const columns = columnsResult.map((columnRow) => {
      const columnName = columnRow.COLUMN_NAME;
      return `${dbConfig.options.tableName}.${columnName} LIKE ?`;
    });

    const fileURL = `CASE WHEN ${dbConfig.options.tableName}.FileData IS NULL THEN 'no file' ELSE CONCAT('${protocol}://${ipAddress}/api/v1/download/', ${dbConfig.options.tableName}.id) END AS fileURL`;
    const searchQuery = `
      SELECT ${dbConfig.options.tableName}.id, ${dbConfig.options.tableName}.ContactPerson, ${dbConfig.options.tableName}.Title, ${dbConfig.options.tableName}.NeedIs,
      ${dbConfig.options.tableName}.Proposal, ${dbConfig.options.tableName}.Solution, ${dbConfig.options.tableName}.CreatedAt,
        ${fileURL}
      FROM ${dbConfig.options.tableName}
      WHERE ${columns.join(' OR ')}
      ORDER BY CreatedAt DESC 
      LIMIT ${(pageNumber - 1) * resultsPerPage}, ${resultsPerPage}
    `;
    let params = []
    for(let i = 0; i< columns.length;i++) {
      params.push("%"+keyword+"%")
    }
    const searchResult = await new Promise((resolve, reject) => {
      connection.query(searchQuery, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    let ids = searchResult.map(e => e.id)

    const tagsQuery = "SELECT * FROM tags WHERE id IN (?)"
    const tags  = await new Promise((resolve, reject) => {
      connection.query(tagsQuery, [ids], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const result = searchResult.map(e => {
      return {...e, Keywords: tags.find(ee => ee.id === e.id)}
    })


    res.status(200).send(result);

  } catch (error) {
    res.status(500).send({ error: 'search, Internal Server Error' });
  } finally {
    if(connection) {
      connection.end();
    }
  }
};

module.exports = {
  search
};
