const fs = require('fs');
const path = require('path');
const mime = require('mime');
const model =  require('../models/needModel')

async function createNeed(req, res) {
  const { NeedIs, Title, ContactPerson } = req.body;
  console.log('req.file:', req.file);
  const FileData = req.file ? req.file.buffer.slice(0, req.file.buffer.length) : null;
  const originalname = req.file ? req.file.originalname : null;
  const extension = originalname ? originalname.split('.').pop() : null;
  console.log('fileData:', FileData);
  console.log('needis', req.body);
  const createdAt = new Date();
  const id = await model.insertNeed({ NeedIs, Title, ContactPerson, FileData, originalname, extension, createdAt });
  return res.json({ id });
}
/*
async function getNeed(req, res) {
  const { NeedIs, Title, ContactPerson } = req.body;
  const { id } = req.params;
  const need = await model.getNeedById(id);

  if (!need) {
    return res.status(404).json({ message: 'Need not found' });
  }
  if (need.FileData) {
    const fileData = Buffer.from(need.FileData, 'base64');
    const contentType = mime.getType('.' + need.extension);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${need.originalname}`);
    return res.json({fileData});
  }
  else {
    return res.json(need);
  }
}
*/
async function getNeed(req, res) {
  const { id } = req.params;
  const need = await model.getNeedById(id);

  if (!need) {
    return res.status(404).json({ message: 'Need not found' });
  }

  const responseBody = {
    ID: need.ID,
    NeedIs: need.NeedIs,
    Title: need.Title,
    ContactPerson: need.ContactPerson,
    CreatedAt: need.CreatedAt,
    OriginalName: need.originalname,
    Extension: need.extension,
    FileData: null
  };

  if (need.FileData) {
    responseBody.FileData = Buffer.from(need.FileData, 'base64');
    const contentType = mime.getType('.' + need.extension);
    res.status(200).set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename=${need.originalname}`
    }).send(responseBody);
    console.log(responseBody);
  } else {
    res.status(200).json(responseBody);
  }    
}

module.exports = {
  createNeed,
  getNeed,
};
