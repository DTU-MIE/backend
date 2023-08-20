const mysql = require('mysql2');
const { dbConfig } = require("../config/config");
const {getUsers} = require("./userModel");

const insertComment = async (needID, comment, kind, creator) => {
    let connection;
    try {
        if (!comment) {
            throw new Error('Comment is empty!');
        }
        if (kind !== 'Proposal' && kind !== 'Comment') {
            throw new Error('Invalid kind value!');
        }

        connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const query = `
            INSERT INTO comments (needID, comment, kind, created_at, creator)
            VALUES (?, ?, ?, NOW(), ?)
        `;

        const values = [needID, comment, kind, creator];
        await new Promise((resolve, reject) => {
            connection.query(query, values, (error, results) => {
                if (error) {
                    reject(error)
                } else {
                    resolve()
                    console.log('Comment added successfully!');
                }

            });
        });

    } catch (err) {
        throw err;
    } finally {
        if(connection) {
            connection.end();
        }
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
          select comment_id, needID, comment, kind, created_at, creator, name as creatorName, email from comments left join USERS on comments.creator = USERS.id
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
      return result
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
