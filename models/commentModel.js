const mysql = require('mysql2');
const { dbConfig } = require("../config/config");

const insertComment = async (needID, comment, kind) => {
    try {
        if (!comment) {
            throw new Error('Comment is empty!');
        }
        if (kind !== 'Proposal' && kind !== 'Comment') {
            throw new Error('Invalid kind value!');
        }

        const connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const query = `
            INSERT INTO comments (needID, comment, kind, created_at)
            VALUES (?, ?, ?, NOW())
        `;

        const values = [needID, comment, kind];

        await connection.query(query, values, (error, results) => {
            if (error) {
                throw error;
            }
            console.log('Comment added successfully!');
        });
    } catch (err) {
        throw err;
    } finally {

        connection.end();
    }
};

// Call the function with appropriate parameters
//insertComment(123, 'This is a test comment', 'Proposal');


const getCommentsForNeed = async (needID) => {
    let connection;
  try {
      connection = mysql.createConnection(dbConfig.connectionString);
      connection.connect();

      const query = `
          SELECT *
          FROM comments
          WHERE needID = ?
      `;

      const result = await new Promise((resolve, reject) => {
          connection.query(query, [needID], (error, results) => {
              if (error) {
                  reject(error);
              } else {
                  resolve(results);
              }
          });
      });

      connection.end();
      return result;
  } catch (err) {
      console.log(err);
  } finally {
      if(connection)
          connection.end()
  }
};

module.exports = {
  insertComment,
  getCommentsForNeed,
};
