const mime = require('mime');
const model =  require('../models/needModel');

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
  
    if (!need) {
      return res.status(404).json({ message: 'Need is not found' });
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
    const isLocal = req.headers.host.startsWith('localhost');
    const ipAddress = isLocal ? 'localhost:3002' : 'www.innocloud.dk'; 
    
    const fileURL = need.HasFile === 'file' ? `${req.protocol}://${ipAddress}/api/v1/download/${need.id}` : 'no file';
    responseBody.fileURL = fileURL;
    res.json({ body: responseBody });

  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const downloadFile = async (req, res) => {
  const { id } = req.params;
  const need = await model.getNeedById(id);

  if (!need || !need.FileData) {
    return res.status(404).json({ message: 'File/Need not found' });
  }

  const FileData = Buffer.from(need.FileData, 'base64');
  const contentType = mime.getType('.' + need.extension);

  const sanitizedFileName = need.FileName.replace(/[^\w\d.]/g, '_');
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFileName}`);
  res.send(FileData);
};


const allNeeds = async (req, res) => {
  try {
    const needs = await model.getAllNeeds();

    const responseBody = needs.map((need) => {
      const fileURL = need.HasFile === 'file' ? `${req.protocol}://${req.headers.host}/api/v1/download/${need.id}` : 'no file';
      return {
        id: need.id,
        NeedIs: need.NeedIs,
        Title: need.Title,
        ContactPerson: need.ContactPerson,
        CreatedAt: need.CreatedAt,
        Keywords: need.Keywords,
        Proposal: need.Proposal, 
        Solution: need.Solution, 
        fileURL: fileURL
      };
    });

    res.json({ body: responseBody });
  } catch(error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updated = async (req, res) => {
  const { id } = req.params;
  const { NeedIs, Title, ContactPerson, Keywords, Proposal, Solution } = req.body;
  const FileData = req.file ? Buffer.from(req.file.buffer) : null;
  const FileName = req.file ? req.file.originalname : null;
  const extension = FileName ? FileName.split('.').pop() : null;
  const createdAt = new Date();

  const updatedData = {
    NeedIs,
    Title,
    ContactPerson,
    Keywords,
    Proposal,
    Solution,
    FileData,
    FileName,
    extension,
    createdAt,
  };

  try {
    await model.updateNeed(id, updatedData);
    res.json({ message: 'Need updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update the need' });
  }
};

async function deleted(req, res) {
  const { id } = req.params;

  try {
    const isDeleted = await model.deleteNeed(id);
    if (isDeleted) {
      res.status(200).json({ success: true, message: 'Need deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Need not found' });
    }
  } catch (error) {
    console.error('Error deleting need:', error);
    res.status(500).json({ success: false, message: 'Failed to delete need' });
  }
}

module.exports = {
  createNeed,
  getNeed,
  downloadFile,
  allNeeds,
  updated,
  deleted
};
