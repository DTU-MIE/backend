const sql = require('mssql');
const Airtable = require('airtable');
const { dbConfig, API_KEY, BASE_KEY } = require("../config/config");

//Airtable credentials and base information
const base = new Airtable({ apiKey: API_KEY }).base(BASE_KEY);
const table = base('Need');

const pool = new sql.ConnectionPool(dbConfig);

//transfer data from Airtable to azure database
const intergrateNeed = async (req, res) => {
  try {
    // Get records from Airtable
    const records = await table.select().all();

    // Loop for each records and insert them into azure database
    records.forEach(async (record) => {
    await pool.connect();
    const request = pool.request();
    const fileData = record.get('FileData') ? Buffer.from(record.get('FileData')[0].url) : null;
    const fileName = record.get('FileData') ? record.get('FileData')[0].filename : null;    
    const fileExtension = fileName ? fileName.split('.').pop() : null;

    request
    .input('NeedIs', record.get('NeedIs'))
    .input('Title', record.get('Title'))
    .input('ContactPerson', record.get('ContactPerson'))
    .input('Keywords', record.get('Keywords'))
    .input('Proposal', record.get('Proposal')) 
    .input('Solution', record.get('Solution'))
    .input('FileData', fileData)
    .input('FileName', fileName)
    .input('extension', fileExtension); 

    const query = `INSERT INTO NEED (NeedIs, Title, ContactPerson, Keywords,
      Proposal, Solution, FileData, FileName, extension) VALUES (@NeedIs, @Title, @ContactPerson, @Keywords,
        @Proposal, @Solution, CONVERT(varbinary(max), @FileData), @FileName, @extension)`;
    await request.query(query);
    });
    res.status(200).send('Data for mie transferred successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error transferring mie data');
  }
};

module.exports = {
     intergrateNeed
   };


