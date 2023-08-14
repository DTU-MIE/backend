const mysql = require('mysql2');
const { dbConfig } = require("../config/config");

async function insertNeed(need) {
    try {
        const connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const query = `
            INSERT INTO NEED (NeedIs, Title, ContactPerson, Keywords, Proposal, Solution, FileData, FileName, extension, createdAt, UserId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const values = [
            need.NeedIs,
            need.Title,
            need.ContactPerson,
            need.Keywords,
            need.Proposal,
            need.Solution,
            need.FileData,
            need.FileName,
            need.extension,
            need.createdAt,
            need.UserId
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

        connection.end();
        return result.insertId;
    } catch (err) {
        console.error('Error inserting need:', err);
        throw err;
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

        return result[0];
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
    try {
        const connection = mysql.createConnection(dbConfig.connectionString);
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

        connection.end();
        return result;
    } catch (err) {
        console.error('Error getting all needs:', err);
        throw err;
    }
};

const updateNeed = async (id, need) => {
    try {
        const connection = mysql.createConnection(dbConfig.connectionString);
        connection.connect();

        const query = `
            UPDATE NEED
            SET NeedIs = ?, Title = ?, ContactPerson = ?, Keywords = ?, Proposal = ?, Solution = ?,
            FileData = ?, FileName = ?, extension = ?, createdAt = ?, UserId = ?
            WHERE id = ?;
        `;

        const values = [
            need.NeedIs,
            need.Title,
            need.ContactPerson,
            need.Keywords,
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

        connection.end();
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error updating need:', err);
        throw err;
    }
};

async function deleteNeed(id, UserId) {
    try {
        const connection = mysql.createConnection(dbConfig.connectionString);
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

        connection.end();
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error deleting need:', err);
        throw err;
    }
}

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

async function getTags() {
    return tagsList
}


module.exports = {
    insertNeed,
    getNeedById,
    getAllNeeds,
    updateNeed,
    deleteNeed,
    getTags
};
