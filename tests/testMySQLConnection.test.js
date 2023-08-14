const mysql = require('mysql2');
const { dbConfig } = require("../config/config");


describe('createconnection', () => {
  it("should connect to the database", async () => {
  console.log(dbConfig)
  const connection = mysql.createConnection(dbConfig.connectionString);
  connection.connect();

  const query = `
      SHOW TABLES;
  `;

  const result = await new Promise((resolve, reject) => {
      connection.query(query, (error, results) => {
          if (error) {
              reject(error);
          } else {
              resolve(results);
          }
      });
  });
  console.log(result)
  expect(connection).toBeDefined();
  expect(result.length > 0).toBe(true);
  connection.end();
});  
});  