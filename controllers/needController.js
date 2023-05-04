const mime = require('mime');
const model =  require('../models/needModel')

async function createNeed(req, res) {
  const {NeedIs, Title, ContactPerson, Keywords, Proposal, Solution} = req.body;
  const FileData = req.file ? Buffer.from(req.file.buffer) : null;
  const FileName = req.file ? req.file.originalname : null;
  const extension = FileName ? FileName.split('.').pop() : null;
  const createdAt = new Date();
  const id = await model.insertNeed({NeedIs, Title, ContactPerson, Keywords, Proposal, Solution, FileData, FileName, extension, createdAt});
  return res.json({ id });
}

const getNeed = async (req, res) => {
  try {
    const { id } = req.params;
    const need = await model.getNeedById(id);
  
    if (!need){
      return res.status(404).json({message: 'Need is not found'});
    } 

    const responseBody = {
      id: need.id,
      NeedIs: need.NeedIs,
      Title: need.Title,
      ContactPerson: need.ContactPerson,
      Keywords: need.Keywords,
      Proposal: need.Proposal, 
      Solution: need.Solution, 
      CreatedAt: need.CreatedAt,
    };

    const fileURL = `${req.protocol}://${req.headers.host}/api/v1/download/${id}`;
    responseBody.fileURL = `<a href="${fileURL}">${need.FileName}</a>`;
    res.json({ body: responseBody });

  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Need not found: Internal Server Error' });
  }
};

const downloadFile = async (req, res) => {
  const { id } = req.params;
  const need = await model.getNeedById(id);

  if (!need || !need.FileData) {
    return res.status(404).json({message: 'File/Need not found'});
  }

  const FileData = Buffer.from(need.FileData, 'base64');
  const contentType = mime.getType('.' + need.extension);
  
  res.set({
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename=${need.FileName}`,
  }).send(FileData);
};

const allNeeds = async (req, res) => {
  try {
    const needs = await model.getAllNeeds();

    const responseBody = needs.map((need) => {
      const fileURL = `${req.protocol}://${req.headers.host}/api/v1/download/${need.id}`;
      return {
        id: need.id,
        NeedIs: need.NeedIs,
        Title: need.Title,
        ContactPerson: need.ContactPerson,
        CreatedAt: need.CreatedAt,
        Keywords: need.Keywords,
        Proposal: need.Proposal, 
        Solution: need.Solution, 
        fileURL: `<a href="${fileURL}">${need.FileName}</a>`,
      };
    });

    res.json({ body: responseBody });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};







module.exports = {
  createNeed,
  getNeed,
  downloadFile,
  allNeeds
};
