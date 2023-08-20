const mysql = require('mysql2');
const { dbConfig } = require("../config/config");

const tagsList = [
    {
        category: "sygdom",
        value: "fraktur"
    },
    {
        category: "psykiatri",
        value: "magtanvendelse"
    },
    {
        category: "psykiatri",
        value: "skizofreni"
    },
    {
        category: "sygdom",
        value: "kredsløb"
    },
    {
        category: "administration",
        value: "journalisering"
    }
]

async function insertNeed(need) {
    let connection;
    try {
        connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        connection.beginTransaction();
        const query = `
            INSERT INTO NEED (NeedIs, Title, ContactPerson, Proposal, Solution, FileData, FileName, extension, createdAt, UserId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = [
            need.NeedIs,
            need.Title,
            need.ContactPerson,
            need.Proposal,
            need.Solution,
            need.FileData,
            need.FileName,
            need.extension,
            need.createdAt,
            need.UserId
        ];

        let result = await new Promise((resolve, reject) => {
            connection.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        const insertTags = "INSERT INTO tags(id, category, value) values ?"
        let tagsData =[]
        for(const tag of need.parsedKeywords) {
            tagsData.push([result.insertId, tag.category, tag.value])
        }
        await new Promise((resolve, reject) => {
            connection.query(insertTags, [tagsData], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        connection.commit()
        return result.insertId;
    } catch (err) {
        if(connection)
            connection.rollback()
        console.error('Error inserting need:', err);
        throw err;
    } finally {
        if(connection)
            connection.end();
    }
}

async function getNeedById(id) {
    let connection
    try {
        connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const query = `
            SELECT *,
            CASE WHEN FileData IS NULL THEN 'no file' ELSE 'file' END AS HasFile
            FROM NEED
            WHERE ID = ?;
        `;

        const result = await new Promise((resolve, reject) => {
            connection.query(query, [id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
        const tagsQuery = "SELECT * FROM tags WHERE id = ?"
        const tags  = await new Promise((resolve, reject) => {
            connection.query(tagsQuery, [id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        return{...result[0], Keywords: tags} ;
    } catch (err) {
        console.error('Error getting need by ID:', err);
        throw err;
    } finally {
        if(connection) {
            connection.end();
        }
    }
}

const getAllNeeds = async () => {
    let connection;
    try {
        connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const query = `
            SELECT *,
            CASE WHEN FileData IS NULL THEN 'no file' ELSE 'file' END AS HasFile
            FROM NEED;
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

        return result;
    } catch (err) {
        console.error('Error getting all needs:', err);
        throw err;
    } finally {
        if(connection) {
            connection.end();
        }
    }
};

const updateNeed = async (id, need) => {
    let connection;
    try {
        connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();
        connection.beginTransaction();

        const query = `
            UPDATE NEED
            SET NeedIs = ?, Title = ?, ContactPerson = ?, Proposal = ?, Solution = ?,
            FileData = ?, FileName = ?, extension = ?, createdAt = ?, UserId = ?
            WHERE id = ?;
        `;

        const values = [
            need.NeedIs,
            need.Title,
            need.ContactPerson,
            need.Proposal,
            need.Solution,
            need.FileData,
            need.FileName,
            need.extension,
            need.createdAt,
            need.UserId,
            id
        ];

        const result = await new Promise((resolve, reject) => {
            connection.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        const deleteExistingKeywords = await connection.promise().query("DELETE FROM tags WHERE id = ?",[id])
        const insertTags = "INSERT INTO tags(id, category, value) values ?"
        let tagsData =[]
        for(const tag of need.parsedKeywords) {
            tagsData.push([id, tag.category, tag.value])
        }
        const updateKeywords = await connection.promise().query(insertTags, [tagsData])

        connection.commit()
        return result.affectedRows > 0;
    } catch (err) {
        if(connection)
            connection.rollback()
        console.error('Error updating need:', err);
        throw err;
    } finally {
        if(connection) {
            connection.end();
        }
    }
};

async function getNeedsRelatedByTags(needId) {
    let connection
    try {
        connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const query = `
            CALL related_needs(?)
        `;

        const needsIds = await new Promise((resolve, reject) => {
            connection.query(query, [needId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
        if(needsIds[0].length === 0) {
            return []
        }
        const needsQuery = `
            SELECT *,
            CASE WHEN FileData IS NULL THEN 'no file' ELSE 'file' END AS HasFile
            FROM NEED
            WHERE ID in (?);
        `;
        let idList = needsIds[0].map(e => e.id)
        const result = await new Promise((resolve, reject) => {
            connection.query(needsQuery, [idList], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
        const tagsQuery = "SELECT * FROM tags WHERE id in (?)"
        const tags  = await new Promise((resolve, reject) => {
            connection.query(tagsQuery, [idList], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        return result.map(need => {
            return {...need, Keywords: tags.filter(tag => tag.id === need.id)}
        }) ;

    } catch (err) {
        console.error('Error getting need by ID:', err);
        throw err;
    } finally {
        if(connection) {
            connection.end();
        }
    }
}

async function deleteNeed(id, UserId) {
    let connection
    try {
        connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const query = `
            DELETE FROM NEED
            WHERE id = ? AND UserId = ?;
        `;

        const values = [id, UserId];

        const result = await new Promise((resolve, reject) => {
            connection.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error deleting need:', err);
        throw err;
    } finally {
        if(connection) {
            connection.end();
        }
    }
}


async function getTags() {
    let connection
    try {
        connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const query = "SELECT * FROM tagslist"
        const tags  = await new Promise((resolve, reject) => {
            connection.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        return  tags;
    } catch (err) {
        console.error('Error getting need by ID:', err);
        throw err;
    } finally {
        if(connection) {
            connection.end();
        }
    }
}


module.exports = {
    insertNeed,
    getNeedById,
    getAllNeeds,
    updateNeed,
    deleteNeed,
    getTags,
    getNeedsRelatedByTags
};
