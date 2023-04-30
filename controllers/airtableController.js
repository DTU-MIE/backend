/*const sql = require('mssql');
const Airtable = require('airtable');

const {
    MSSQL_USER,
    MSSQL_SA_PASSWORD,
    MSSQL_HOST,
    API_KEY,
    BASE_KEY
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

// Airtable credentials and base information
const base = new Airtable({ apiKey: API_KEY }).base(BASE_KEY);
const table = base('Need');

const pool = new sql.ConnectionPool(dbConfig);

// transfer data from Airtable to azure database
const intergrateNeed = async (req, res) => {
  try {
    // Get records from Airtable
    const records = await table.select().all();

    // Loop for each records and insert them into azure database
    records.forEach(async (record) => {
    await pool.connect();
    const request = pool.request();
    const fileData = Buffer.from(record.get('FileData')[0].url);
    const fileName = record.get('FileData')[0].filename;
    const fileExtension = fileName.split('.').pop();

    request
    .input('NeedIs', record.get('NeedIs'))
    .input('Title', record.get('Title'))
    .input('ContactPerson', record.get('ContactPerson'))
    .input('FileData', fileData)
    .input('FileName', fileName)
    .input('extension', fileExtension); 
    // input for each field 
    const query = `INSERT INTO NEED (NeedIs, Title, ContactPerson, FileData, FileName, extension) VALUES (@NeedIs, @Title, @ContactPerson, @FileData, @FileName, @extension)`;
    await request.query(query);
    });
    res.status(200).send('Data for mie transferred successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error transferring mie data');
  }
};
// transfer data from Airtable to azure database
/*const intergrateNeed = async (req, res) => {
  try {
    // Get records from Airtable
    const records = await table.select().all();

    // Loop for each record and insert them into azure database
    for (const record of records) {
      await pool.connect();
      const request = pool.request();
      const title = record.get('Title');
      const existingRecord = await pool.request().query(`SELECT * FROM NEED WHERE Title = '${title}'`);
      if (existingRecord.recordset.length === 0) {
        const fileData = Buffer.from(record.get('FileData')[0].url);
        const fileName = record.get('FileData')[0].filename;
        const fileExtension = fileName.split('.').pop();

    request
    .input('NeedIs', record.get('NeedIs'))
    .input('Title', record.get('Title'))
    .input('ContactPerson', record.get('ContactPerson'))
    .input('FileData', fileData)
    .input('FileName', fileName)
    .input('extension', fileExtension); 
    // input for each field 
    const query = `INSERT INTO NEED (NeedIs, Title, ContactPerson, FileData, FileName, extension) VALUES (@NeedIs, @Title, @ContactPerson, @FileData, @FileName, @extension)`;
    await request.query(query);
    }
  };
    res.status(200).send('Data for mie transferred successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error transferring mie data');
  }
};*/

// module.exports = {
//     intergrateNeed
//   };

//  */ 
