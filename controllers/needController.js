const mime = require('mime');
const model =  require('../models/needModel');



async function createNeed(req, res) {
  const {NeedIs, Title, ContactPerson, Keywords, Proposal, Solution} = req.body;
  const FileData = req.file ? Buffer.from(req.file.buffer) : null;
  const FileName = req.file ? req.file.originalname : null;
  const extension = FileName ? FileName.split('.').pop() : null;
  const createdAt = new Date();
  const UserId = req.user.id;
  const parsedKeywords = JSON.parse(Keywords)
  const id = await model.insertNeed({NeedIs, Title, ContactPerson, parsedKeywords, Proposal, Solution, FileData, FileName, extension, createdAt, UserId});
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
      UserId: need.UserId
    };
    const isLocal = req.headers.host.startsWith('localhost');
    const protocol = isLocal ? 'http' : 'https';
    const ipAddress = isLocal ? 'localhost:3002' : 'www.innocloud.dk';

    const fileURL = need.HasFile === 'file' ? `${protocol}://${ipAddress}/api/v1/download/${need.id}` : 'no file';
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

  const FileData = need.FileData;
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
      const isLocal = req.headers.host.startsWith('localhost');
      const protocol = isLocal ? 'http' : 'https';
      const ipAddress = isLocal ? 'localhost:3002' : 'www.innocloud.dk';

      const fileURL = need.HasFile === 'file' ? `${protocol}://${ipAddress}/api/v1/download/${need.id}` : 'no file';
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
  const { NeedIs, Title, ContactPerson, Keywords, Proposal, Solution, UserId } = req.body;
  const FileData = req.file ? Buffer.from(req.file.buffer) : null;
  const FileName = req.file ? req.file.originalname : null;
  const extension = FileName ? FileName.split('.').pop() : null;
  const createdAt = new Date();
  const parsedKeywords = Keywords instanceof String ? JSON.parse(Keywords) : Keywords
  const need = {
    NeedIs,
    Title,
    ContactPerson,
    parsedKeywords,
    Proposal,
    Solution,
    FileData,
    FileName,
    extension,
    createdAt,
    UserId
  };

  try {
    const UserId = req.user.id;

    const existingNeed = await model.getNeedById(id);
    if (!existingNeed) {
      return res.status(404).json({ error: 'Need not found' });
    }

    if (existingNeed.UserId !== UserId) {
      return res.status(403).json({ error: 'Unauthorized to update the need' });
    }

    const isUpdated = await model.updateNeed(id, need);
    console.log(isUpdated)
    if (isUpdated) {
      res.status(200).json({ message: 'Need updated successfully' });
    } else {
      res.status(404).json({ message: 'Need not found/Need is not updated' });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to update the need' });
  }
};

async function getTags(req,res) {
  const tags =await model.getTags()
  return res.status(200).json(tags)
}

async function getRelatedNeeds(req, res) {
  try {
    const { id } = req.params;
    const needs = await model.getNeedsRelatedByTags(id)
    const responseBody = needs.map((need) => {
      const isLocal = req.headers.host.startsWith('localhost');
      const protocol = isLocal ? 'http' : 'https';
      const ipAddress = isLocal ? 'localhost:3002' : 'www.innocloud.dk';

      const fileURL = need.HasFile === 'file' ? `${protocol}://${ipAddress}/api/v1/download/${need.id}` : 'no file';
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

    res.status(200).json({ body: responseBody });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Needs could not be found' });
  }

}

async function deleted(req, res) {
  const { id } = req.params;
  try {
    const UserId = req.user.id;

    const need = await model.getNeedById(id);
    if (!need) {
      return res.status(404).json({ error: 'Need not found' });
    }

    if (need.UserId !== UserId) {
      return res.status(403).json({ error: 'Unauthorized to delete the need' });
    }

    const isDeleted = await model.deleteNeed(id, UserId);
    if (isDeleted) {
      res.status(200).json({ success: true, message: 'Need deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Need not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete need' });
  }
}

module.exports = {
  createNeed,
  getNeed,
  downloadFile,
  allNeeds,
  updated,
  deleted,
  getTags,
  getRelatedNeeds
};
